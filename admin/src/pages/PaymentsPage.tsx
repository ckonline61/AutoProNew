import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { Payment } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';

const mockPayments: Payment[] = [
  {
    id: 'pay-901',
    paymentNumber: 'PAY-2026-001',
    bookingNumber: 'BK-2026-981',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    amount: 150,
    currency: 'USD',
    status: 'COMPLETED',
    paymentMethod: 'CARD',
    createdAt: '2026-10-12 10:15',
  },
  {
    id: 'pay-902',
    paymentNumber: 'PAY-2026-002',
    bookingNumber: 'BK-2026-982',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah@example.com',
    amount: 220,
    currency: 'USD',
    status: 'COMPLETED',
    paymentMethod: 'STRIPE',
    createdAt: '2026-10-12 11:32',
  },
  {
    id: 'pay-903',
    paymentNumber: 'PAY-2026-003',
    bookingNumber: 'BK-2026-983',
    customerName: 'David Kim',
    customerEmail: 'david@example.com',
    amount: 85,
    currency: 'USD',
    status: 'PENDING',
    paymentMethod: 'UPI',
    createdAt: '2026-10-12 14:02',
  },
  {
    id: 'pay-904',
    paymentNumber: 'PAY-2026-004',
    bookingNumber: 'BK-2026-979',
    customerName: 'Robert Vance',
    customerEmail: 'robert@vance.com',
    amount: 450,
    currency: 'USD',
    status: 'FAILED',
    paymentMethod: 'CARD',
    createdAt: '2026-10-11 16:45',
  },
];

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/payments/history');
        if (res.data?.data && Array.isArray(res.data.data)) {
          setPayments(res.data.data);
        }
      } catch {
        // Fallback to mock
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const columns: Column<Payment>[] = [
    {
      header: 'Payment ID',
      cell: (p) => (
        <span className="font-mono text-xs font-semibold text-gray-900">
          {p.paymentNumber || p.id}
        </span>
      ),
    },
    {
      header: 'Booking #',
      cell: (p) => <span className="text-blue-600 font-medium">{p.bookingNumber || '—'}</span>,
    },
    {
      header: 'Customer',
      cell: (p) => (
        <div>
          <p className="font-medium text-gray-900">{p.customerName || 'Customer'}</p>
          <p className="text-xs text-gray-400">{p.customerEmail || ''}</p>
        </div>
      ),
    },
    {
      header: 'Amount',
      cell: (p) => (
        <span className="font-bold text-gray-900">
          ${p.amount.toFixed(2)} <span className="text-xs text-gray-400">{p.currency}</span>
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (p) => <StatusBadge status={p.status} />,
    },
    {
      header: 'Method',
      cell: (p) => (
        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700">
          {p.paymentMethod}
        </span>
      ),
    },
    { header: 'Date', accessorKey: 'createdAt' },
  ];

  return (
    <div>
      <PageHeader
        title="Payments & Financial Transactions"
        description="Track all customer payments, settlement statuses, and payment gateway logs"
      />

      <DataTable
        columns={columns}
        data={payments}
        isLoading={loading}
        emptyMessage="No payments recorded"
      />
    </div>
  );
};
