import request from 'supertest';
import app from '../src/app';

describe('Health Check', () => {
  it('should return healthy status', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('healthy');
    expect(response.body.data.service).toBe('auto-pro-backend');
    expect(response.body.data.version).toBe('v1');
    expect(response.body.data.database).toBeDefined();
    expect(response.body.data.database.status).toBeDefined();
    expect(response.body.data.uptime).toBeDefined();
    expect(response.body.data.timestamp).toBeDefined();
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/v1/nonexistent');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 404 for non-API routes', async () => {
    const response = await request(app).get('/random-path');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('should include request ID in response headers', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.headers['x-request-id']).toBeDefined();
  });

  it('should use provided request ID', async () => {
    const customId = 'test-request-123';
    const response = await request(app)
      .get('/api/v1/health')
      .set('x-request-id', customId);

    expect(response.headers['x-request-id']).toBe(customId);
  });
});

describe('Error Handling', () => {
  it('should handle malformed JSON body', async () => {
    const response = await request(app)
      .post('/api/v1/health')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');

    // Express returns 400 for malformed JSON
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});

describe('API Response Format', () => {
  it('should return standard success response format', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('message');
  });

  it('should return standard error response format', async () => {
    const response = await request(app).get('/api/v1/nonexistent');

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('code');
  });
});
