import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICartItem {
  sparePartId: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  checkoutInProgress: boolean;
  checkoutOrderId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    sparePartId: { type: Schema.Types.ObjectId, ref: 'SparePart', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
    totalAmount: { type: Number, required: true, default: 0, min: 0 },
    checkoutInProgress: { type: Boolean, default: false },
    checkoutOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true, optimisticConcurrency: true }
);


export const Cart = mongoose.model<ICart>('Cart', cartSchema);
