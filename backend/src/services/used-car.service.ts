import { Types } from 'mongoose';
import { UsedCarListing, IUsedCarListing, IUsedCarLocation } from '../models/used-car-listing.model';
import { FuelType, ListingStatus } from '../types';
import { ForbiddenError, NotFoundError } from '../errors/app-error';

export interface CreateListingData {
  brand: string;
  model: string;
  variant?: string;
  year: number;
  fuelType: FuelType;
  mileage: number;
  price: number;
  negotiable?: boolean;
  description: string;
  images?: string[];
  location: IUsedCarLocation;
}

export interface UpdateListingData {
  brand?: string;
  model?: string;
  variant?: string;
  year?: number;
  fuelType?: FuelType;
  mileage?: number;
  price?: number;
  negotiable?: boolean;
  description?: string;
  images?: string[];
  location?: IUsedCarLocation;
  status?: ListingStatus;
}

export interface ListingFilters {
  brand?: string;
  model?: string;
  fuelType?: FuelType;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  city?: string;
  search?: string;
}

export class UsedCarService {
  /**
   * Create a new car listing.
   */
  async createListing(userId: string, data: CreateListingData): Promise<IUsedCarListing> {
    const listing = await UsedCarListing.create({
      ...data,
      sellerId: new Types.ObjectId(userId),
      status: ListingStatus.ACTIVE,
      viewCount: 0,
      isActive: true,
    });

    return listing;
  }

  /**
   * Get public active listings with filters and pagination.
   */
  async getListings(filters: ListingFilters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {
      status: ListingStatus.ACTIVE,
      isActive: true,
    };

    if (filters.brand) {
      query.brand = new RegExp(filters.brand.trim(), 'i');
    }

    if (filters.model) {
      query.model = new RegExp(filters.model.trim(), 'i');
    }

    if (filters.fuelType) {
      query.fuelType = filters.fuelType;
    }

    if (filters.city) {
      query['location.city'] = new RegExp(filters.city.trim(), 'i');
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        (query.price as Record<string, unknown>).$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        (query.price as Record<string, unknown>).$lte = filters.maxPrice;
      }
    }

    if (filters.minYear !== undefined || filters.maxYear !== undefined) {
      query.year = {};
      if (filters.minYear !== undefined) {
        (query.year as Record<string, unknown>).$gte = filters.minYear;
      }
      if (filters.maxYear !== undefined) {
        (query.year as Record<string, unknown>).$lte = filters.maxYear;
      }
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { brand: searchRegex },
        { model: searchRegex },
        { variant: searchRegex },
        { description: searchRegex },
      ];
    }

    const [listings, total] = await Promise.all([
      UsedCarListing.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sellerId', 'name email phone avatar')
        .populate('inspectionReportId'),
      UsedCarListing.countDocuments(query),
    ]);

    return {
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get listing by ID and increment view count.
   */
  async getListingById(id: string): Promise<IUsedCarListing> {
    const listing = await UsedCarListing.findOneAndUpdate(
      { _id: id, isActive: true },
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate('sellerId', 'name email phone avatar')
      .populate('inspectionReportId');

    if (!listing) {
      throw new NotFoundError('Car listing not found');
    }

    return listing;
  }

  /**
   * Get all listings created by a specific user.
   */
  async getUserListings(userId: string): Promise<IUsedCarListing[]> {
    const listings = await UsedCarListing.find({
      sellerId: new Types.ObjectId(userId),
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate('inspectionReportId');

    return listings;
  }

  /**
   * Update listing with ownership check.
   */
  async updateListing(
    userId: string,
    listingId: string,
    data: UpdateListingData
  ): Promise<IUsedCarListing> {
    const listing = await UsedCarListing.findOne({ _id: listingId, isActive: true });
    if (!listing) {
      throw new NotFoundError('Car listing not found');
    }

    if (listing.sellerId.toString() !== userId) {
      throw new ForbiddenError('You can only update your own listings');
    }

    Object.assign(listing, data);
    await listing.save();
    return listing;
  }

  /**
   * Soft delete listing with ownership check.
   */
  async removeListing(userId: string, listingId: string): Promise<IUsedCarListing> {
    const listing = await UsedCarListing.findOne({ _id: listingId, isActive: true });
    if (!listing) {
      throw new NotFoundError('Car listing not found');
    }

    if (listing.sellerId.toString() !== userId) {
      throw new ForbiddenError('You can only remove your own listings');
    }

    listing.status = ListingStatus.REMOVED;
    listing.isActive = false;
    await listing.save();
    return listing;
  }
}

export const usedCarService = new UsedCarService();
