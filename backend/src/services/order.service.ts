import { Types } from 'mongoose';
import { Order, IOrder, IShippingAddress } from '../models/order.model';
import { logger } from '../utils/logger';
import { assertOrderTransition } from './order-fsm';
import { Cart } from '../models/cart.model';
import { SparePart } from '../models/spare-part.model';
import { OrderStatus, PaymentStatus } from '../types';
import { BadRequestError, ForbiddenError, NotFoundError, ConflictError } from '../errors/app-error';

export interface PlaceOrderAddress {
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
}

export class OrderService {
  /**
   * Helper to generate unique order number in format ORD-YYYYMMDD-XXXX
   */
  private generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${year}${month}${day}-${randomChars}`;
  }

  /**
   * Place an order from the user's active cart.
   */
  async placeOrder(userId: string, addressData: PlaceOrderAddress, expectedTotal?: number): Promise<IOrder> {
    const orderId = new Types.ObjectId();
    const cart = await Cart.findOneAndUpdate({ userId: new Types.ObjectId(userId), checkoutInProgress: { $ne: true }, 'items.0': { $exists: true } }, { $set: { checkoutInProgress: true, checkoutOrderId: orderId }, $inc: { __v: 1 } }, { new: true }).populate<{ items: Array<{ sparePartId: { _id: Types.ObjectId; name: string; stock: number; price: number; discountedPrice?: number; isActive: boolean }; quantity: number; price: number }> }>('items.sparePartId');
    if (!cart) throw new ConflictError('Cart is empty or checkout is already processing. Refresh your cart and order history.');
    const reserved: { id: Types.ObjectId; quantity: number }[] = [];
    let committed = false;
    try {
      const items = []; let subtotal = 0;
      for (const item of cart.items) {
        if (!item.sparePartId || item.sparePartId.isActive === false) throw new BadRequestError('A part in your cart is no longer available');
        const part = await SparePart.findOneAndUpdate({ _id: item.sparePartId._id, isActive: true, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { new: true });
        if (!part) throw new BadRequestError(`Insufficient stock for ${item.sparePartId.name}`);
        reserved.push({ id: part._id as Types.ObjectId, quantity: item.quantity });
        const price = part.discountedPrice ?? part.price;
        if (price !== item.price) throw new BadRequestError('A part price changed. Refresh your cart before ordering.');
        const total = price * item.quantity; subtotal += total;
        items.push({ sparePartId: part._id, name: part.name, quantity: item.quantity, price, total });
      }
      if (expectedTotal !== undefined && Math.abs(expectedTotal-subtotal) > 0.001) throw new BadRequestError('The cart total changed. Refresh and confirm the current amount.');
      const order = await Order.create({ _id: orderId, orderNumber: this.generateOrderNumber(), userId: new Types.ObjectId(userId), items, subtotal, tax: 0, discount: 0, totalAmount: subtotal, status: OrderStatus.PLACED, shippingAddress: addressData as IShippingAddress, paymentStatus: PaymentStatus.PENDING });
      committed = true;
      try { await Cart.updateOne({ _id: cart._id, checkoutOrderId: orderId }, { $set: { items: [], totalAmount: 0, checkoutInProgress: false }, $unset: { checkoutOrderId: 1 }, $inc: { __v: 1 } }); }
      catch (error) { logger.error('Order saved; cart will be finalized on next read', { orderId: orderId.toString(), error }); }
      return order;
    } catch (error) {
      if (!committed) {
        await Promise.all(reserved.map(item => SparePart.findByIdAndUpdate(item.id,{ $inc: { stock: item.quantity } })));
        await Cart.updateOne({ _id: cart._id, checkoutOrderId: orderId }, { $set: { checkoutInProgress: false }, $unset: { checkoutOrderId: 1 }, $inc: { __v: 1 } });
      }
      throw error;
    }
  }

  /**
   * Get paginated orders for a user.
   */
  async getOrders(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const query = { userId: new Types.ObjectId(userId) };

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get single order by ID for a user.
   */
  async getOrderById(userId: string, orderId: string): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.userId.toString() !== userId) {
      throw new ForbiddenError('You can only view your own orders');
    }

    return order;
  }

  /**
   * Cancel an order if it is PLACED or CONFIRMED, and restore stock.
   */
  async cancelOrder(userId: string, orderId: string): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.userId.toString() !== userId) {
      throw new ForbiddenError('You can only cancel your own orders');
    }

    if (order.status !== OrderStatus.PLACED && order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestError(`Cannot cancel order in status ${order.status}`);
    }

    const cancelled = await Order.findOneAndUpdate({ _id: orderId, status: order.status }, { $set: { status: OrderStatus.CANCELLED } }, { new: true });
    if (!cancelled) throw new ConflictError('Order changed while cancelling. Refresh and retry.');
    const restored: { id: Types.ObjectId; quantity: number }[] = [];
    try {
      for (const item of order.items) {
        await SparePart.findByIdAndUpdate(item.sparePartId,{ $inc: { stock: item.quantity } });
        restored.push({ id: item.sparePartId, quantity: item.quantity });
      }
      return cancelled;
    } catch (error) {
      await Promise.all(restored.map(item => SparePart.findByIdAndUpdate(item.id,{ $inc: { stock: -item.quantity } })));
      await Order.updateOne({ _id: orderId, status: OrderStatus.CANCELLED }, { $set: { status: order.status } });
      throw error;
    }
  }

  /**
   * Admin: Update order status.
   */
  async updateStatus(orderId: string, status: OrderStatus): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    assertOrderTransition(order.status,status);
    if (status === OrderStatus.CANCELLED) return this.cancelOrder(order.userId.toString(),orderId);
    const updated = await Order.findOneAndUpdate({ _id: orderId, status: order.status }, { $set: { status } }, { new: true, runValidators: true });
    if (!updated) throw new ConflictError('Order changed while updating. Refresh and retry.');
    return updated;
  }
}

export const orderService = new OrderService();
