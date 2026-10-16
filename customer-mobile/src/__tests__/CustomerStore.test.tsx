import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { CustomerDataProvider, useCustomerData } from '../contexts/CustomerDataContext';
import api from '../config/api';
let mockMode = true;
jest.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'customer1' }, isAuthenticated: true, isPreview: mockMode }) }));
jest.mock('../config/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() } }));
let data: ReturnType<typeof useCustomerData>; let tree: ReactTestRenderer;
function Consumer() { data = useCustomerData(); return null; }
beforeEach(() => { jest.clearAllMocks(); mockMode = true; jest.mocked(api.get).mockImplementation(async path => ({ data: { data: path === '/cart' ? { items: [] } : [] } })); });
afterEach(async () => { if (tree) await act(async () => tree.unmount()); });
const mount = async () => { await act(async () => { tree = create(<CustomerDataProvider><Consumer /></CustomerDataProvider>); }); };
test('sample vehicle changes and bookings survive navigation without real requests', async () => {
  await mount();
  const vehicleCount = data.vehicles.length;
  await act(async () => { await data.saveVehicle({ brand: 'Tata', model: 'Nexon', year: 2024, fuelType: 'PETROL', registrationNumber: 'MH12AB1234' }); });
  expect(data.vehicles).toHaveLength(vehicleCount+1);
  const date = new Date(); date.setDate(date.getDate()+1); const scheduledDate = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  await act(async () => { await data.createBooking({ serviceId: data.services[0].id, vehicleId: data.vehicles[0].id, addressId: data.addresses[0].id, serviceType: 'DOORSTEP', scheduledDate, scheduledTime: '10:00 AM' }); });
  expect(data.bookings[0].status).toBe('PENDING');
  expect(data.bookings[0].mechanic).toBeUndefined();
  expect(api.post).not.toHaveBeenCalled();
});
test('failed real save leaves local data unchanged', async () => {
  mockMode = false; await mount();
  jest.mocked(api.post).mockRejectedValueOnce(new Error('Server unavailable'));
  await act(async () => { await expect(data.saveVehicle({ brand: 'Tata', model: 'Nexon', year: 2024, fuelType: 'PETROL', registrationNumber: 'MH12AB1234' })).rejects.toThrow('Server unavailable'); });
  expect(data.vehicles).toHaveLength(0);
});
test('real account loads empty server lists instead of filling them with fake bookings', async () => {
  mockMode = false; await mount();
  expect(data.bookings).toEqual([]); expect(data.vehicles).toEqual([]); expect(data.services).toEqual([]);
  expect(data.errors).toEqual([]);
});
test('sample cart quantities and checkout update the shared order history', async () => {
  await mount(); const part = data.spareParts[0];
  await act(async () => { await data.addPart(part); });
  expect(data.cart[0].quantity).toBe(1);
  await act(async () => { await data.updateCartQuantity(part.id,2); });
  await act(async () => { await data.placeOrder(data.addresses[0]); });
  expect(data.cart).toHaveLength(0); expect(data.orders[0].items[0].quantity).toBe(2); expect(data.orders[0].paymentStatus).toBe('PENDING');
  expect(api.post).not.toHaveBeenCalled();
});
