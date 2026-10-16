import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { orderService } from '../services/order.service';
import { UnauthorizedError } from '../errors/app-error';

export const orderController = {
  placeOrder: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const order = await orderService.placeOrder(userId, req.body.shippingAddress, req.body.expectedTotal);
    res.status(201).json(apiResponse.success(order, 'Order placed successfully'));
  }),

  getOrders: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await orderService.getOrders(userId, page, limit);
    res.status(200).json(
      apiResponse.success(result.orders, 'Orders retrieved successfully', result.pagination)
    );
  }),

  getOrderById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const order = await orderService.getOrderById(userId, req.params.id as string);
    res.status(200).json(apiResponse.success(order, 'Order retrieved successfully'));
  }),

  cancelOrder: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const order = await orderService.cancelOrder(userId, req.params.id as string);
    res.status(200).json(apiResponse.success(order, 'Order cancelled successfully'));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { status } = req.body;
    const order = await orderService.updateStatus(req.params.id as string, status);
    res.status(200).json(apiResponse.success(order, 'Order status updated successfully'));
  }),
};
