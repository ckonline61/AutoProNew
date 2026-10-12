import { Types } from 'mongoose';
import { Coupon, ICoupon, CouponDiscountType } from '../models/coupon.model';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../errors/app-error';

export interface CreateCouponData {
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom: Date | string;
  validTo: Date | string;
  applicableServices?: string[];
}

export class CouponService {
  /**
   * Admin creates a coupon.
   */
  async create(data: CreateCouponData): Promise<ICoupon> {
    const code = data.code.toUpperCase().trim();
    const existing = await Coupon.findOne({ code });
    if (existing) {
      throw new ConflictError('Coupon code already exists');
    }

    const coupon = await Coupon.create({
      code,
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount ?? 0,
      maxDiscountAmount: data.maxDiscountAmount,
      usageLimit: data.usageLimit ?? 0,
      validFrom: new Date(data.validFrom),
      validTo: new Date(data.validTo),
      isActive: true,
      applicableServices: data.applicableServices?.map((id) => new Types.ObjectId(id)),
    });

    return coupon;
  }

  /**
   * Validate a coupon code and return calculated discount.
   */
  async validate(code: string, orderAmount: number, serviceIds?: string[]) {
    const normalizedCode = code.toUpperCase().trim();
    const coupon = await Coupon.findOne({ code: normalizedCode, isActive: true });

    if (!coupon) {
      throw new NotFoundError('Invalid coupon code');
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      throw new BadRequestError('Coupon is expired or not yet valid');
    }

    if (orderAmount < coupon.minOrderAmount) {
      throw new BadRequestError(
        `Minimum order amount of ${coupon.minOrderAmount} required for this coupon`
      );
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestError('Coupon usage limit reached');
    }

    if (coupon.applicableServices && coupon.applicableServices.length > 0 && serviceIds && serviceIds.length > 0) {
      const applicableIds = coupon.applicableServices.map((id) => id.toString());
      const hasMatchingService = serviceIds.some((sId) => applicableIds.includes(sId));
      if (!hasMatchingService) {
        throw new BadRequestError('Coupon is not applicable to selected services');
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, orderAmount);
    }

    return {
      coupon,
      discountAmount: Math.round(discountAmount * 100) / 100,
    };
  }

  /**
   * Increment usedCount for an applied coupon.
   */
  async apply(code: string): Promise<ICoupon> {
    const normalizedCode = code.toUpperCase().trim();
    const coupon = await Coupon.findOneAndUpdate(
      { code: normalizedCode, isActive: true },
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    if (!coupon) {
      throw new NotFoundError('Coupon not found or inactive');
    }

    return coupon;
  }

  /**
   * Admin: Get all coupons with pagination.
   */
  async getAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      Coupon.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Coupon.countDocuments(),
    ]);

    return {
      coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Admin: Deactivate a coupon.
   */
  async deactivate(couponId: string): Promise<ICoupon> {
    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      { isActive: false },
      { new: true }
    );

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    return coupon;
  }
}

export const couponService = new CouponService();
