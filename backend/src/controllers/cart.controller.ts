import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { cartService } from '../services/cart.service';
import { UnauthorizedError } from '../errors/app-error';

export const cartController = {
  getCart: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const cart = await cartService.getCart(userId);
    res.status(200).json(apiResponse.success(cart, 'Cart retrieved successfully'));
  }),

  addItem: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const { sparePartId, quantity } = req.body;
    const cart = await cartService.addItem(userId, sparePartId, quantity ?? 1);
    res.status(200).json(apiResponse.success(cart, 'Item added to cart'));
  }),

  updateItemQuantity: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const sparePartId = req.params.sparePartId as string;
    const { quantity } = req.body;
    const cart = await cartService.updateItemQuantity(userId, sparePartId, quantity);
    res.status(200).json(apiResponse.success(cart, 'Cart item quantity updated'));
  }),

  removeItem: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const sparePartId = req.params.sparePartId as string;
    const cart = await cartService.removeItem(userId, sparePartId);
    res.status(200).json(apiResponse.success(cart, 'Item removed from cart'));
  }),

  clearCart: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const cart = await cartService.clearCart(userId);
    res.status(200).json(apiResponse.success(cart, 'Cart cleared'));
  }),
};
