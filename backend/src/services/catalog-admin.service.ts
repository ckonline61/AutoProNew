import { Service, IService } from '../models/service.model';
import { ServiceCategory } from '../models/service-category.model';
import { BadRequestError, NotFoundError } from '../errors/app-error';
import { CreateServiceInput, UpdateServiceInput, createServiceCategorySchema } from '../validators/service.validator';
import { z } from 'zod';
function checkPrice(service: { price: number; discountedPrice?: number }) {
  if (service.discountedPrice != null && service.discountedPrice > service.price) throw new BadRequestError('Discounted price cannot exceed the base price');
}
async function requireCategory(id: string) {
  const category = await ServiceCategory.findOne({ _id: id, isActive: true });
  if (!category) throw new NotFoundError('Active service category not found');
}
export const catalogAdminService = {
  async createCategory(data: z.infer<typeof createServiceCategorySchema>) { return ServiceCategory.create(data); },
  async updateCategory(id: string, data: Partial<z.infer<typeof createServiceCategorySchema>> & { isActive?: boolean }) {
    if (data.isActive === false && await Service.countDocuments({ categoryId: id, isActive: true })) throw new BadRequestError('Deactivate the services in this category first');
    const category = await ServiceCategory.findByIdAndUpdate(id,data,{ new: true, runValidators: true });
    if (!category) throw new NotFoundError('Service category not found'); return category;
  },
  async create(data: CreateServiceInput): Promise<IService> {
    await requireCategory(data.categoryId); checkPrice(data); return Service.create(data);
  },
  async update(id: string, data: UpdateServiceInput & { isActive?: boolean }): Promise<IService> {
    const service = await Service.findById(id); if (!service) throw new NotFoundError('Service not found');
    if (data.categoryId) await requireCategory(data.categoryId);
    if (data.isActive === true) await requireCategory(data.categoryId || service.categoryId.toString());
    checkPrice({ price: data.price ?? service.price, discountedPrice: data.discountedPrice ?? service.discountedPrice });
    Object.assign(service,data); await service.save(); return service;
  },
};
