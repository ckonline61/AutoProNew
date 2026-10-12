import { Types } from 'mongoose';
import {
  InspectionReport,
  IInspectionReport,
  IInspectionCategory,
  InspectionStatus,
} from '../models/inspection-report.model';
import { UsedCarListing } from '../models/used-car-listing.model';
import { ForbiddenError, NotFoundError } from '../errors/app-error';

export interface CreateReportData {
  vehicleId?: string;
  listingId?: string;
  overallScore: number;
  categories: IInspectionCategory[];
  summary: string;
  recommendations?: string[];
  images?: string[];
  status?: InspectionStatus;
}

export interface UpdateReportData {
  overallScore?: number;
  categories?: IInspectionCategory[];
  summary?: string;
  recommendations?: string[];
  images?: string[];
  status?: InspectionStatus;
}

export class InspectionService {
  /**
   * Inspector creates an inspection report.
   */
  async createReport(inspectorId: string, data: CreateReportData): Promise<IInspectionReport> {
    const report = await InspectionReport.create({
      vehicleId: data.vehicleId ? new Types.ObjectId(data.vehicleId) : undefined,
      listingId: data.listingId ? new Types.ObjectId(data.listingId) : undefined,
      inspectorId: new Types.ObjectId(inspectorId),
      overallScore: data.overallScore,
      categories: data.categories || [],
      summary: data.summary,
      recommendations: data.recommendations || [],
      images: data.images || [],
      status: data.status || 'PENDING',
    });

    if (data.listingId && data.status === 'COMPLETED') {
      await UsedCarListing.findByIdAndUpdate(data.listingId, {
        inspectionReportId: report._id,
      });
    }

    return report;
  }

  /**
   * Get inspection report by ID.
   */
  async getReport(reportId: string): Promise<IInspectionReport> {
    const report = await InspectionReport.findById(reportId)
      .populate('inspectorId', 'name email phone avatar')
      .populate('listingId')
      .populate('vehicleId');

    if (!report) {
      throw new NotFoundError('Inspection report not found');
    }

    return report;
  }

  /**
   * Update report with ownership check.
   */
  async updateReport(
    inspectorId: string,
    reportId: string,
    data: UpdateReportData
  ): Promise<IInspectionReport> {
    const report = await InspectionReport.findById(reportId);
    if (!report) {
      throw new NotFoundError('Inspection report not found');
    }

    if (report.inspectorId.toString() !== inspectorId) {
      throw new ForbiddenError('You can only update your own inspection reports');
    }

    Object.assign(report, data);
    await report.save();
    return report;
  }

  /**
   * Complete inspection report.
   */
  async completeReport(
    inspectorId: string,
    reportId: string,
    data: UpdateReportData = {}
  ): Promise<IInspectionReport> {
    const report = await InspectionReport.findById(reportId);
    if (!report) {
      throw new NotFoundError('Inspection report not found');
    }

    if (report.inspectorId.toString() !== inspectorId) {
      throw new ForbiddenError('You can only complete your own inspection reports');
    }

    Object.assign(report, data);
    report.status = 'COMPLETED';
    report.completedAt = new Date();
    await report.save();

    if (report.listingId) {
      await UsedCarListing.findByIdAndUpdate(report.listingId, {
        inspectionReportId: report._id,
      });
    }

    return report;
  }

  /**
   * Get inspection reports by vehicle ID.
   */
  async getByVehicle(vehicleId: string): Promise<IInspectionReport[]> {
    return InspectionReport.find({ vehicleId: new Types.ObjectId(vehicleId) })
      .sort({ createdAt: -1 })
      .populate('inspectorId', 'name email phone avatar');
  }

  /**
   * Get inspection reports by listing ID.
   */
  async getByListing(listingId: string): Promise<IInspectionReport[]> {
    return InspectionReport.find({ listingId: new Types.ObjectId(listingId) })
      .sort({ createdAt: -1 })
      .populate('inspectorId', 'name email phone avatar');
  }
}

export const inspectionService = new InspectionService();
