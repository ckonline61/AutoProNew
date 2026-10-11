import request from 'supertest';
import app from '../src/app';

describe('Health Check', () => {
  it('should return healthy status', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('healthy');
    expect(response.body.data.service).toBe('auto-pro-backend');
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/v1/nonexistent');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
