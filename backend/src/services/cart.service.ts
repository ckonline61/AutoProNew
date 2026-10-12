import { Types } from 'mongoose';
import { Cart, ICart } from '../models/cart.model';
import { SparePart } from '../models/spare-part.model';
import { BadRequestError, NotFoundError } from '../errors/app-error';

export class CartService {
  /**
   * Get cart for user. If not exists, returns or initializes empty cart.
   */
  async getCart(userId: string): Promise<ICart> {
    let cart = await Cart.findOne({ userId: new Types.ObjectId(userId) }).populate(
      'items.sparePartId'
    );

    if (!cart) {
      cart = await Cart.create({
        userId: new Types.ObjectId(userId),
        items: [],
        totalAmount: 0,
      });
    }

    return cart;
  }

  /**
   * Add item to cart. Check spare part stock.
   */
  async addItem(userId: string, sparePartId: string, quantity: number): Promise<ICart> {
    const part = await SparePart.findOne({ _id: sparePartId, isActive: true });
    if (!part) {
      throw new NotFoundError('Spare part not found');
    }

    if (part.stock < quantity) {
      throw new BadRequestError(`Insufficient stock. Only ${part.stock} available`);
    }

    const price = part.discountedPrice !== undefined && part.discountedPrice !== null
      ? part.discountedPrice
      : part.price;

    let cart = await Cart.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) {
      cart = new Cart({
        userId: new Types.ObjectId(userId),
        items: [],
        totalAmount: 0,
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.sparePartId.toString() === sparePartId
    );

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      if (part.stock < newQuantity) {
        throw new BadRequestError(`Cannot add more. Stock limit of ${part.stock} reached`);
      }
      cart.items[itemIndex].quantity = newQuantity;
      cart.items[itemIndex].price = price;
    } else {
      cart.items.push({
        sparePartId: part._id as Types.ObjectId,
        quantity,
        price,
      });
    }

    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();
    return cart.populate('items.sparePartId');
  }

  /**
   * Update quantity of an item in the cart.
   */
  async updateItemQuantity(userId: string, sparePartId: string, quantity: number): Promise<ICart> {
    const cart = await Cart.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.sparePartId.toString() === sparePartId
    );

    if (itemIndex === -1) {
      throw new NotFoundError('Item not found in cart');
    }

    const part = await SparePart.findOne({ _id: sparePartId, isActive: true });
    if (!part) {
      throw new NotFoundError('Spare part not found');
    }

    if (part.stock < quantity) {
      throw new BadRequestError(`Insufficient stock. Only ${part.stock} available`);
    }

    const price = part.discountedPrice !== undefined && part.discountedPrice !== null
      ? part.discountedPrice
      : part.price;

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = price;
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await cart.save();
    return cart.populate('items.sparePartId');
  }

  /**
   * Remove item from cart.
   */
  async removeItem(userId: string, sparePartId: string): Promise<ICart> {
    const cart = await Cart.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    cart.items = cart.items.filter(
      (item) => item.sparePartId.toString() !== sparePartId
    );
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await cart.save();
    return cart.populate('items.sparePartId');
  }

  /**
   * Clear all items in cart.
   */
  async clearCart(userId: string): Promise<ICart> {
    const cart = await Cart.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) {
      return Cart.create({
        userId: new Types.ObjectId(userId),
        items: [],
        totalAmount: 0,
      });
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    return cart;
  }
}

export const cartService = new CartService();
