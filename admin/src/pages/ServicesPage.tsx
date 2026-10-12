import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { Service, ServiceCategory } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';

const mockCategories: ServiceCategory[] = [
  { id: 'cat-1', name: 'Diagnostics & Electrical', slug: 'diagnostics', isActive: true },
  { id: 'cat-2', name: 'Brake & Chassis', slug: 'brakes', isActive: true },
  { id: 'cat-3', name: 'Periodic Maintenance', slug: 'maintenance', isActive: true },
  { id: 'cat-4', name: 'AC & Climate Control', slug: 'ac-heating', isActive: true },
];

const mockServices: Service[] = [
  {
    id: 's-1',
    name: 'Complete Computer Diagnostics',
    categoryId: 'cat-1',
    category: mockCategories[0],
    price: 120,
    durationMinutes: 45,
    status: 'ACTIVE',
    description: 'Full OBD-II scan and multi-system ECU health check.',
  },
  {
    id: 's-2',
    name: 'Front & Rear Brake Pad Replacement',
    categoryId: 'cat-2',
    category: mockCategories[1],
    price: 180,
    durationMinutes: 90,
    status: 'ACTIVE',
    description: 'Ceramic brake pad installation with rotor resurfacing check.',
  },
  {
    id: 's-3',
    name: 'Full Synthetic Oil Service',
    categoryId: 'cat-3',
    category: mockCategories[2],
    price: 75,
    durationMinutes: 30,
    status: 'ACTIVE',
    description: '5W-30 synthetic oil change with OEM filter replacement.',
  },
  {
    id: 's-4',
    name: 'R134a AC Recharge & Leak Check',
    categoryId: 'cat-4',
    category: mockCategories[3],
    price: 110,
    durationMinutes: 60,
    status: 'ACTIVE',
    description: 'Air conditioning refrigerant recovery and precision refill.',
  },
  {
    id: 's-5',
    name: 'Transmission Flush & Fluid Replacement',
    categoryId: 'cat-2',
    category: mockCategories[1],
    price: 260,
    durationMinutes: 120,
    status: 'INACTIVE',
    description: 'Complete ATF fluid replacement for automatic gearboxes.',
  },
];

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [, setCategories] = useState<ServiceCategory[]>(mockCategories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServicesAndCategories = async () => {
      try {
        setLoading(true);
        const [servRes, catRes] = await Promise.allSettled([
          api.get('/services'),
          api.get('/services/categories'),
        ]);

        if (servRes.status === 'fulfilled' && servRes.value.data?.data) {
          setServices(servRes.value.data.data);
        }
        if (catRes.status === 'fulfilled' && catRes.value.data?.data) {
          setCategories(catRes.value.data.data);
        }
      } catch {
        // Fallback to initial mock
      } finally {
        setLoading(false);
      }
    };

    fetchServicesAndCategories();
  }, []);

  const columns: Column<Service>[] = [
    {
      header: 'Service Name',
      cell: (s) => (
        <div>
          <p className="font-semibold text-gray-900">{s.name}</p>
          {s.description && (
            <p className="text-xs text-gray-500 max-w-sm truncate">{s.description}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (s) => (
        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700">
          {s.category?.name || 'General'}
        </span>
      ),
    },
    {
      header: 'Base Price',
      cell: (s) => <span className="font-bold text-gray-900">${s.price}</span>,
    },
    {
      header: 'Duration',
      cell: (s) => <span className="text-gray-600">{s.durationMinutes} mins</span>,
    },
    {
      header: 'Status',
      cell: (s) => <StatusBadge status={s.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Services Catalog"
        description="Configure available garage services, pricing tiers, and estimated repair times"
      />

      <DataTable
        columns={columns}
        data={services}
        isLoading={loading}
        emptyMessage="No services configured"
      />
    </div>
  );
};
