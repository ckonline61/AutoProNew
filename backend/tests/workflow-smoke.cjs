/* Runs against an isolated, disposable LOCAL MongoDB database. No existing database is modified. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const request = require('supertest');
const dbName = `auto_pro_smoke_${crypto.randomBytes(8).toString('hex')}`;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
process.env.JWT_REFRESH_SECRET = crypto.randomBytes(32).toString('hex');
const app = require('../dist/app').default;
const { User } = require('../dist/models/user.model');
const password = crypto.randomBytes(16).toString('hex');
let checks = 0;
async function call(method, path, token, body, expected = 200) {
  let req = request(app)[method](`/api/v1${path}`);
  if (token) req = req.set('Authorization', `Bearer ${token}`);
  if (body) req = req.send(body);
  const res = await req;
  assert.equal(res.status, expected, `${method.toUpperCase()} ${path}: ${res.body.message}`);
  checks++;
  return res.body.data;
}
async function account(name, role, phone) {
  const email = `${name.toLowerCase().replaceAll(' ', '.')}@example.test`;
  const user = await call('post', '/auth/register', null, { name, email, phone, password, role: role === 'ADMIN' ? 'CUSTOMER' : role }, 201);
  if (role === 'ADMIN') await User.updateOne({ _id: user._id }, { role });
  const session = await call('post', '/auth/login', null, { email, password });
  return { ...session.user, token: session.tokens.accessToken, refresh: session.tokens.refreshToken };
}
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017', { dbName, serverSelectionTimeoutMS: 5000 });
  try {
    const customer = await account('Smoke Customer', 'CUSTOMER', '9876543201');
    const mechanic = await account('Smoke Mechanic', 'MECHANIC', '9876543202');
    const stranger = await account('Smoke Stranger', 'CUSTOMER', '9876543203');
    const admin = await account('Smoke Admin', 'ADMIN', '9876543204');
    const profile = await call('post', '/mechanics/onboard', mechanic.token, { specializations: ['Engine'], experience: 3 }, 201);
    await call('put', '/mechanics/availability', mechanic.token, { isOnline: true }, 403);
    await call('put', `/mechanics/${profile._id}/verify`, admin.token, { approvalStatus: 'APPROVED' });
    await call('put', '/mechanics/availability', mechanic.token, { isOnline: true });
    const category = await call('post', '/services/categories', admin.token, { name: 'Smoke Maintenance' }, 201);
    const service = await call('post', '/services', admin.token, { name: 'Smoke Inspection', categoryId: category._id, description: 'Test service inspection', price: 500, duration: 60 }, 201);
    const vehicle = await call('post', '/vehicles', customer.token, { registrationNumber: 'TEST1234', brand: 'Test', model: 'Car', fuelType: 'PETROL', year: 2025 }, 201);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const booking = await call('post', '/bookings', customer.token, { vehicleId: vehicle._id, serviceIds: [service._id], serviceType: 'WORKSHOP', scheduledDate: tomorrow, scheduledTime: '10:00' }, 201);
    await call('put', `/admin/bookings/${booking._id}/status`, admin.token, { status: 'CONFIRMED' });
    await call('put', `/admin/bookings/${booking._id}/assign`, admin.token, { mechanicId: mechanic._id });
    await call('post', `/mechanics/jobs/${booking._id}/accept`, mechanic.token);
    await call('put', '/mechanics/location', mechanic.token, { jobId: booking._id, jobType: 'booking', latitude: 19, longitude: 72 }, 403);
    await call('put', `/mechanics/jobs/${booking._id}/status`, mechanic.token, { status: 'EN_ROUTE' });
    await call('put', '/mechanics/location', mechanic.token, { jobId: booking._id, jobType: 'booking', latitude: 19, longitude: 72 });
    for (const status of ['ARRIVED', 'IN_PROGRESS', 'COMPLETED']) await call('put', `/mechanics/jobs/${booking._id}/status`, mechanic.token, { status });
    await call('put', `/mechanics/jobs/${booking._id}/status`, mechanic.token, { status: 'COMPLETED' }, 400);
    const completedProfile = await call('get', '/mechanics/profile', mechanic.token);
    assert.equal(completedProfile.totalJobs, 1);
    assert.equal(completedProfile.totalEarnings, 500);
    assert.equal(completedProfile.currentLocation, undefined);
    const sos = await call('post', '/emergency', customer.token, { vehicleId: vehicle._id, problemType: 'FLAT_TYRE', latitude: 19, longitude: 72 }, 201);
    await call('get', `/emergency/${sos._id}`, stranger.token, null, 404);
    await call('post', `/emergency/${sos._id}/cancel`, stranger.token, { reason: 'Not my request' }, 404);
    await call('put', `/emergency/${sos._id}/status`, customer.token, { status: 'COMPLETED' }, 403);
    await call('put', `/admin/emergency/${sos._id}/assign`, admin.token, { providerId: mechanic._id });
    const assigned = await call('get', '/emergency/assigned', mechanic.token);
    assert.equal(assigned.length, 1);
    await call('post', `/emergency/${sos._id}/accept`, mechanic.token);
    await call('put', `/emergency/${sos._id}/status`, mechanic.token, { status: 'COMPLETED' }, 400);
    for (const status of ['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED']) await call('put', `/emergency/${sos._id}/status`, mechanic.token, { status });
    await call('post', `/emergency/${sos._id}/cancel`, customer.token, { reason: 'Already complete' }, 400);
    await call('post', '/auth/logout', mechanic.token, { refreshToken: mechanic.refresh });
    await call('post', '/auth/refresh', null, { refreshToken: mechanic.refresh }, 401);
    console.log(`PASS: ${checks} HTTP checks plus persisted booking metrics, location cleanup and SOS assignment assertions.`);
  } finally {
    // Only the random database created by this process may be dropped.
    assert.match(dbName, /^auto_pro_smoke_[a-f0-9]{16}$/);
    assert.equal(mongoose.connection.name, dbName);
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
