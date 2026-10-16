import api from '../config/api';
import { Address, Booking, BookingStatus, FuelType, Notification, Service, ServiceCategory, SparePart, UsedCarListing, Vehicle } from '../types';
export type RecordData = Record<string, unknown>;
export const record = (value: unknown): RecordData => value && typeof value === 'object' ? value as RecordData : {};
export const idOf = (value: unknown): string => typeof value === 'string' ? value : String(record(value).id || record(value)._id || '');
const text = (value: unknown): string => typeof value === 'string' ? value : '';
const strings = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : [];
const numeric = (value: unknown): number => typeof value === 'number' ? value : 0;
export function mapVehicle(value: unknown): Vehicle {
  const v = record(value);
  return { id: idOf(v), userId: idOf(v.userId), brand: text(v.brand), model: text(v.model), registrationNumber: text(v.registrationNumber), year: numeric(v.year), fuelType: text(v.fuelType) as FuelType, color: text(v.color), mileage: numeric(v.mileage) };
}
export function mapAddress(value: unknown): Address {
  const a = record(value);
  return { id: idOf(a), userId: idOf(a.userId), title: text(a.label || a.title), street: [a.addressLine1 || a.street, a.addressLine2].filter(Boolean).join(', '), city: text(a.city), state: text(a.state), zipCode: text(a.pincode || a.zipCode), isDefault: Boolean(a.isDefault) };
}
export function mapService(value: unknown): Service {
  const s = record(value);
  return { id: idOf(s), categoryId: idOf(s.categoryId), categoryName: text(record(s.categoryId).name), name: text(s.name), description: text(s.description), price: numeric(s.discountedPrice ?? s.price), estimatedDuration: `${numeric(s.duration)} minutes`, includedFeatures: strings(s.features), imageUrl: text(s.image) };
}
export function mapBooking(value: unknown, vehicles: Vehicle[] = [], addresses: Address[] = [], services: Service[] = []): Booking {
  const b = record(value);
  const vehicleId = idOf(b.vehicleId);
  const vehicle = typeof b.vehicleId === 'object' ? mapVehicle(b.vehicleId) : vehicles.find(v => v.id === vehicleId);
  const relatedServices = Array.isArray(b.serviceIds) ? b.serviceIds.map(s => typeof s === 'object' ? mapService(s) : services.find(v => v.id === idOf(s))).filter((s): s is Service => !!s) : [];
  const address = typeof b.addressId === 'object' && b.addressId ? mapAddress(b.addressId) : addresses.find(a => a.id === idOf(b.addressId));
  const mechanic = record(b.mechanicId);
  return { id: idOf(b), userId: idOf(b.customerId), serviceId: relatedServices[0]?.id || idOf(Array.isArray(b.serviceIds) ? b.serviceIds[0] : ''), serviceName: relatedServices.map(s => s.name).join(', ') || 'Service booking', vehicleId, vehicleDetails: vehicle, address, scheduledDate: text(b.scheduledDate).slice(0,10), scheduledTime: text(b.scheduledTime), serviceType: text(b.serviceType) as Booking['serviceType'], status: text(b.status) as BookingStatus, totalAmount: numeric(b.finalPrice ?? b.estimatedPrice), notes: text(b.notes), createdAt: text(b.createdAt), updatedAt: text(b.updatedAt), mechanic: idOf(mechanic) ? { id: idOf(mechanic), name: text(mechanic.name), phone: text(mechanic.phone), rating: numeric(mechanic.rating) } : undefined };
}
export function mapCategory(value: unknown): ServiceCategory {
  const c = record(value);
  return { id: idOf(c), name: text(c.name), code: text(c.code) as ServiceCategory['code'], icon: text(c.icon) || '🔧', description: text(c.description), startingPrice: numeric(c.startingPrice) };
}
export function mapPart(value: unknown): SparePart {
  const p = record(value);
  return { id: idOf(p), name: text(p.name), category: text(p.categoryTag), brand: text(p.brand), price: numeric(p.discountedPrice ?? p.price), originalPrice: numeric(p.price), stock: numeric(p.stock), imageUrl: strings(p.images)[0] || '', compatibility: strings(p.compatibility), description: text(p.description) };
}
export function mapCar(value: unknown): UsedCarListing {
  const c = record(value);
  return { id: idOf(c), brand: text(c.brand), model: text(c.model), variant: text(c.variant), year: numeric(c.year), price: numeric(c.price), mileage: numeric(c.mileage), fuelType: text(c.fuelType) as FuelType, transmission: text(c.transmission) as UsedCarListing['transmission'], ownersCount: numeric(c.ownersCount), location: typeof c.location === 'string' ? c.location : [record(c.location).city,record(c.location).state].filter(Boolean).join(', '), imageUrl: strings(c.images)[0] || '', verified: !!c.inspectionReportId, description: text(c.description), createdAt: text(c.createdAt) };
}
export function mapNotification(value: unknown): Notification {
  const n = record(value);
  return { id: idOf(n), userId: idOf(n.userId), title: text(n.title), message: text(n.message), isRead: Boolean(n.isRead), type: text(n.type) as Notification['type'], createdAt: text(n.createdAt) };
}
export async function listRecords(path: string, paginated = false): Promise<unknown[]> {
  const result: unknown[] = [];
  let page = 1;
  let pages = 1;
  do {
    const response = await api.get(path, paginated ? { params: { page, limit: 100 } } : undefined);
    if (!Array.isArray(response.data?.data)) throw new Error('The server returned an invalid list response.');
    result.push(...response.data.data);
    pages = paginated ? Number(response.data.pagination?.totalPages || 1) : 1;
    page++;
  } while (page <= pages);
  return result;
}
export function bookingPayload(input: { vehicleId: string; serviceId: string; addressId?: string; scheduledDate: string; scheduledTime: string; serviceType: Booking['serviceType']; notes?: string }) {
  if (!input.vehicleId || !input.serviceId) throw new Error('Select a vehicle and service.');
  if (input.serviceType === 'DOORSTEP' && !input.addressId) throw new Error('Add and select a doorstep address first.');
  const parsed = new Date(`${input.scheduledDate}T12:00:00`);
  const localDate = `${parsed.getFullYear()}-${String(parsed.getMonth()+1).padStart(2,'0')}-${String(parsed.getDate()).padStart(2,'0')}`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.scheduledDate) || !Number.isFinite(parsed.getTime()) || localDate !== input.scheduledDate) throw new Error('Enter a valid booking date (YYYY-MM-DD).');
  const today = new Date(); today.setHours(0,0,0,0);
  if (parsed < today) throw new Error('The booking date cannot be in the past.');
  return { vehicleId: input.vehicleId, serviceIds: [input.serviceId], serviceType: input.serviceType, ...(input.serviceType === 'DOORSTEP' ? { addressId: input.addressId } : {}), scheduledDate: input.scheduledDate, scheduledTime: input.scheduledTime, notes: input.notes };
}

export function mapCart(value: unknown): import('../types').CartItem[] {
  const cart = record(value);
  if (!Array.isArray(cart.items)) throw new Error('The server returned an invalid cart.');
  return cart.items.map(value => {
    const item = record(value); const part = mapPart(item.sparePartId);
    return { id: idOf(item) || idOf(item.sparePartId), sparePartId: idOf(item.sparePartId), sparePart: part, quantity: numeric(item.quantity), unitPrice: numeric(item.price) };
  });
}
export function mapOrder(value: unknown): import('./order-types').OrderView {
  const order = record(value);
  return { id: idOf(order), number: text(order.orderNumber), status: text(order.status), paymentStatus: text(order.paymentStatus), totalAmount: numeric(order.totalAmount), createdAt: text(order.createdAt), items: Array.isArray(order.items) ? order.items.map(value => { const item = record(value); return { name: text(item.name), quantity: numeric(item.quantity), price: numeric(item.price) }; }) : [] };
}

export function emergencyPayload(input: { problemType: string; latitude: number; longitude: number; description?: string; address?: string }) {
  if (!['JUMP_START','BATTERY_PROBLEM','FLAT_TYRE','TYRE_REPLACEMENT','FUEL_EMERGENCY','BREAKDOWN','ENGINE_PROBLEM','ACCIDENT_ASSISTANCE','TOWING','OTHER'].includes(input.problemType)) throw new Error('Choose a valid emergency type.');
  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90 || !Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) throw new Error('Enter valid latitude and longitude.');
  return { ...input, priority: 'HIGH' };
}
