import { Booking } from '../models/booking.model';
import { Mechanic, IMechanic } from '../models/mechanic.model';
import { Service, IService } from '../models/service.model';
import { Vehicle } from '../models/vehicle.model';
import { Address } from '../models/address.model';
import { User } from '../models/user.model';
import { SparePart, ISparePart } from '../models/spare-part.model';
import { UsedCarListing, IUsedCarListing } from '../models/used-car-listing.model';
import { locationService } from './location.service';
import { BookingStatus, ListingStatus } from '../types';
import { BadRequestError, NotFoundError } from '../errors/app-error';

export interface RecommendedMechanic {
  mechanic: IMechanic;
  score: number;
  rating: number;
  activeJobs: number;
  distanceKm?: number;
  matchReasons: string[];
}

export interface PriceEstimateResult {
  minEstimate: number;
  maxEstimate: number;
  basePrice: number;
  multiplier: number;
}

export interface BookingInsightsResult {
  totalBookings: number;
  totalSpent: number;
  mostUsedServices: Array<{ serviceId: string; name: string; count: number }>;
  averageBookingFrequency: string;
  nextRecommendedServiceDate: string | null;
  preferredMechanic: {
    mechanicId: string;
    name: string;
    bookingCount: number;
  } | null;
}

export interface SmartSearchResult {
  services: Array<IService & { relevanceScore?: number }>;
  spareParts: Array<ISparePart & { relevanceScore?: number }>;
  usedCars: Array<IUsedCarListing & { relevanceScore?: number }>;
}

export class AiService {
  /**
   * Smart Mechanic Recommendation:
   * Recommends top 3 mechanics for a given booking based on availability,
   * distance, rating, specialization match, and current workload.
   */
  public async recommendMechanic(bookingId: string): Promise<RecommendedMechanic[]> {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    let addressLat: number | undefined;
    let addressLng: number | undefined;

    if (booking.addressId) {
      const address = await Address.findById(booking.addressId);
      if (address && address.latitude !== undefined && address.longitude !== undefined) {
        addressLat = address.latitude;
        addressLng = address.longitude;
      }
    }

    // Fetch booking services and their categories
    const services = await Service.find({ _id: { $in: booking.serviceIds } }).populate('categoryId');
    const serviceNames = services.map((s) => s.name.toLowerCase());
    const categoryNames = services
      .map((s) => (s.categoryId as unknown as { name?: string })?.name?.toLowerCase())
      .filter(Boolean) as string[];

    // Fetch approved and available mechanics
    const mechanics = await Mechanic.find({
      isApproved: true,
      isAvailable: true,
    }).populate('userId', 'name email phone avatar');

    if (mechanics.length === 0) {
      return [];
    }

    const scoredMechanics: RecommendedMechanic[] = [];

    for (const mechanic of mechanics) {
      const matchReasons: string[] = [];

      // 1. Workload (fewer active jobs = higher score)
      const activeJobs = await Booking.countDocuments({
        mechanicId: mechanic.userId,
        status: {
          $in: [
            BookingStatus.ASSIGNED,
            BookingStatus.ACCEPTED,
            BookingStatus.EN_ROUTE,
            BookingStatus.ARRIVED,
            BookingStatus.IN_PROGRESS,
          ],
        },
      });

      const workloadScore = Math.max(0, 15 - activeJobs * 5);
      if (activeJobs === 0) {
        matchReasons.push('Available immediately with zero active jobs');
      }

      // 2. Rating score (up to 30 points)
      const rating = mechanic.rating || 0;
      const ratingScore = (rating / 5) * 30;
      if (rating >= 4.5) {
        matchReasons.push(`Top-rated mechanic (${rating} / 5 stars)`);
      }

      // 3. Distance calculation
      let distanceKm: number | undefined;
      let distanceScore = 15; // default fallback when location is unavailable

      if (
        mechanic.currentLocation?.latitude !== undefined &&
        mechanic.currentLocation?.longitude !== undefined &&
        addressLat !== undefined &&
        addressLng !== undefined
      ) {
        const distResult = locationService.calculateDistance(
          mechanic.currentLocation.latitude,
          mechanic.currentLocation.longitude,
          addressLat,
          addressLng
        );
        distanceKm = distResult.distanceKm;

        if (distanceKm <= 5) {
          distanceScore = 25;
          matchReasons.push(`Nearby mechanic (~${distanceKm} km away)`);
        } else if (distanceKm <= 10) {
          distanceScore = 20;
          matchReasons.push(`Within 10 km service radius (~${distanceKm} km away)`);
        } else if (distanceKm <= 20) {
          distanceScore = 15;
        } else if (distanceKm <= 35) {
          distanceScore = 10;
        } else {
          distanceScore = 5;
        }
      }

      // 4. Specialization match (up to 30 points)
      let specScore = 10;
      const matchedSpecs: string[] = [];
      const specs = (mechanic.specializations || []).map((s) => s.toLowerCase());

      for (const spec of specs) {
        const matchedCategory = categoryNames.some(
          (c) => c.includes(spec) || spec.includes(c)
        );
        const matchedService = serviceNames.some(
          (s) => s.includes(spec) || spec.includes(s)
        );

        if (matchedCategory || matchedService) {
          matchedSpecs.push(spec);
        }
      }

      if (matchedSpecs.length > 0) {
        specScore = Math.min(30, 15 + matchedSpecs.length * 10);
        matchReasons.push(`Specialized in: ${matchedSpecs.join(', ')}`);
      }

      const totalScore = Math.min(
        100,
        Math.round(ratingScore + distanceScore + specScore + workloadScore)
      );

      scoredMechanics.push({
        mechanic,
        score: totalScore,
        rating,
        activeJobs,
        distanceKm,
        matchReasons,
      });
    }

    // Sort descending by score and pick top 3
    scoredMechanics.sort((a, b) => b.score - a.score);
    return scoredMechanics.slice(0, 3);
  }

  /**
   * Service Price Estimator:
   * Computes estimated price range applying vehicle type multipliers.
   */
  public async estimatePrice(
    serviceIds: string[],
    vehicleId?: string
  ): Promise<PriceEstimateResult> {
    const services = await Service.find({
      _id: { $in: serviceIds },
      isActive: true,
    });

    if (services.length === 0) {
      throw new BadRequestError('No valid services found for price estimation');
    }

    const basePrice = services.reduce(
      (sum, s) => sum + (s.discountedPrice !== undefined && s.discountedPrice !== null ? s.discountedPrice : s.price),
      0
    );

    let multiplier = 1.0;

    if (vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (vehicle) {
        const luxuryBrands = [
          'bmw',
          'mercedes',
          'mercedes-benz',
          'audi',
          'jaguar',
          'land rover',
          'porsche',
          'lexus',
          'volvo',
          'ferrari',
          'lamborghini',
          'bentley',
          'rolls-royce',
        ];
        const suvKeywords = [
          'suv',
          'thar',
          'scorpio',
          'fortuner',
          'creta',
          'harrier',
          'safari',
          'xuv',
          'innova',
          'hector',
          'compass',
          'seltos',
          'duster',
          'brezza',
          'nexon',
        ];
        const sedanKeywords = [
          'sedan',
          'city',
          'verna',
          'ciaz',
          'virtus',
          'slavia',
          'civic',
          'corolla',
          'octavia',
          'superb',
          'camry',
          'elantra',
          'accord',
        ];

        const brand = vehicle.brand.toLowerCase();
        const model = vehicle.model.toLowerCase();
        const variant = (vehicle.variant || '').toLowerCase();

        if (luxuryBrands.some((lb) => brand.includes(lb) || model.includes(lb))) {
          multiplier = 1.5;
        } else if (
          suvKeywords.some(
            (sk) => brand.includes(sk) || model.includes(sk) || variant.includes(sk)
          )
        ) {
          multiplier = 1.2;
        } else if (
          sedanKeywords.some(
            (sk) => brand.includes(sk) || model.includes(sk) || variant.includes(sk)
          )
        ) {
          multiplier = 1.1;
        }
      }
    }

    const minEstimate = Math.round(basePrice * multiplier * 0.95);
    const maxEstimate = Math.round(basePrice * multiplier * 1.15);

    return {
      minEstimate,
      maxEstimate,
      basePrice,
      multiplier,
    };
  }

  /**
   * Booking Insights:
   * Analyzes booking history for a user to identify total spend,
   * frequency, top services, preferred mechanic, and upcoming maintenance.
   */
  public async getBookingInsights(userId: string): Promise<BookingInsightsResult> {
    const bookings = await Booking.find({ customerId: userId })
      .populate('serviceIds')
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;

    const totalSpent = bookings.reduce((sum, b) => {
      if (b.status === BookingStatus.COMPLETED) {
        return sum + (b.finalPrice ?? b.estimatedPrice ?? 0);
      }
      return sum;
    }, 0);

    // Analyze most used services
    const serviceFrequencyMap = new Map<string, { serviceId: string; name: string; count: number }>();
    const mechanicFrequencyMap = new Map<string, number>();

    for (const booking of bookings) {
      if (booking.serviceIds && Array.isArray(booking.serviceIds)) {
        for (const rawService of booking.serviceIds) {
          const service = rawService as unknown as IService;
          if (service && service._id) {
            const idStr = service._id.toString();
            const existing = serviceFrequencyMap.get(idStr);
            if (existing) {
              existing.count += 1;
            } else {
              serviceFrequencyMap.set(idStr, {
                serviceId: idStr,
                name: service.name || 'Service',
                count: 1,
              });
            }
          }
        }
      }

      if (booking.mechanicId) {
        const mechIdStr = booking.mechanicId.toString();
        mechanicFrequencyMap.set(mechIdStr, (mechanicFrequencyMap.get(mechIdStr) || 0) + 1);
      }
    }

    const mostUsedServices = Array.from(serviceFrequencyMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate average booking frequency
    let averageBookingFrequency = 'No booking history';
    if (totalBookings >= 2) {
      const oldestDate = bookings[bookings.length - 1].createdAt.getTime();
      const newestDate = bookings[0].createdAt.getTime();
      const intervalDays = Math.round(
        (newestDate - oldestDate) / (1000 * 60 * 60 * 24 * (totalBookings - 1))
      );
      averageBookingFrequency =
        intervalDays > 0 ? `Every ${intervalDays} days` : 'Multiple bookings per day';
    } else if (totalBookings === 1) {
      averageBookingFrequency = 'Single booking recorded';
    }

    // Calculate next recommended service date (90 days from latest service)
    let nextRecommendedServiceDate: string | null = null;
    if (totalBookings > 0) {
      const latestService = bookings[0];
      const baseDate = latestService.scheduledDate || latestService.createdAt;
      const nextDate = new Date(new Date(baseDate).getTime() + 90 * 24 * 60 * 60 * 1000);
      nextRecommendedServiceDate = nextDate.toISOString();
    }

    // Determine preferred mechanic
    let preferredMechanic: BookingInsightsResult['preferredMechanic'] = null;
    let maxMechCount = 0;
    let preferredMechId: string | null = null;

    for (const [mId, count] of mechanicFrequencyMap.entries()) {
      if (count > maxMechCount) {
        maxMechCount = count;
        preferredMechId = mId;
      }
    }

    if (preferredMechId) {
      const mechUser = await User.findById(preferredMechId);
      preferredMechanic = {
        mechanicId: preferredMechId,
        name: mechUser?.name || 'Assigned Mechanic',
        bookingCount: maxMechCount,
      };
    }

    return {
      totalBookings,
      totalSpent,
      mostUsedServices,
      averageBookingFrequency,
      nextRecommendedServiceDate,
      preferredMechanic,
    };
  }

  /**
   * Smart Search:
   * Unified search across services, spare parts, and used cars with relevance scoring.
   */
  public async smartSearch(query: string): Promise<SmartSearchResult> {
    const trimmed = query.trim();
    const regex = new RegExp(trimmed, 'i');

    const [services, spareParts, usedCars] = await Promise.all([
      Service.find({
        isActive: true,
        $or: [{ name: regex }, { description: regex }],
      })
        .populate('categoryId')
        .limit(15),
      SparePart.find({
        isActive: true,
        $or: [{ name: regex }, { description: regex }, { brand: regex }, { categoryTag: regex }],
      }).limit(15),
      UsedCarListing.find({
        isActive: true,
        status: ListingStatus.ACTIVE,
        $or: [{ brand: regex }, { model: regex }, { description: regex }],
      }).limit(15),
    ]);

    const calculateScore = (name: string, desc?: string, extra?: string): number => {
      const q = trimmed.toLowerCase();
      const n = name.toLowerCase();
      const d = (desc || '').toLowerCase();
      const e = (extra || '').toLowerCase();

      if (n === q) return 100;
      if (n.startsWith(q)) return 80;
      if (n.includes(q)) return 60;
      if (e.includes(q)) return 40;
      if (d.includes(q)) return 20;
      return 10;
    };

    const scoredServices = services
      .map((s) => ({
        ...s.toObject(),
        relevanceScore: calculateScore(s.name, s.description),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    const scoredSpareParts = spareParts
      .map((sp) => ({
        ...sp.toObject(),
        relevanceScore: calculateScore(sp.name, sp.description, `${sp.brand} ${sp.categoryTag}`),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    const scoredUsedCars = usedCars
      .map((car) => ({
        ...car.toObject(),
        relevanceScore: calculateScore(`${car.brand} ${car.model}`, car.description),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      services: scoredServices as unknown as Array<IService & { relevanceScore?: number }>,
      spareParts: scoredSpareParts as unknown as Array<ISparePart & { relevanceScore?: number }>,
      usedCars: scoredUsedCars as unknown as Array<IUsedCarListing & { relevanceScore?: number }>,
    };
  }
}

export const aiService = new AiService();
