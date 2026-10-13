import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAppConfig extends Document {
  key: string;
  value: mongoose.Schema.Types.Mixed;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  description?: string;
  version: number;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const appConfigSchema = new Schema<IAppConfig>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
    type: { type: String, enum: ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'], required: true },
    description: { type: String, trim: true, maxlength: 500 },
    version: { type: Number, default: 1 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);


export const AppConfig = mongoose.model<IAppConfig>('AppConfig', appConfigSchema);
