// Set test environment before any module loads
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-testing';
