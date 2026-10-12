import mongoose, { Document, Schema, Types } from 'mongoose';
import { Priority } from '../types';

export type TicketCategory =
  | 'GENERAL'
  | 'BOOKING'
  | 'PAYMENT'
  | 'MECHANIC'
  | 'TECHNICAL'
  | 'OTHER';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface ITicketMessage {
  senderId: Types.ObjectId;
  message: string;
  timestamp: Date;
}

export interface ISupportTicket extends Document {
  ticketNumber: string;
  userId: Types.ObjectId;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: Priority;
  status: TicketStatus;
  relatedBookingId?: Types.ObjectId;
  messages: ITicketMessage[];
  assignedTo?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ticketMessageSchema = new Schema<ITicketMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
      type: String,
      enum: ['GENERAL', 'BOOKING', 'PAYMENT', 'MECHANIC', 'TECHNICAL', 'OTHER'],
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.MEDIUM,
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
    relatedBookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    messages: [ticketMessageSchema],
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

supportTicketSchema.index({ ticketNumber: 1 }, { unique: true });
supportTicketSchema.index({ userId: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ priority: 1 });
supportTicketSchema.index({ createdAt: -1 });

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', supportTicketSchema);
