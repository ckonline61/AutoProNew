import { EmergencyRequest, IEmergencyRequest } from '../models/emergency-request.model';
import { Mechanic } from '../models/mechanic.model';
import { EmergencyStatus, EmergencyType, MechanicApprovalStatus, UserRole } from '../types';
import { User } from '../models/user.model';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../errors/app-error';
import { assertEmergencyTransition, EmergencyActor, emergencyScope } from './emergency-policy';
import { Vehicle } from '../models/vehicle.model';
import { CreateEmergencyRequestInput, EmergencyQueryInput } from '../validators/emergency.validator';

const BASE_PRICING: Record<EmergencyType, number> = {
  [EmergencyType.JUMP_START]: 499,
  [EmergencyType.BATTERY_PROBLEM]: 599,
  [EmergencyType.FLAT_TYRE]: 399,
  [EmergencyType.TYRE_REPLACEMENT]: 699,
  [EmergencyType.FUEL_EMERGENCY]: 499,
  [EmergencyType.BREAKDOWN]: 799,
  [EmergencyType.ENGINE_PROBLEM]: 899,
  [EmergencyType.ACCIDENT_ASSISTANCE]: 1499,
  [EmergencyType.TOWING]: 1999,
  [EmergencyType.OTHER]: 499,
};

export class EmergencyService {
  public async assignProvider(requestId: string, providerId: string, actor: EmergencyActor): Promise<IEmergencyRequest> {
    if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(actor.role)) throw new ForbiddenError('Administrator required');
    const [mechanic, user] = await Promise.all([
      Mechanic.exists({ userId: providerId, isApproved: true, approvalStatus: MechanicApprovalStatus.APPROVED, isOnline: true, isAvailable: true }),
      User.exists({ _id: providerId, role: UserRole.MECHANIC, isActive: true }),
    ]);
    if (!mechanic || !user) throw new BadRequestError('Choose an active, approved and available mechanic');
    const assigned = await EmergencyRequest.findOneAndUpdate(
      { _id: requestId, status: { $in: [EmergencyStatus.PENDING, EmergencyStatus.SEARCHING, EmergencyStatus.REJECTED, EmergencyStatus.ASSIGNED] }, isActive: true },
      { $set: { assignedProviderId: providerId, status: EmergencyStatus.ASSIGNED }, $push: { statusHistory: { status: EmergencyStatus.ASSIGNED, timestamp: new Date(), updatedBy: actor.id, reason: 'Dispatched by administrator' } } },
      { new: true, runValidators: true }
    );
    if (!assigned) throw new ConflictError('Request is unavailable or already accepted. Refresh and retry.');
    return assigned;
  }
  /**
   * Generate human-readable emergency request number (e.g. EM-20261012-XXXX).
   */
  private generateRequestNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `EM-${dateStr}-${randomSuffix}`;
  }

  /**
   * Helper to compute approximate distance in kilometers between two geo-coordinates.
   */
  public calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Find nearest online and available approved mechanic within max radius (e.g. 25km).
   */
  public async findNearestProvider(
    lat: number,
    lon: number,
    maxRadiusKm: number = 25
  ): Promise<{ providerUserId: string; distanceKm: number } | null> {
    const mechanics = await Mechanic.find({
      approvalStatus: MechanicApprovalStatus.APPROVED,
      isOnline: true,
      isAvailable: true,
      'currentLocation.latitude': { $exists: true },
      'currentLocation.longitude': { $exists: true },
    });

    let nearest: { providerUserId: string; distanceKm: number } | null = null;
    let minDistance = maxRadiusKm;

    for (const m of mechanics) {
      if (m.currentLocation) {
        const dist = this.calculateDistanceKm(
          lat,
          lon,
          m.currentLocation.latitude,
          m.currentLocation.longitude
        );

        if (dist < minDistance) {
          minDistance = dist;
          nearest = {
            providerUserId: m.userId.toString(),
            distanceKm: Math.round(dist * 10) / 10,
          };
        }
      }
    }

    return nearest;
  }

  /**
   * Rapid SOS emergency request creation with auto-matching.
   */
  public async createSOS(
    customerId: string,
    data: CreateEmergencyRequestInput
  ): Promise<IEmergencyRequest> {
    if (data.vehicleId && !await Vehicle.exists({ _id: data.vehicleId, userId: customerId, isActive: true })) {
      throw new NotFoundError('Vehicle not found or does not belong to you');
    }
    const requestNumber = this.generateRequestNumber();
    const estimatedPrice = BASE_PRICING[data.problemType] || 499;

    // Search for nearest provider
    const nearest = await this.findNearestProvider(data.latitude, data.longitude);

    const initialStatus = nearest ? EmergencyStatus.ASSIGNED : EmergencyStatus.SEARCHING;
    const estimatedArrival = nearest ? Math.max(10, Math.round(nearest.distanceKm * 3)) : 20;

    const request = await EmergencyRequest.create({
      requestNumber,
      customerId,
      vehicleId: data.vehicleId,
      problemType: data.problemType,
      description: data.description,
      priority: data.priority,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      assignedProviderId: nearest?.providerUserId,
      status: initialStatus,
      estimatedArrival,
      estimatedPrice,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: new Date(),
          reason: nearest
            ? `Assigned to nearest provider (${nearest.distanceKm} km away)`
            : 'Searching for nearby available emergency providers',
        },
      ],
      isActive: true,
    });

    return request;
  }

  /**
   * Get single emergency request by ID.
   */
  public async getById(requestId: string, actor: EmergencyActor): Promise<IEmergencyRequest> {
    const request = await EmergencyRequest.findOne({
      ...emergencyScope(actor, 'read'),
      _id: requestId,
      isActive: true,
    })
      .populate('customerId', 'name phone')
      .populate('vehicleId', 'brand model registrationNumber')
      .populate('assignedProviderId', 'name phone');

    if (!request) {
      throw new NotFoundError('Emergency request not found');
    }

    return request;
  }

  /**
   * Get emergency requests for a customer.
   */
  public async getCustomerRequests(
    customerId: string,
    query: EmergencyQueryInput
  ): Promise<{
    requests: IEmergencyRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      customerId,
      isActive: true,
    };

    if (query.status) {
      filter.status = query.status;
    }

    const [requests, total] = await Promise.all([
      EmergencyRequest.find(filter)
        .populate('assignedProviderId', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      EmergencyRequest.countDocuments(filter),
    ]);

    return {
      requests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get emergency requests assigned to a provider.
   */
  public async getProviderRequests(providerId: string): Promise<IEmergencyRequest[]> {
    return EmergencyRequest.find({
      assignedProviderId: providerId,
      status: {
        $in: [
          EmergencyStatus.ASSIGNED,
          EmergencyStatus.ACCEPTED,
          EmergencyStatus.EN_ROUTE,
          EmergencyStatus.ARRIVED,
          EmergencyStatus.IN_PROGRESS,
        ],
      },
      isActive: true,
    })
      .populate('customerId', 'name phone')
      .populate('vehicleId')
      .sort({ createdAt: -1 });
  }

  /**
   * Provider accepts emergency request.
   */
  public async acceptRequest(
    providerId: string,
    requestId: string
  ): Promise<IEmergencyRequest> {
    if (!await Mechanic.exists({ userId: providerId, isApproved: true, isOnline: true, approvalStatus: MechanicApprovalStatus.APPROVED })) {
      throw new ForbiddenError('Mechanic must be approved and online to accept requests');
    }
    const request = await EmergencyRequest.findOne({
      _id: requestId,
      assignedProviderId: providerId,
      isActive: true,
    });

    if (!request) {
      throw new NotFoundError('Emergency request not found or not assigned to you');
    }

    if (request.status !== EmergencyStatus.ASSIGNED) {
      throw new BadRequestError('Request is not in ASSIGNED state');
    }

    const accepted = await EmergencyRequest.findOneAndUpdate(
      { _id: requestId, assignedProviderId: providerId, status: EmergencyStatus.ASSIGNED, isActive: true },
      { $set: { status: EmergencyStatus.ACCEPTED }, $push: { statusHistory: { status: EmergencyStatus.ACCEPTED, timestamp: new Date(), reason: 'Accepted by emergency provider' } } },
      { new: true, runValidators: true }
    );
    if (!accepted) throw new ConflictError('Request changed. Refresh and retry.');
    return accepted;
  }

  /**
   * Update emergency request progress status.
   */
  public async updateStatus(
    requestId: string,
    nextStatus: EmergencyStatus,
    notes: string | undefined,
    actor: EmergencyActor
  ): Promise<IEmergencyRequest> {
    const request = await EmergencyRequest.findOne({
      ...emergencyScope(actor, 'update'),
      _id: requestId,
      isActive: true,
    });

    if (!request) {
      throw new NotFoundError('Emergency request not found');
    }

    assertEmergencyTransition(request.status, nextStatus);
    const updated = await EmergencyRequest.findOneAndUpdate(
      { _id: requestId, ...emergencyScope(actor, 'update'), status: request.status, isActive: true },
      { $set: { status: nextStatus, ...(nextStatus === EmergencyStatus.COMPLETED ? { finalPrice: request.estimatedPrice } : {}) }, $push: { statusHistory: { status: nextStatus, timestamp: new Date(), updatedBy: actor.id, reason: notes || `Status updated to ${nextStatus}` } } },
      { new: true, runValidators: true }
    );
    if (!updated) throw new ConflictError('Request changed. Refresh and retry.');
    if (![EmergencyStatus.EN_ROUTE, EmergencyStatus.ARRIVED].includes(nextStatus) && updated.assignedProviderId) {
      await Mechanic.updateOne({ userId: updated.assignedProviderId }, { $unset: { currentLocation: 1 } });
    }
    return updated;
  }

  /**
   * Cancel emergency request with policy reason.
   */
  public async cancel(
    requestId: string,
    cancelledBy: string,
    reason: string,
    actor: EmergencyActor
  ): Promise<IEmergencyRequest> {
    const request = await EmergencyRequest.findOne({
      ...emergencyScope(actor, 'cancel'),
      _id: requestId,
      isActive: true,
    });

    if (!request) {
      throw new NotFoundError('Emergency request not found');
    }

    assertEmergencyTransition(request.status, EmergencyStatus.CANCELLED);
    const cancelled = await EmergencyRequest.findOneAndUpdate(
      { _id: requestId, ...emergencyScope(actor, 'cancel'), status: request.status, isActive: true },
      { $set: { status: EmergencyStatus.CANCELLED, cancelledBy, cancellationReason: reason }, $push: { statusHistory: { status: EmergencyStatus.CANCELLED, timestamp: new Date(), updatedBy: actor.id, reason } } },
      { new: true, runValidators: true }
    );
    if (!cancelled) throw new ConflictError('Request changed. Refresh and retry.');
    if (cancelled.assignedProviderId) await Mechanic.updateOne({ userId: cancelled.assignedProviderId }, { $unset: { currentLocation: 1 } });
    return cancelled;
  }
}

export const emergencyService = new EmergencyService();
