import { Types } from 'mongoose';
import { FeatureFlag, IFeatureFlag } from '../models/feature-flag.model';
import { NotFoundError, ConflictError } from '../errors/app-error';

export interface CreateFeatureFlagDTO {
  key: string;
  enabled?: boolean;
  description?: string;
  userMessage?: string;
  startDate?: Date;
  endDate?: Date;
  updatedBy?: string | Types.ObjectId;
}

export interface UpdateFeatureFlagDTO {
  enabled?: boolean;
  description?: string;
  userMessage?: string;
  startDate?: Date;
  endDate?: Date;
  updatedBy?: string | Types.ObjectId;
}

export const featureFlagService = {
  /**
   * List all feature flags.
   */
  async getAll(): Promise<IFeatureFlag[]> {
    return FeatureFlag.find().sort({ createdAt: -1 });
  },

  /**
   * Get a single feature flag by key.
   */
  async getByKey(key: string): Promise<IFeatureFlag> {
    const flag = await FeatureFlag.findOne({ key });
    if (!flag) {
      throw new NotFoundError(`Feature flag '${key}' not found`);
    }
    return flag;
  },

  /**
   * Check whether a feature flag is currently active/enabled.
   * Respects flag.enabled status and optional startDate/endDate time windows.
   */
  async isEnabled(key: string): Promise<boolean> {
    const flag = await FeatureFlag.findOne({ key });
    if (!flag) {
      return false;
    }

    if (!flag.enabled) {
      return false;
    }

    const now = new Date();
    if (flag.startDate && now < new Date(flag.startDate)) {
      return false;
    }
    if (flag.endDate && now > new Date(flag.endDate)) {
      return false;
    }

    return true;
  },

  /**
   * Create a new feature flag.
   */
  async create(data: CreateFeatureFlagDTO): Promise<IFeatureFlag> {
    const existing = await FeatureFlag.findOne({ key: data.key });
    if (existing) {
      throw new ConflictError(`Feature flag '${data.key}' already exists`);
    }

    const flag = new FeatureFlag({
      ...data,
      version: 1,
      updatedBy: data.updatedBy ? new Types.ObjectId(data.updatedBy) : undefined,
    });

    return await flag.save();
  },

  /**
   * Update an existing feature flag and increment version.
   */
  async update(key: string, data: UpdateFeatureFlagDTO): Promise<IFeatureFlag> {
    const flag = await FeatureFlag.findOne({ key });
    if (!flag) {
      throw new NotFoundError(`Feature flag '${key}' not found`);
    }

    if (data.enabled !== undefined) flag.enabled = data.enabled;
    if (data.description !== undefined) flag.description = data.description;
    if (data.userMessage !== undefined) flag.userMessage = data.userMessage;
    if (data.startDate !== undefined) flag.startDate = data.startDate;
    if (data.endDate !== undefined) flag.endDate = data.endDate;
    if (data.updatedBy !== undefined) {
      flag.updatedBy = data.updatedBy ? new Types.ObjectId(data.updatedBy) : undefined;
    }

    flag.version = (flag.version || 1) + 1;

    return await flag.save();
  },

  /**
   * Toggle the enabled state of a feature flag.
   */
  async toggle(key: string, updatedBy?: string | Types.ObjectId): Promise<IFeatureFlag> {
    const flag = await FeatureFlag.findOne({ key });
    if (!flag) {
      throw new NotFoundError(`Feature flag '${key}' not found`);
    }

    flag.enabled = !flag.enabled;
    if (updatedBy) {
      flag.updatedBy = new Types.ObjectId(updatedBy);
    }
    flag.version = (flag.version || 1) + 1;

    return await flag.save();
  },

  /**
   * Delete a feature flag.
   */
  async delete(key: string): Promise<IFeatureFlag> {
    const flag = await FeatureFlag.findOneAndDelete({ key });
    if (!flag) {
      throw new NotFoundError(`Feature flag '${key}' not found`);
    }
    return flag;
  },
};
