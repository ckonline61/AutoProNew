import React, { useState, useEffect } from 'react';
import { UserCheck, UserX } from 'lucide-react';
import api from '../config/api';
import { User } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';

const mockUsers: User[] = [
  {
    id: 'u-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 555-0101',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2026-02-10',
  },
  {
    id: 'u-2',
    name: 'Bob Miller',
    email: 'bob@example.com',
    phone: '+1 555-0102',
    role: 'USER',
    status: 'INACTIVE',
    createdAt: '2026-04-14',
  },
  {
    id: 'u-3',
    name: 'Carlos Ramos',
    email: 'carlos@mechanics.com',
    phone: '+1 555-4422',
    role: 'MECHANIC',
    status: 'ACTIVE',
    createdAt: '2026-03-22',
  },
  {
    id: 'u-4',
    name: 'Diana Prince',
    email: 'diana@corp.com',
    phone: '+1 555-0104',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-01-01',
  },
  {
    id: 'u-5',
    name: 'Edward Stone',
    email: 'edward@example.com',
    phone: '+1 555-0105',
    role: 'USER',
    status: 'SUSPENDED',
    createdAt: '2026-06-30',
  },
];

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/users');
        if (res.data?.data && Array.isArray(res.data.data)) {
          setUsers(res.data.data);
        }
      } catch {
        // Fallback to mock
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleUserStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      setActionLoading(user.id);
      await api.put(`/admin/users/${user.id}/status`, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
    } finally {
      setActionLoading(null);
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Name',
      cell: (u) => <span className="font-semibold text-gray-900">{u.name}</span>,
    },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Phone',
      cell: (u) => <span>{u.phone || '—'}</span>,
    },
    {
      header: 'Role',
      cell: (u) => (
        <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-800">
          {u.role}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (u) => <StatusBadge status={u.status} />,
    },
    { header: 'Joined Date', accessorKey: 'createdAt' },
    {
      header: 'Actions',
      cell: (u) => (
        <button
          disabled={actionLoading === u.id}
          onClick={() => toggleUserStatus(u)}
          className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            u.status === 'ACTIVE'
              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
          }`}
        >
          {u.status === 'ACTIVE' ? (
            <>
              <UserX className="w-3.5 h-3.5 mr-1" />
              Deactivate
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5 mr-1" />
              Activate
            </>
          )}
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users Management"
        description="Search customer and staff accounts, monitor account status, and manage permissions"
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={loading}
        emptyMessage="No users found"
      />
    </div>
  );
};
