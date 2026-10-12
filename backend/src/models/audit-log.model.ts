import mongoose, { Document, Schema, Types } from 'mongoose';
import { AuditAction } from '../types';

export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  action: AuditAction;
  resource: string;
  resourceId?: Types.ObjectId;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: Object.values(AuditAction), required: true },
    resource: { type: String, required: true, trim: true },
    resourceId: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ createdAt: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
