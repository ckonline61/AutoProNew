import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { couponService } from '../services/coupon.service';

export const couponController = {
  create: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const coupon = await couponService.create(req.body);
    res.status(201).json(apiResponse.success(coupon, 'Coupon created successfully'));
  }),

  validate: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { code, orderAmount, serviceIds } = req.body;
    const result = await couponService.validate(code, orderAmount, serviceIds);
    res.status(200).json(
      apiResponse.success(
        {
          coupon: result.coupon,
          discountAmount: result.discountAmount,
        },
        'Coupon is valid'
      )
    );
  }),

  getAll: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await couponService.getAll(page, limit);
    res.status(200).json(
      apiResponse.success(result.coupons, 'Coupons retrieved successfully', result.pagination)
    );
  }),

  deactivate: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const coupon = await couponService.deactivate(id);
    res.status(200).json(apiResponse.success(coupon, 'Coupon deactivated successfully'));
  }),
};
