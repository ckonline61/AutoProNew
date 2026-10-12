import { Types } from 'mongoose';
import { Order, IOrder, IShippingAddress } from '../models/order.model';
import { Cart } from '../models/cart.model';
import { SparePart } from '../models/spare-part.model';
import { OrderStatus, PaymentStatus } from '../types';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors/app-error';

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
  async placeOrder(userId: string, addressData: PlaceOrderAddress): Promise<IOrder> {
    const cart = await Cart.findOne({ userId: new Types.ObjectId(userId) }).populate<{
      items: Array<{
        sparePartId: { _id: Types.ObjectId; name: string; stock: number; price: number; discountedPrice?: number };
        quantity: number;
        price: number;
      }>;
    }>('items.sparePartId');

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cannot place an order with an empty cart');
    }

    // Verify stock for all items first
    for (const item of cart.items) {
      const part = item.sparePartId;
      if (!part) {
        throw new BadRequestError('One or more spare parts in cart are no longer available');
      }
      if (part.stock < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for "${part.name}". Available: ${part.stock}, Requested: ${item.quantity}`
        );
      }
    }

    // Decrement stock for all items
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const part = item.sparePartId;
      await SparePart.findByIdAndUpdate(part._id, {
        $inc: { stock: -item.quantity },
      });

      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        sparePartId: part._id,
        name: part.name,
        quantity: item.quantity,
        price: item.price,
        total: lineTotal,
      });
    }

    const tax = 0;
    const discount = 0;
    const totalAmount = subtotal + tax - discount;
    const orderNumber = this.generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      userId: new Types.ObjectId(userId),
      items: orderItems,
      subtotal,
      tax,
      discount,
      totalAmount,
      status: OrderStatus.PLACED,
      shippingAddress: addressData as IShippingAddress,
      paymentStatus: PaymentStatus.PENDING,
    });

    // Clear user cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    return order;
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

    // Restore stock
    for (const item of order.items) {
      await SparePart.findByIdAndUpdate(item.sparePartId, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();

    return order;
  }

  /**
   * Admin: Update order status.
   */
  async updateStatus(orderId: string, status: OrderStatus): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    order.status = status;
    await order.save();

    return order;
  }
}

export const orderService = new OrderService();
