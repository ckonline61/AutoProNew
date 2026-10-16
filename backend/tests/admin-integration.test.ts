import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { config } from '../src/config';
import { UserRole } from '../src/types';
import { User } from '../src/models/user.model';
import { adminResourcesService } from '../src/services/admin-resources.service';
import { catalogAdminService } from '../src/services/catalog-admin.service';
import { bookingService } from '../src/services/booking.service';
import { auditService } from '../src/services/audit.service';
jest.mock('../src/models/user.model');
jest.mock('../src/services/admin-resources.service');
jest.mock('../src/services/catalog-admin.service');
jest.mock('../src/services/booking.service');
jest.mock('../src/services/audit.service');
const userId = '507f1f77bcf86cd799439011'; const recordId = '507f1f77bcf86cd799439022';
let role = UserRole.ADMIN;
const token = () => jwt.sign({ userId, email:'admin@example.test', role },config.jwt.secret,{expiresIn:'1h'});
beforeEach(() => { jest.clearAllMocks(); role = UserRole.ADMIN; (User.findById as jest.Mock).mockImplementation(async () => ({ _id:userId,role,isActive:true })); (auditService.log as jest.Mock).mockResolvedValue({}); });
test('administrative resource lists reject anonymous and customer requests', async () => {
  expect((await request(app).get('/api/v1/admin/resources/orders')).status).toBe(401);
  role = UserRole.CUSTOMER;
  expect((await request(app).get('/api/v1/admin/resources/orders').set('Authorization',`Bearer ${token()}`)).status).toBe(403);
  expect(adminResourcesService.list).not.toHaveBeenCalled();
});
test('resource names and pagination are validated before querying', async () => {
  expect((await request(app).get('/api/v1/admin/resources/secrets').set('Authorization',`Bearer ${token()}`)).status).toBe(422);
  expect((await request(app).get('/api/v1/admin/resources/orders?limit=1000').set('Authorization',`Bearer ${token()}`)).status).toBe(422);
  expect(adminResourcesService.list).not.toHaveBeenCalled();
});
test('administrator resource list uses validated pagination and an authoritative response', async () => {
  (adminResourcesService.list as jest.Mock).mockResolvedValue({ items:[{_id:recordId}],pagination:{page:2,limit:25,total:26,totalPages:2} });
  const response = await request(app).get('/api/v1/admin/resources/orders?page=2&limit=25').set('Authorization',`Bearer ${token()}`);
  expect(response.status).toBe(200); expect(response.body.data).toEqual([{_id:recordId}]); expect(adminResourcesService.list).toHaveBeenCalledWith('orders',2,25);
});
test('customer credentials cannot create services', async () => {
  role = UserRole.CUSTOMER;
  const response = await request(app).post('/api/v1/services').set('Authorization',`Bearer ${token()}`).send({name:'Care'});
  expect(response.status).toBe(403); expect(catalogAdminService.create).not.toHaveBeenCalled();
});
test('invalid service input cannot reach catalogue mutations', async () => {
  const response = await request(app).post('/api/v1/services').set('Authorization',`Bearer ${token()}`).send({ categoryId:recordId,name:'Care',description:'Inspection',price:-1,duration:60 });
  expect(response.status).toBe(422); expect(catalogAdminService.create).not.toHaveBeenCalled();
});
test('valid service creation is recorded in the audit log', async () => {
  (catalogAdminService.create as jest.Mock).mockResolvedValue({ _id:recordId,name:'Care' });
  const response = await request(app).post('/api/v1/services').set('Authorization',`Bearer ${token()}`).send({ categoryId:recordId,name:'Care',description:'Inspection',price:500,duration:60 });
  expect(response.status).toBe(201); expect(auditService.log).toHaveBeenCalledWith(userId,'CREATE','Service',recordId,{name:'Care'});
});
test('administrator cannot deactivate their own account', async () => {
  const response = await request(app).put(`/api/v1/admin/users/${userId}/status`).set('Authorization',`Bearer ${token()}`).send({isActive:false});
  expect(response.status).toBe(400); expect(response.body.message).toMatch(/own administrator/);
});
test('booking status endpoint does not let administrators bypass job completion', async () => {
  const response = await request(app).put(`/api/v1/admin/bookings/${recordId}/status`).set('Authorization',`Bearer ${token()}`).send({status:'COMPLETED'});
  expect(response.status).toBe(422); expect(bookingService.updateStatus).not.toHaveBeenCalled();
});
test('assignment requests use the authenticated administrator identity', async () => {
  (bookingService.assignMechanic as jest.Mock).mockResolvedValue({ _id:recordId,status:'ASSIGNED' });
  const response = await request(app).put(`/api/v1/admin/bookings/${recordId}/assign`).set('Authorization',`Bearer ${token()}`).send({mechanicId:recordId});
  expect(response.status).toBe(200); expect(bookingService.assignMechanic).toHaveBeenCalledWith(recordId,recordId,userId);
});
