import { Service, IService } from '../models/service.model';
import { ServiceCategory, IServiceCategory } from '../models/service-category.model';
import { NotFoundError } from '../errors/app-error';
import { ServiceQueryInput } from '../validators/service.validator';

export class ServiceCatalogService {
  /**
   * Get all active service categories.
   */
  public async getCategories(isActive: boolean = true): Promise<IServiceCategory[]> {
    const filter: Record<string, unknown> = {};
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    return ServiceCategory.find(filter).sort({ sortOrder: 1, name: 1 });
  }

  /**
   * Get single service category by ID.
   */
  public async getCategoryById(categoryId: string): Promise<IServiceCategory> {
    const category = await ServiceCategory.findOne({ _id: categoryId, isActive: true });
    if (!category) {
      throw new NotFoundError('Service category not found');
    }
    return category;
  }

  /**
   * Get services list with category filtering, search, and pagination.
   */
  public async getServices(query: ServiceQueryInput): Promise<{
    services: IService[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      isActive: query.isActive !== undefined ? query.isActive : true,
    };

    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    }

    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    const [services, total] = await Promise.all([
      Service.find(filter)
        .populate('categoryId', 'name icon')
        .sort({ [query.sort || 'createdAt']: query.order === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Service.countDocuments(filter),
    ]);

    return {
      services,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single service with category details.
   */
  public async getServiceById(serviceId: string): Promise<IService> {
    const service = await Service.findOne({ _id: serviceId, isActive: true }).populate(
      'categoryId',
      'name icon'
    );

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    return service;
  }

  /**
   * Fetch multiple services by IDs to compute pricing & turnaround time.
   */
  public async getServicesByIds(serviceIds: string[]): Promise<IService[]> {
    return Service.find({ _id: { $in: serviceIds }, isActive: true });
  }
}

export const serviceCatalogService = new ServiceCatalogService();
