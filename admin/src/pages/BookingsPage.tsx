import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { Booking } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

const initialMockBookings: Booking[] = [
  {
    id: 'b-001',
    bookingNumber: 'BK-2026-981',
    userId: 'u-1',
    user: { id: 'u-1', name: 'John Doe', email: 'john@example.com', phone: '+1 555-0192' },
    mechanicId: 'm-1',
    mechanic: { id: 'm-1', name: 'Alex Rivera', phone: '+1 555-8833' },
    serviceName: 'Full Engine Diagnostic',
    amount: 150,
    status: 'CONFIRMED',
    date: '2026-10-14',
    scheduledTime: '10:00 AM',
    vehicleDetails: { make: 'Toyota', model: 'Camry', year: 2021, licensePlate: 'ABC-1234' },
    createdAt: '2026-10-10T14:22:00Z',
  },
  {
    id: 'b-002',
    bookingNumber: 'BK-2026-982',
    userId: 'u-2',
    user: { id: 'u-2', name: 'Sarah Jenkins', email: 'sarah@example.com', phone: '+1 555-0193' },
    mechanicId: 'm-2',
    mechanic: { id: 'm-2', name: 'Carlos Ramos', phone: '+1 555-4422' },
    serviceName: 'Brake Pad Replacement',
    amount: 220,
    status: 'IN_PROGRESS',
    date: '2026-10-13',
    scheduledTime: '02:30 PM',
    vehicleDetails: { make: 'Honda', model: 'Civic', year: 2019, licensePlate: 'XYZ-5678' },
    createdAt: '2026-10-11T09:15:00Z',
  },
  {
    id: 'b-003',
    bookingNumber: 'BK-2026-983',
    userId: 'u-3',
    user: { id: 'u-3', name: 'David Kim', email: 'david@example.com', phone: '+1 555-0194' },
    serviceName: 'Oil & Filter Change',
    amount: 85,
    status: 'PENDING',
    date: '2026-10-15',
    scheduledTime: '11:00 AM',
    vehicleDetails: { make: 'Ford', model: 'F-150', year: 2020, licensePlate: 'TRK-9900' },
    createdAt: '2026-10-12T08:00:00Z',
  },
  {
    id: 'b-004',
    bookingNumber: 'BK-2026-984',
    userId: 'u-4',
    user: { id: 'u-4', name: 'Elena Rostova', email: 'elena@example.com', phone: '+1 555-0195' },
    mechanicId: 'm-1',
    mechanic: { id: 'm-1', name: 'Alex Rivera', phone: '+1 555-8833' },
    serviceName: 'Transmission Flush',
    amount: 310,
    status: 'COMPLETED',
    date: '2026-10-09',
    scheduledTime: '03:00 PM',
    vehicleDetails: { make: 'BMW', model: '330i', year: 2022, licensePlate: 'BM-3301' },
    createdAt: '2026-10-08T11:45:00Z',
  },
];

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(initialMockBookings);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/bookings?page=${page}&limit=10`);
        if (res.data?.data && Array.isArray(res.data.data)) {
          setBookings(res.data.data);
        }
      } catch {
        // Fallback to initial mock
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [page]);

  const columns: Column<Booking>[] = [
    {
      header: 'Booking #',
      accessorKey: 'bookingNumber',
      cell: (b) => <span className="font-semibold text-blue-600">{b.bookingNumber}</span>,
    },
    {
      header: 'Customer',
      cell: (b) => (
        <div>
          <div className="font-medium text-gray-900">{b.user?.name || 'Customer'}</div>
          <div className="text-xs text-gray-500">{b.user?.phone || 'No phone'}</div>
        </div>
      ),
    },
    {
      header: 'Service',
      cell: (b) => <span>{b.serviceName || b.service?.name || 'General Service'}</span>,
    },
    {
      header: 'Status',
      cell: (b) => <StatusBadge status={b.status} />,
    },
    {
      header: 'Date',
      cell: (b) => (
        <div>
          <span>{b.date}</span>
          {b.scheduledTime && <span className="text-xs text-gray-400 block">{b.scheduledTime}</span>}
        </div>
      ),
    },
    {
      header: 'Amount',
      cell: (b) => <span className="font-medium text-gray-900">${b.amount}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Bookings Management"
        description="Review scheduled appointments, assign mechanics, and monitor service completion"
      />

      <DataTable
        columns={columns}
        data={bookings}
        isLoading={loading}
        onRowClick={(booking) => setSelectedBooking(booking)}
        pagination={{
          currentPage: page,
          totalPages: 1,
          onPageChange: (p) => setPage(p),
          totalItems: bookings.length,
        }}
      />

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={`Booking Details: ${selectedBooking?.bookingNumber || ''}`}
        footer={
          <button
            onClick={() => setSelectedBooking(null)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        }
      >
        {selectedBooking && (
          <div className="space-y-4 text-sm text-gray-700">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Customer</p>
                <p className="font-medium text-gray-900 mt-1">{selectedBooking.user?.name}</p>
                <p className="text-xs text-gray-500">{selectedBooking.user?.email}</p>
                <p className="text-xs text-gray-500">{selectedBooking.user?.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Assigned Mechanic</p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedBooking.mechanic?.name || 'Unassigned'}
                </p>
                <p className="text-xs text-gray-500">{selectedBooking.mechanic?.phone || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Service</p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedBooking.serviceName || selectedBooking.service?.name}
                </p>
                <p className="text-xs text-gray-500">Total: ${selectedBooking.amount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedBooking.status} />
                </div>
              </div>
            </div>

            {selectedBooking.vehicleDetails && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs font-semibold text-gray-600 mb-1">Vehicle Information</p>
                <p className="text-gray-900">
                  {selectedBooking.vehicleDetails.year} {selectedBooking.vehicleDetails.make}{' '}
                  {selectedBooking.vehicleDetails.model} (Plate:{' '}
                  {selectedBooking.vehicleDetails.licensePlate})
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
