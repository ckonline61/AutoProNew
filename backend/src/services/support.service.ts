import { Types } from 'mongoose';
import {
  SupportTicket,
  ISupportTicket,
  TicketCategory,
  TicketStatus,
} from '../models/support-ticket.model';
import { Priority, UserRole } from '../types';
import { NotFoundError, ForbiddenError, BadRequestError } from '../errors/app-error';
import { User } from '../models/user.model';

export interface CreateTicketDTO {
  subject: string;
  description: string;
  category: TicketCategory;
  priority?: Priority;
  relatedBookingId?: string | Types.ObjectId;
}

export interface TicketFilters {
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: Priority;
  assignedTo?: string;
  userId?: string;
}

export const supportService = {
  /**
   * Helper to generate a unique ticket number formatted as TKT-YYYYMMDD-XXXX.
   */
  async generateTicketNumber(): Promise<string> {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let ticketNumber = '';
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 10) {
      attempts++;
      const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()
        .padEnd(4, '0');
      ticketNumber = `TKT-${dateStr}-${randomSuffix}`;
      const found = await SupportTicket.findOne({ ticketNumber });
      if (!found) {
        exists = false;
      }
    }

    return ticketNumber;
  },

  /**
   * Create a new support ticket.
   */
  async createTicket(userId: string, data: CreateTicketDTO): Promise<ISupportTicket> {
    const ticketNumber = await this.generateTicketNumber();

    const ticket = new SupportTicket({
      ticketNumber,
      userId: new Types.ObjectId(userId),
      subject: data.subject,
      description: data.description,
      category: data.category,
      priority: data.priority || Priority.MEDIUM,
      status: 'OPEN',
      relatedBookingId: data.relatedBookingId
        ? new Types.ObjectId(data.relatedBookingId)
        : undefined,
      messages: [
        {
          senderId: new Types.ObjectId(userId),
          message: data.description,
          timestamp: new Date(),
        },
      ],
    });

    return await ticket.save();
  },

  /**
   * Retrieve all tickets belonging to a specific customer.
   */
  async getTickets(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      SupportTicket.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'name email')
        .lean(),
      SupportTicket.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get ticket by ID with ownership verification (admins can view any ticket).
   */
  async getTicketById(
    userId: string,
    ticketId: string,
    isAdmin: boolean = false
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId)
      .populate('userId', 'name email phone avatar role')
      .populate('assignedTo', 'name email phone avatar')
      .populate('messages.senderId', 'name email avatar role');

    if (!ticket) {
      throw new NotFoundError('Support ticket not found');
    }

    if (!isAdmin && ticket.userId._id.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have access to this ticket');
    }

    return ticket;
  },

  /**
   * Add a message to an existing support ticket.
   */
  async addMessage(
    userId: string,
    ticketId: string,
    message: string,
    isAdmin: boolean = false
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Support ticket not found');
    }

    if (!isAdmin && ticket.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have access to this ticket');
    }

    ticket.messages.push({
      senderId: new Types.ObjectId(userId),
      message,
      timestamp: new Date(),
    });

    // If ticket was closed or resolved and customer replies, reopen ticket
    if (!isAdmin && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED')) {
      ticket.status = 'IN_PROGRESS';
    }

    return await ticket.save();
  },

  /**
   * Admin: List all tickets with filters and pagination.
   */
  async getAllTickets(filters: TicketFilters = {}, page: number = 1, limit: number = 20) {
    const query: Record<string, unknown> = {};

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.assignedTo) {
      query.assignedTo = new Types.ObjectId(filters.assignedTo);
    }
    if (filters.userId) {
      query.userId = new Types.ObjectId(filters.userId);
    }

    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email phone avatar')
        .populate('assignedTo', 'name email phone')
        .lean(),
      SupportTicket.countDocuments(query),
    ]);

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Admin: Update status of a ticket.
   */
  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Support ticket not found');
    }

    ticket.status = status;
    if (status === 'RESOLVED' || status === 'CLOSED') {
      ticket.resolvedAt = new Date();
    }

    return await ticket.save();
  },

  /**
   * Admin: Assign a ticket to a support staff / admin.
   */
  async assignTicket(ticketId: string, assignedTo: string): Promise<ISupportTicket> {
    if (!await User.exists({ _id: assignedTo, isActive: true, role: { $in: [UserRole.ADMIN,UserRole.SUPER_ADMIN] } })) throw new BadRequestError('Choose an active support administrator');
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Support ticket not found');
    }

    ticket.assignedTo = new Types.ObjectId(assignedTo);
    return await ticket.save();
  },
};
