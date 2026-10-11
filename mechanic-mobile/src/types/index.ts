// Auto Pro Mobile Type Definitions
// This file will grow as features are added

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  MECHANIC = 'MECHANIC',
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
}
