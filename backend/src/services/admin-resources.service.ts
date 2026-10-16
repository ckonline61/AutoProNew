import { Model, PopulateOptions } from 'mongoose';
import { User } from '../models/user.model';
import { Mechanic } from '../models/mechanic.model';
import { Booking } from '../models/booking.model';
import { EmergencyRequest } from '../models/emergency-request.model';
import { Payment } from '../models/payment.model';
import { Order } from '../models/order.model';
import { InspectionReport } from '../models/inspection-report.model';
import { Review } from '../models/review.model';
import { UsedCarListing } from '../models/used-car-listing.model';
import { SparePart } from '../models/spare-part.model';
import { Service } from '../models/service.model';
import { ServiceCategory } from '../models/service-category.model';
import { BadRequestError } from '../errors/app-error';
async function paginate<T>(model: Model<T>, page: number, limit: number, projection = '', populate?: PopulateOptions | PopulateOptions[]) {
  const query = model.find().select(projection).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit);
  if (populate) query.populate(populate);
  const [items,total] = await Promise.all([query, model.countDocuments()]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total/limit) } };
}
export const adminResourcesService = {
  list(resource: string, page: number, limit: number) {
    switch (resource) {
      case 'users': return paginate(User,page,limit,'name email phone role isActive isVerified createdAt updatedAt');
      case 'emergency': return paginate(EmergencyRequest,page,limit,'',[{ path: 'customerId', select: 'name phone' },{ path: 'assignedProviderId', select: 'name phone' }]);
      case 'mechanics': return paginate(Mechanic,page,limit,'-currentLocation',{ path: 'userId', select: 'name email phone role isActive' });
      case 'bookings': return paginate(Booking,page,limit,'',[{ path: 'customerId', select: 'name email phone' },{ path: 'vehicleId', select: 'brand model registrationNumber' },{ path: 'serviceIds', select: 'name price' },{ path: 'mechanicId', select: 'name phone' }]);
      case 'payments': return paginate(Payment,page,limit,'-razorpaySignature');
      case 'orders': return paginate(Order,page,limit);
      case 'inspections': return paginate(InspectionReport,page,limit);
      case 'reviews': return paginate(Review,page,limit);
      case 'used-cars': return paginate(UsedCarListing,page,limit);
      case 'spare-parts': return paginate(SparePart,page,limit);
      case 'services': return paginate(Service,page,limit,'',{ path: 'categoryId', select: 'name icon' });
      case 'service-categories': return paginate(ServiceCategory,page,limit);
      default: throw new BadRequestError('Unknown administrative resource');
    }
  },
};
