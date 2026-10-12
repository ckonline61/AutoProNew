import { Types } from 'mongoose';
import { AuditLog, IAuditLog } from '../models/audit-log.model';
import { AuditAction } from '../types';

export interface AuditFilters {
  userId?: string;
  action?: AuditAction;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
}

export const auditService = {
  /**
   * Record a new audit log entry.
   */
  async log(
    userId: string | Types.ObjectId,
    action: AuditAction,
    resource: string,
    resourceId?: string | Types.ObjectId,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IAuditLog> {
    const auditLog = new AuditLog({
      userId: new Types.ObjectId(userId),
      action,
      resource,
      resourceId: resourceId ? new Types.ObjectId(resourceId) : undefined,
      details,
      ipAddress,
      userAgent,
    });

    return await auditLog.save();
  },

  /**
   * Admin: Get paginated audit logs with optional filters.
   */
  async getAll(filters: AuditFilters = {}, page: number = 1, limit: number = 20) {
    const query: Record<string, unknown> = {};

    if (filters.userId) {
      query.userId = new Types.ObjectId(filters.userId);
    }
    if (filters.action) {
      query.action = filters.action;
    }
    if (filters.resource) {
      query.resource = filters.resource;
    }
    if (filters.resourceId) {
      query.resourceId = new Types.ObjectId(filters.resourceId);
    }
    if (filters.startDate || filters.endDate) {
      const createdAtQuery: Record<string, Date> = {};
      if (filters.startDate) createdAtQuery.$gte = new Date(filters.startDate);
      if (filters.endDate) createdAtQuery.$lte = new Date(filters.endDate);
      query.createdAt = createdAtQuery;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email role')
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Admin: Get audit logs for a specific user.
   */
  async getByUser(userId: string, page: number = 1, limit: number = 20) {
    return this.getAll({ userId }, page, limit);
  },

  /**
   * Admin: Get audit trail for a specific resource.
   */
  async getByResource(
    resource: string,
    resourceId?: string,
    page: number = 1,
    limit: number = 20
  ) {
    return this.getAll({ resource, resourceId }, page, limit);
  },
};
