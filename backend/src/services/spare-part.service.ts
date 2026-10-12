import { SparePart, ISparePart } from '../models/spare-part.model';
import { NotFoundError } from '../errors/app-error';

export interface SparePartFilters {
  search?: string;
  categoryTag?: string;
  brand?: string;
  isActive?: boolean;
}

export interface CreateSparePartData {
  name: string;
  description: string;
  brand: string;
  partNumber?: string;
  categoryTag: string;
  price: number;
  discountedPrice?: number;
  stock: number;
  images?: string[];
  compatibility?: string[];
}

export interface UpdateSparePartData {
  name?: string;
  description?: string;
  brand?: string;
  partNumber?: string;
  categoryTag?: string;
  price?: number;
  discountedPrice?: number;
  stock?: number;
  images?: string[];
  compatibility?: string[];
  isActive?: boolean;
}

export class SparePartService {
  /**
   * Get all spare parts with filters and pagination.
   */
  async getAll(filters: SparePartFilters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    } else {
      query.isActive = true;
    }

    if (filters.categoryTag) {
      query.categoryTag = filters.categoryTag.toLowerCase().trim();
    }

    if (filters.brand) {
      query.brand = new RegExp(filters.brand.trim(), 'i');
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { categoryTag: searchRegex },
      ];
    }

    const [items, total] = await Promise.all([
      SparePart.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      SparePart.countDocuments(query),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get a spare part by ID.
   */
  async getById(id: string): Promise<ISparePart> {
    const item = await SparePart.findOne({ _id: id, isActive: true });
    if (!item) {
      throw new NotFoundError('Spare part not found');
    }
    return item;
  }

  /**
   * Admin: Create spare part.
   */
  async create(data: CreateSparePartData): Promise<ISparePart> {
    const sparePart = await SparePart.create({
      ...data,
      categoryTag: data.categoryTag.toLowerCase().trim(),
      isActive: true,
    });
    return sparePart;
  }

  /**
   * Admin: Update spare part.
   */
  async update(id: string, data: UpdateSparePartData): Promise<ISparePart> {
    const updateData = { ...data };
    if (updateData.categoryTag) {
      updateData.categoryTag = updateData.categoryTag.toLowerCase().trim();
    }

    const sparePart = await SparePart.findByIdAndUpdate(id, updateData, { new: true });
    if (!sparePart) {
      throw new NotFoundError('Spare part not found');
    }
    return sparePart;
  }

  /**
   * Admin: Deactivate spare part (soft delete).
   */
  async deactivate(id: string): Promise<ISparePart> {
    const sparePart = await SparePart.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!sparePart) {
      throw new NotFoundError('Spare part not found');
    }
    return sparePart;
  }
}

export const sparePartService = new SparePartService();
