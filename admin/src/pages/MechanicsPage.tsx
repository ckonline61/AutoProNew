import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, XCircle } from 'lucide-react';
import api from '../config/api';
import { Mechanic } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';

const initialMechanics: Mechanic[] = [
  {
    id: 'm-1',
    name: 'Alex Rivera',
    phone: '+1 555-8833',
    email: 'alex@mechanics.com',
    status: 'VERIFIED',
    specializations: ['Brakes', 'Suspension', 'Engine Diagnostic'],
    rating: 4.9,
    totalJobs: 142,
    createdAt: '2026-01-15',
  },
  {
    id: 'm-2',
    name: 'Carlos Ramos',
    phone: '+1 555-4422',
    email: 'carlos@mechanics.com',
    status: 'VERIFIED',
    specializations: ['Transmission', 'Clutch', 'Electrical'],
    rating: 4.7,
    totalJobs: 89,
    createdAt: '2026-03-22',
  },
  {
    id: 'm-3',
    name: 'Dmitri Petrov',
    phone: '+1 555-7711',
    email: 'dmitri@petrovgarage.com',
    status: 'PENDING',
    specializations: ['European Cars', 'Diagnostics', 'Tuning'],
    rating: 0,
    totalJobs: 0,
    createdAt: '2026-10-09',
  },
  {
    id: 'm-4',
    name: 'Marcus Bell',
    phone: '+1 555-3399',
    email: 'marcus@bellauto.com',
    status: 'PENDING',
    specializations: ['AC Services', 'Cooling System'],
    rating: 0,
    totalJobs: 0,
    createdAt: '2026-10-11',
  },
  {
    id: 'm-5',
    name: 'Liam Vance',
    phone: '+1 555-6600',
    email: 'liam@vanceworks.com',
    status: 'REJECTED',
    specializations: ['Tires', 'Alignment'],
    rating: 3.2,
    totalJobs: 12,
    createdAt: '2026-05-19',
  },
];

export const MechanicsPage: React.FC = () => {
  const [mechanics, setMechanics] = useState<Mechanic[]>(initialMechanics);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/mechanics');
        if (res.data?.data && Array.isArray(res.data.data)) {
          setMechanics(res.data.data);
        }
      } catch {
        // Fallback to initialMechanics
      } finally {
        setLoading(false);
      }
    };

    fetchMechanics();
  }, []);

  const handleVerify = async (id: string, action: 'VERIFIED' | 'REJECTED') => {
    try {
      setActionLoading(id);
      await api.put(`/mechanics/${id}/verify`, { status: action });
      setMechanics((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: action } : m))
      );
    } catch {
      // Optimistic update for testing/demo
      setMechanics((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: action } : m))
      );
    } finally {
      setActionLoading(null);
    }
  };

  const columns: Column<Mechanic>[] = [
    {
      header: 'Mechanic Name',
      cell: (m) => (
        <div>
          <span className="font-semibold text-gray-900">{m.name}</span>
          {m.email && <span className="block text-xs text-gray-400">{m.email}</span>}
        </div>
      ),
    },
    { header: 'Phone', accessorKey: 'phone' },
    {
      header: 'Status',
      cell: (m) => <StatusBadge status={m.status} />,
    },
    {
      header: 'Specializations',
      cell: (m) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {m.specializations?.map((spec, i) => (
            <span
              key={i}
              className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-md"
            >
              {spec}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Rating',
      cell: (m) => (
        <div className="flex items-center text-sm font-medium text-amber-500">
          <Star className="w-4 h-4 fill-amber-400 mr-1" />
          <span>{m.rating > 0 ? m.rating.toFixed(1) : 'New'}</span>
        </div>
      ),
    },
    {
      header: 'Total Jobs',
      cell: (m) => <span className="text-gray-900 font-medium">{m.totalJobs}</span>,
    },
    {
      header: 'Actions',
      cell: (m) => (
        <div className="flex items-center space-x-2">
          {m.status === 'PENDING' ? (
            <>
              <button
                disabled={actionLoading === m.id}
                onClick={() => handleVerify(m.id, 'VERIFIED')}
                className="inline-flex items-center px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md text-xs font-medium transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Approve
              </button>
              <button
                disabled={actionLoading === m.id}
                onClick={() => handleVerify(m.id, 'REJECTED')}
                className="inline-flex items-center px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-md text-xs font-medium transition-colors"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Reject
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-400">Processed</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Mechanics Directory & Approvals"
        description="Verify service partners, review qualifications, and manage active service providers"
      />

      <DataTable
        columns={columns}
        data={mechanics}
        isLoading={loading}
        emptyMessage="No mechanics registered"
      />
    </div>
  );
};
