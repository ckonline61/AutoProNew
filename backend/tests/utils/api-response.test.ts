import { apiResponse } from '../../src/utils/api-response';

describe('API Response Utility', () => {
  describe('success()', () => {
    it('should create a success response', () => {
      const result = apiResponse.success({ id: 1 }, 'Created');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1 });
      expect(result.message).toBe('Created');
    });

    it('should use default message', () => {
      const result = apiResponse.success(null);

      expect(result.message).toBe('Success');
    });

    it('should include pagination when provided', () => {
      const pagination = { page: 1, limit: 20, total: 100, totalPages: 5 };
      const result = apiResponse.success([], 'List', pagination);

      expect(result.pagination).toEqual(pagination);
    });

    it('should not include pagination when not provided', () => {
      const result = apiResponse.success([]);

      expect(result.pagination).toBeUndefined();
    });
  });

  describe('error()', () => {
    it('should create an error response', () => {
      const result = apiResponse.error('Not found', 404, 'NOT_FOUND');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Not found');
      expect(result.error.code).toBe('NOT_FOUND');
    });

    it('should include details when provided', () => {
      const details = [{ field: 'email', message: 'Required' }];
      const result = apiResponse.error('Validation failed', 422, 'VALIDATION_ERROR', details);

      expect(result.error.details).toEqual(details);
    });

    it('should not include details when not provided', () => {
      const result = apiResponse.error('Error', 500);

      expect(result.error.details).toBeUndefined();
    });
  });
});
