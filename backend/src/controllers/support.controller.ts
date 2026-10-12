import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { supportService } from '../services/support.service';
import { UnauthorizedError } from '../errors/app-error';
import { UserRole, Priority } from '../types';
import { TicketCategory, TicketStatus } from '../models/support-ticket.model';

export const supportController = {
  // --- Customer endpoints ---

  createTicket: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const ticket = await supportService.createTicket(userId, req.body);
    res.status(201).json(apiResponse.success(ticket, 'Support ticket created successfully'));
  }),

  getMyTickets: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await supportService.getTickets(userId, page, limit);
    res.status(200).json(
      apiResponse.success(result.tickets, 'Support tickets retrieved successfully', result.pagination)
    );
  }),

  getTicketById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const isAdmin =
      req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;

    const ticket = await supportService.getTicketById(
      userId,
      req.params.id as string,
      isAdmin
    );
    res.status(200).json(apiResponse.success(ticket, 'Support ticket retrieved successfully'));
  }),

  addMessage: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const isAdmin =
      req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;

    const ticket = await supportService.addMessage(
      userId,
      req.params.id as string,
      req.body.message,
      isAdmin
    );
    res.status(200).json(apiResponse.success(ticket, 'Message added successfully'));
  }),

  // --- Admin endpoints ---

  getAllTicketsAdmin: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const { status, category, priority, assignedTo, userId } = req.query;

    const result = await supportService.getAllTickets(
      {
        status: status as TicketStatus | undefined,
        category: category as TicketCategory | undefined,
        priority: priority as Priority | undefined,
        assignedTo: assignedTo as string | undefined,
        userId: userId as string | undefined,
      },
      page,
      limit
    );

    res.status(200).json(
      apiResponse.success(result.tickets, 'All support tickets retrieved successfully', result.pagination)
    );
  }),

  updateTicketStatus: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const ticket = await supportService.updateTicketStatus(
      req.params.id as string,
      req.body.status
    );
    res.status(200).json(apiResponse.success(ticket, 'Ticket status updated successfully'));
  }),

  assignTicket: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const ticket = await supportService.assignTicket(
      req.params.id as string,
      req.body.assignedTo
    );
    res.status(200).json(apiResponse.success(ticket, 'Ticket assigned successfully'));
  }),
};
