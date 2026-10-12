import mongoose, { Schema, Types } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice {
  _id: Types.ObjectId;
  invoiceNumber: string;
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  items: IInvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  total: number;
  paidAmount: number;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';
  issuedDate: Date;
  dueDate?: Date;
  pdfUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [invoiceItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 18, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['DRAFT', 'ISSUED', 'PAID', 'CANCELLED'], default: 'DRAFT' },
    issuedDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    pdfUrl: { type: String },
    notes: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ bookingId: 1 });
invoiceSchema.index({ customerId: 1 });
invoiceSchema.index({ status: 1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
