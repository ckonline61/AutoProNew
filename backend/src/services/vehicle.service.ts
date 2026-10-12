import { Vehicle, IVehicle } from '../models/vehicle.model';
import { NotFoundError } from '../errors/app-error';
import { CreateVehicleInput, UpdateVehicleInput } from '../validators/vehicle.validator';

export class VehicleService {
  /**
   * Create a new vehicle for the authenticated user.
   */
  public async create(userId: string, data: CreateVehicleInput): Promise<IVehicle> {
    const vehicle = await Vehicle.create({
      ...data,
      userId,
      isActive: true,
    });

    return vehicle;
  }

  /**
   * Get all active vehicles belonging to the user.
   */
  public async getAll(userId: string): Promise<IVehicle[]> {
    return Vehicle.find({ userId, isActive: true }).sort({ createdAt: -1 });
  }

  /**
   * Get a single vehicle by ID, ensuring ownership and active status.
   */
  public async getById(userId: string, vehicleId: string): Promise<IVehicle> {
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      userId,
      isActive: true,
    });

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    return vehicle;
  }

  /**
   * Update a vehicle, ensuring ownership.
   */
  public async update(
    userId: string,
    vehicleId: string,
    data: UpdateVehicleInput
  ): Promise<IVehicle> {
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      userId,
      isActive: true,
    });

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    Object.assign(vehicle, data);
    await vehicle.save();

    return vehicle;
  }

  /**
   * Soft delete a vehicle (set isActive=false), ensuring ownership.
   */
  public async remove(userId: string, vehicleId: string): Promise<IVehicle> {
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      userId,
      isActive: true,
    });

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    vehicle.isActive = false;
    await vehicle.save();

    return vehicle;
  }
}

export const vehicleService = new VehicleService();
