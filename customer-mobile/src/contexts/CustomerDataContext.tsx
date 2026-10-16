import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { isAxiosError } from 'axios';
import api from '../config/api';
import { useAuth } from './AuthContext';
import { Address, Booking, CartItem, Notification, Service, ServiceCategory, SparePart, UsedCarListing, Vehicle } from '../types';
import { INITIAL_ADDRESSES, INITIAL_BOOKINGS, INITIAL_VEHICLES, SAMPLE_NOTIFICATIONS, SAMPLE_SERVICES, SAMPLE_SPARE_PARTS, SAMPLE_USED_CARS, SERVICE_CATEGORIES } from '../data/mockData';
import { bookingPayload, listRecords, mapAddress, mapBooking, mapCar, mapCategory, mapNotification, mapPart, mapService, mapVehicle, mapCart, mapOrder, record, RecordData, emergencyPayload } from '../services/customer-data';
import { OrderView } from '../services/order-types';
interface DataState { emergencies: RecordData[]; cart: CartItem[]; orders: OrderView[]; vehicles: Vehicle[]; addresses: Address[]; bookings: Booking[]; services: Service[]; categories: ServiceCategory[]; notifications: Notification[]; spareParts: SparePart[]; usedCars: UsedCarListing[]; }
const emptyState = (): DataState => ({ emergencies: [], cart: [], orders: [], vehicles: [], addresses: [], bookings: [], services: [], categories: [], notifications: [], spareParts: [], usedCars: [] });
const sampleState = (): DataState => ({ emergencies: [], cart: [], orders: [], vehicles: [...INITIAL_VEHICLES], addresses: [...INITIAL_ADDRESSES], bookings: [...INITIAL_BOOKINGS], services: [...SAMPLE_SERVICES], categories: [...SERVICE_CATEGORIES], notifications: [...SAMPLE_NOTIFICATIONS], spareParts: [...SAMPLE_SPARE_PARTS], usedCars: [...SAMPLE_USED_CARS] });
export const requestError = (error: unknown) => isAxiosError(error) ? error.response?.data?.message || 'Cannot reach the API. Check your connection and retry.' : error instanceof Error ? error.message : 'Unable to complete the request.';
interface DataContextType extends DataState {
  loading: boolean; errors: string[]; refresh: () => Promise<void>;
  saveVehicle: (value: Omit<Vehicle, 'id' | 'userId'>, id?: string) => Promise<Vehicle>;
  removeVehicle: (id: string) => Promise<void>;
  saveAddress: (value: Omit<Address, 'id' | 'userId'>, id?: string) => Promise<Address>;
  removeAddress: (id: string) => Promise<void>;
  createBooking: (input: Parameters<typeof bookingPayload>[0]) => Promise<Booking>;
  cancelBooking: (id: string, reason: string) => Promise<Booking>;
  markRead: (id?: string) => Promise<void>;
  addPart: (part: SparePart) => Promise<void>;
  updateCartQuantity: (id: string, quantity: number) => Promise<void>;
  placeOrder: (address: Address) => Promise<OrderView>;
  createEmergency: (input: Parameters<typeof emergencyPayload>[0]) => Promise<RecordData>;
  refreshEmergency: (id: string) => Promise<void>;
  cancelEmergency: (id: string) => Promise<void>;
}
const DataContext = createContext<DataContextType | undefined>(undefined);
export const CustomerDataProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user, isAuthenticated, isPreview } = useAuth();
  const [data, setData] = useState<DataState>(emptyState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    if (!isAuthenticated || isPreview) return;
    const active = generation.current;
    setLoading(true); setErrors([]);
    const resources = [
      { key: 'vehicles', path: '/vehicles', mapper: mapVehicle },
      { key: 'addresses', path: '/addresses', mapper: mapAddress },
      { key: 'bookings', path: '/bookings', mapper: mapBooking, paginated: true },
      { key: 'services', path: '/services', mapper: mapService, paginated: true },
      { key: 'categories', path: '/services/categories', mapper: mapCategory },
      { key: 'notifications', path: '/notifications', mapper: mapNotification, paginated: true },
      { key: 'spareParts', path: '/spare-parts', mapper: mapPart, paginated: true },
      { key: 'emergencies', path: '/emergency', mapper: record, paginated: true },
      { key: 'orders', path: '/orders', mapper: mapOrder, paginated: true },
      { key: 'usedCars', path: '/used-cars', mapper: mapCar, paginated: true },
    ] as const;
    const allResults = await Promise.allSettled([...resources.map(r => listRecords(r.path, 'paginated' in r && r.paginated)), api.get('/cart').then(response => response.data.data)]);
    const results = allResults.slice(0, resources.length);
    if (active !== generation.current) return;
    const patch: Partial<DataState> = {};
    const failures: string[] = [];
    results.forEach((result, index) => {
      const resource = resources[index];
      if (result.status === 'rejected') failures.push(`${resource.key}: ${requestError(result.reason)}`);
      else Object.assign(patch, { [resource.key]: (result.value as unknown[]).map(value => resource.mapper(value)) });
    });
    const cartResult = allResults[resources.length];
    if (cartResult.status === 'fulfilled') { try { patch.cart = mapCart(cartResult.value); } catch (error) { failures.push(`cart: ${requestError(error)}`); } }
    else failures.push(`cart: ${requestError(cartResult.reason)}`);
    setData(previous => ({ ...previous, ...patch })); setErrors(failures); setLoading(false);
  }, [isAuthenticated, isPreview]);
  useEffect(() => {
    generation.current++;
    setData(isPreview ? sampleState() : emptyState()); setErrors([]); setLoading(false);
    void refresh();
    return () => { generation.current++; };
  }, [user?.id, isPreview, refresh]);
  const saveVehicle = async (value: Omit<Vehicle,'id'|'userId'>, id?: string) => {
    const active = generation.current;
    const payload = { brand: value.brand, model: value.model, year: value.year, fuelType: value.fuelType, registrationNumber: value.registrationNumber, mileage: value.mileage };
    const vehicle = isPreview ? { ...value, id: id || `preview-vehicle-${Date.now()}`, userId: user?.id || '' } : mapVehicle((await (id ? api.put(`/vehicles/${id}`, payload) : api.post('/vehicles', payload))).data.data);
    if (active === generation.current) setData(previous => ({ ...previous, vehicles: [...previous.vehicles.filter(v => v.id !== vehicle.id), vehicle] }));
    return vehicle;
  };
  const removeVehicle = async (id: string) => {
    const active = generation.current; if (!isPreview) await api.delete(`/vehicles/${id}`);
    if (active === generation.current) setData(previous => ({ ...previous, vehicles: previous.vehicles.filter(v => v.id !== id) }));
  };
  const saveAddress = async (value: Omit<Address,'id'|'userId'>, id?: string) => {
    const active = generation.current;
    const payload = { label: value.title, addressLine1: value.street, city: value.city, state: value.state, pincode: value.zipCode, isDefault: value.isDefault };
    const address = isPreview ? { ...value, id: id || `preview-address-${Date.now()}`, userId: user?.id || '' } : mapAddress((await (id ? api.put(`/addresses/${id}`, payload) : api.post('/addresses', payload))).data.data);
    if (active === generation.current) setData(previous => ({ ...previous, addresses: [...previous.addresses.filter(a => a.id !== address.id).map(a => address.isDefault ? { ...a, isDefault: false } : a), address] }));
    return address;
  };
  const removeAddress = async (id: string) => {
    const active = generation.current; if (!isPreview) await api.delete(`/addresses/${id}`);
    if (active === generation.current) setData(previous => ({ ...previous, addresses: previous.addresses.filter(a => a.id !== id) }));
  };
  const createBooking = async (input: Parameters<typeof bookingPayload>[0]) => {
    const payload = bookingPayload(input); const active = generation.current;
    let booking: Booking;
    if (isPreview) {
      const service = data.services.find(s => s.id === input.serviceId);
      const vehicle = data.vehicles.find(v => v.id === input.vehicleId);
      booking = { id: `preview-booking-${Date.now()}`, userId: user?.id || '', serviceId: input.serviceId, serviceName: service?.name || 'Service', vehicleId: input.vehicleId, vehicleDetails: vehicle, address: data.addresses.find(a => a.id === input.addressId), scheduledDate: input.scheduledDate, scheduledTime: input.scheduledTime, serviceType: input.serviceType, status: 'PENDING', totalAmount: service?.price || 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    } else booking = mapBooking((await api.post('/bookings', payload)).data.data, data.vehicles, data.addresses, data.services);
    if (active === generation.current) setData(previous => ({ ...previous, bookings: [booking, ...previous.bookings.filter(b => b.id !== booking.id)] }));
    return booking;
  };
  const cancelBooking = async (id: string, reason: string) => {
    const active = generation.current; const existing = data.bookings.find(b => b.id === id);
    if (!existing) throw new Error('Booking not found. Refresh your bookings.');
    const booking = isPreview ? { ...existing, status: 'CANCELLED' as const } : { ...existing, ...mapBooking((await api.post(`/bookings/${id}/cancel`, { reason })).data.data, data.vehicles, data.addresses, data.services) };
    if (active === generation.current) setData(previous => ({ ...previous, bookings: previous.bookings.map(b => b.id === id ? booking : b) }));
    return booking;
  };
  const markRead = async (id?: string) => {
    const active = generation.current; if (!isPreview) await api.put(id ? `/notifications/${id}/read` : '/notifications/read-all');
    if (active === generation.current) setData(previous => ({ ...previous, notifications: previous.notifications.map(n => !id || n.id === id ? { ...n, isRead: true } : n) }));
  };
  const addPart = async (part: SparePart) => {
    if (part.stock < 1) throw new Error('This part is out of stock.');
    if (isPreview && (data.cart.find(item => item.sparePartId === part.id)?.quantity || 0) >= part.stock) throw new Error('Stock limit reached.');
    const active = generation.current;
    if (isPreview) setData(previous => {
      const item = previous.cart.find(item => item.sparePartId === part.id);
      if ((item?.quantity || 0) >= part.stock) return previous;
      return { ...previous, cart: item ? previous.cart.map(item => item.sparePartId === part.id ? { ...item, quantity: item.quantity + 1 } : item) : [...previous.cart, { id: part.id, sparePartId: part.id, sparePart: part, quantity: 1, unitPrice: part.price }] };
    });
    else {
      const cart = mapCart((await api.post('/cart/items', { sparePartId: part.id, quantity: 1 })).data.data);
      if (active === generation.current) setData(previous => ({ ...previous, cart }));
    }
  };
  const updateCartQuantity = async (id: string, quantity: number) => {
    const active = generation.current;
    if (!Number.isInteger(quantity) || quantity < 0) throw new Error('Invalid quantity.');
    if (isPreview) {
      const item = data.cart.find(item => item.sparePartId === id);
      if (item && quantity > item.sparePart.stock) throw new Error('Stock limit reached.');
      setData(previous => ({ ...previous, cart: quantity === 0 ? previous.cart.filter(item => item.sparePartId !== id) : previous.cart.map(item => item.sparePartId === id ? { ...item, quantity } : item) }));
    } else {
      const cart = mapCart((await (quantity === 0 ? api.delete(`/cart/items/${id}`) : api.put(`/cart/items/${id}`, { quantity }))).data.data);
      if (active === generation.current) setData(previous => ({ ...previous, cart }));
    }
  };
  const placeOrder = async (address: Address) => {
    if (!data.cart.length) throw new Error('Your cart is empty.');
    const active = generation.current;
    const order: OrderView = isPreview ? { id: `preview-order-${Date.now()}`, number: 'Preview order', status: 'PLACED', paymentStatus: 'PENDING', createdAt: new Date().toISOString(), totalAmount: data.cart.reduce((total,item) => total + (item.unitPrice ?? item.sparePart.price) * item.quantity, 0), items: data.cart.map(item => ({ name: item.sparePart.name, price: item.unitPrice ?? item.sparePart.price, quantity: item.quantity })) } : mapOrder((await api.post('/orders', { expectedTotal: data.cart.reduce((total,item) => total + (item.unitPrice ?? item.sparePart.price) * item.quantity,0), shippingAddress: { addressLine1: address.street, city: address.city, state: address.state, pincode: address.zipCode } })).data.data);
    if (active === generation.current) setData(previous => ({ ...previous, cart: [], orders: [order, ...previous.orders] }));
    return order;
  };

  const createEmergency = async (input: Parameters<typeof emergencyPayload>[0]) => {
    const payload = emergencyPayload(input); const active = generation.current;
    const emergency = isPreview ? { ...payload, id: `preview-emergency-${Date.now()}`, status: 'SEARCHING', createdAt: new Date().toISOString() } : record((await api.post('/emergency', payload)).data.data);
    if (active === generation.current) setData(previous => ({ ...previous, emergencies: [emergency, ...previous.emergencies] }));
    return emergency;
  };
  const refreshEmergency = async (id: string) => {
    if (isPreview) return; const active = generation.current;
    const emergency = record((await api.get(`/emergency/${id}`)).data.data);
    if (active === generation.current) setData(previous => ({ ...previous, emergencies: previous.emergencies.map(value => String(value.id || value._id) === id ? emergency : value) }));
  };
  const cancelEmergency = async (id: string) => {
    const active = generation.current;
    const emergency = isPreview ? { ...data.emergencies.find(value => String(value.id || value._id) === id), status: 'CANCELLED' } : record((await api.post(`/emergency/${id}/cancel`, { reason: 'Cancelled by customer in app' })).data.data);
    if (active === generation.current) setData(previous => ({ ...previous, emergencies: previous.emergencies.map(value => String(value.id || value._id) === id ? emergency : value) }));
  };

  return <DataContext.Provider value={{ ...data, loading, errors, refresh, saveVehicle, removeVehicle, saveAddress, removeAddress, createBooking, cancelBooking, markRead, addPart, updateCartQuantity, placeOrder, createEmergency, refreshEmergency, cancelEmergency }}>{children}</DataContext.Provider>;
};
export function useCustomerData(): DataContextType {
  const context = useContext(DataContext); if (!context) throw new Error('CustomerDataProvider is missing.'); return context;
}
