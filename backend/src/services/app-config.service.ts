import { Types } from 'mongoose';
import { AppConfig, IAppConfig } from '../models/app-config.model';
import { NotFoundError } from '../errors/app-error';

export type ConfigType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';

export interface SetConfigDTO {
  value: unknown;
  type: ConfigType;
  description?: string;
  updatedBy?: string | Types.ObjectId;
}

export const appConfigService = {
  /**
   * Get all configuration entries.
   */
  async getAll(): Promise<IAppConfig[]> {
    return AppConfig.find().sort({ key: 1 });
  },

  /**
   * Get a single config document by key.
   */
  async getByKey(key: string): Promise<IAppConfig> {
    const config = await AppConfig.findOne({ key });
    if (!config) {
      throw new NotFoundError(`Configuration key '${key}' not found`);
    }
    return config;
  },

  /**
   * Get just the typed value for a key (or null if not found).
   */
  async getValue(key: string): Promise<unknown | null> {
    const config = await AppConfig.findOne({ key });
    return config ? config.value : null;
  },

  /**
   * Set (upsert) a configuration item.
   */
  async set(
    key: string,
    value: unknown,
    type: ConfigType,
    description?: string,
    updatedBy?: string | Types.ObjectId
  ): Promise<IAppConfig> {
    let config = await AppConfig.findOne({ key });

    if (config) {
      config.value = value as IAppConfig['value'];
      config.type = type;
      if (description !== undefined) {
        config.description = description;
      }
      if (updatedBy) {
        config.updatedBy = new Types.ObjectId(updatedBy);
      }
      config.version = (config.version || 1) + 1;
      return await config.save();
    }

    config = new AppConfig({
      key,
      value,
      type,
      description,
      version: 1,
      updatedBy: updatedBy ? new Types.ObjectId(updatedBy) : undefined,
    });

    return await config.save();
  },

  /**
   * Delete a configuration entry.
   */
  async delete(key: string): Promise<IAppConfig> {
    const config = await AppConfig.findOneAndDelete({ key });
    if (!config) {
      throw new NotFoundError(`Configuration key '${key}' not found`);
    }
    return config;
  },

  /**
   * Return safe, non-sensitive configuration entries for public client apps.
   */
  async getPublicConfig(): Promise<Record<string, unknown>> {
    const configs = await AppConfig.find().lean();
    const sensitiveRegex = /(secret|password|token|api_key|credential|private)/i;

    const publicConfig: Record<string, unknown> = {};
    for (const c of configs) {
      if (!sensitiveRegex.test(c.key)) {
        publicConfig[c.key] = c.value;
      }
    }

    return publicConfig;
  },
};
