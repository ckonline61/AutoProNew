export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message: string;
  pagination?: PaginationInfo;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const apiResponse = {
  success<T>(data: T, message: string = 'Success', pagination?: PaginationInfo): ApiSuccessResponse<T> {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
      message,
    };
    if (pagination) {
      response.pagination = pagination;
    }
    return response;
  },

  error(message: string, _statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: unknown): ApiErrorResponse {
    return {
      success: false,
      message,
      error: {
        code,
        ...(details ? { details } : {}),
      },
    };
  },
};
