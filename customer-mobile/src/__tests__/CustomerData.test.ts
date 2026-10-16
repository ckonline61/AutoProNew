import { bookingPayload, emergencyPayload, mapAddress, mapBooking, mapCart, mapService, listRecords } from '../services/customer-data';
import api from '../config/api';
jest.mock('../config/api', () => ({ __esModule: true, default: { get: jest.fn() } }));
const tomorrow = () => { const date = new Date(); date.setDate(date.getDate()+1); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; };
beforeEach(() => jest.clearAllMocks());
test('booking DTO keeps the server state and final price including zero', () => {
  const result = mapBooking({ _id: 'b1', customerId: 'c1', status: 'ASSIGNED', finalPrice: 0, estimatedPrice: 900, vehicleId: { _id: 'v1', brand: 'Tata', model: 'Nexon', registrationNumber: 'ABC1234' }, serviceIds: [{ _id: 's1', name: 'Oil change', price: 900, duration: 60 }], scheduledDate: '2030-01-01T00:00:00.000Z', serviceType: 'WORKSHOP' });
  expect(result).toMatchObject({ id: 'b1', status: 'ASSIGNED', totalAmount: 0, serviceName: 'Oil change', vehicleId: 'v1', scheduledDate: '2030-01-01' });
});
test('booking payload excludes client amounts/status and rejects missing doorstep address', () => {
  const input = { vehicleId: 'v1', serviceId: 's1', serviceType: 'WORKSHOP' as const, scheduledDate: tomorrow(), scheduledTime: '10:00 AM' };
  expect(bookingPayload(input)).toEqual({ vehicleId: 'v1', serviceIds: ['s1'], serviceType: 'WORKSHOP', scheduledDate: input.scheduledDate, scheduledTime: '10:00 AM', notes: undefined });
  expect(() => bookingPayload({ ...input, serviceType: 'DOORSTEP' })).toThrow('address');
  expect(() => bookingPayload({ ...input, scheduledDate: '2030-02-30' })).toThrow('valid booking date');
  expect(() => bookingPayload({ ...input, scheduledDate: '2000-01-01' })).toThrow('past');
});
test('catalogue and address shapes are converted without fabricating prices', () => {
  expect(mapService({ _id: 's1', categoryId: { _id: 'cat1', name: 'Care' }, discountedPrice: 0, price: 100, duration: 45, features: ['Inspection'] })).toMatchObject({ categoryId: 'cat1', price: 0, estimatedDuration: '45 minutes', includedFeatures: ['Inspection'] });
  expect(mapAddress({ _id: 'a1', label: 'Home', addressLine1: 'House 1', addressLine2: 'Road 2', pincode: '411045' })).toMatchObject({ id: 'a1', title: 'Home', street: 'House 1, Road 2', zipCode: '411045' });
});
test('cart uses server unit prices and quantities, not catalogue estimates', () => {
  const cart = mapCart({ items: [{ sparePartId: { _id: 'p1', name: 'Filter', price: 600 }, price: 500, quantity: 2 }] });
  expect(cart[0]).toMatchObject({ sparePartId: 'p1', quantity: 2, unitPrice: 500 });
});
test('all paginated records are fetched and malformed responses do not become demo data', async () => {
  jest.mocked(api.get).mockResolvedValueOnce({ data: { data: [{ _id: 'one' }], pagination: { totalPages: 2 } } }).mockResolvedValueOnce({ data: { data: [{ _id: 'two' }], pagination: { totalPages: 2 } } });
  expect(await listRecords('/bookings',true)).toEqual([{ _id: 'one' }, { _id: 'two' }]);
  expect(api.get).toHaveBeenNthCalledWith(2,'/bookings',{ params: { page: 2, limit: 100 } });
  jest.mocked(api.get).mockResolvedValueOnce({ data: { data: null } });
  await expect(listRecords('/vehicles')).rejects.toThrow('invalid list');
});
test('SOS rejects invalid coordinates and sends the actual selected type', () => {
  expect(() => emergencyPayload({ problemType: 'BREAKDOWN', latitude: 100, longitude: 10 })).toThrow('latitude');
  expect(() => emergencyPayload({ problemType: 'FUEL_DELIVERY', latitude: 10, longitude: 10 })).toThrow('valid emergency type');
  expect(emergencyPayload({ problemType: 'FUEL_EMERGENCY', latitude: 18.5, longitude: 73.8 })).toMatchObject({ problemType: 'FUEL_EMERGENCY', latitude: 18.5, longitude: 73.8, priority: 'HIGH' });
});
