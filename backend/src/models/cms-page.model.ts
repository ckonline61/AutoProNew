import mongoose, { Document, Schema, Types } from 'mongoose';

export type CmsCategory = 'PAGE' | 'FAQ' | 'TERMS' | 'PRIVACY' | 'ABOUT' | 'HELP';

export interface ICmsPage extends Document {
  slug: string;
  title: string;
  content: string;
  category: CmsCategory;
  isPublished: boolean;
  publishedAt?: Date;
  author: Types.ObjectId;
  metaTitle?: string;
  metaDescription?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const cmsPageSchema = new Schema<ICmsPage>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['PAGE', 'FAQ', 'TERMS', 'PRIVACY', 'ABOUT', 'HELP'],
      default: 'PAGE',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

cmsPageSchema.index({ slug: 1 }, { unique: true });
cmsPageSchema.index({ category: 1 });
cmsPageSchema.index({ isPublished: 1 });
cmsPageSchema.index({ sortOrder: 1, createdAt: -1 });

export const CmsPage = mongoose.model<ICmsPage>('CmsPage', cmsPageSchema);
