import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../config/api';
import { FeatureFlag } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';

const initialFlags: FeatureFlag[] = [
  {
    key: 'ENABLE_REALTIME_TRACKING',
    description: 'Enables live GPS mechanic tracking on customer booking map',
    isEnabled: true,
    environment: 'production',
    updatedAt: '2026-10-10',
    updatedBy: 'Admin',
  },
  {
    key: 'NEW_PAYMENT_GATEWAY_RAZORPAY',
    description: 'Enables Razorpay as checkout option alongside Stripe',
    isEnabled: true,
    environment: 'production',
    updatedAt: '2026-10-08',
    updatedBy: 'Admin',
  },
  {
    key: 'INSTANT_EMERGENCY_DISPATCH',
    description: 'Automatic high-priority dispatch algorithm for breakdown SOS',
    isEnabled: false,
    environment: 'production',
    updatedAt: '2026-10-05',
    updatedBy: 'DevOps',
  },
  {
    key: 'USED_CARS_MARKETPLACE_V2',
    description: 'Upgraded 360-degree inspection report card on car listings',
    isEnabled: false,
    environment: 'staging',
    updatedAt: '2026-10-01',
    updatedBy: 'DevOps',
  },
];

export const FeatureFlagsPage: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        setLoading(true);
        const res = await api.get('/feature-flags');
        if (res.data?.data && Array.isArray(res.data.data)) {
          setFlags(res.data.data);
        }
      } catch {
        // Fallback to initial mock
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, []);

  const handleToggle = async (key: string) => {
    try {
      await api.put(`/feature-flags/${key}/toggle`);
      setFlags((prev) =>
        prev.map((f) =>
          f.key === key ? { ...f, isEnabled: !f.isEnabled, updatedAt: new Date().toISOString().split('T')[0] } : f
        )
      );
    } catch {
      // Optimistic update
      setFlags((prev) =>
        prev.map((f) =>
          f.key === key ? { ...f, isEnabled: !f.isEnabled, updatedAt: new Date().toISOString().split('T')[0] } : f
        )
      );
    }
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    try {
      setSubmitting(true);
      const newFlag: FeatureFlag = {
        key: newKey.trim().toUpperCase().replace(/\s+/g, '_'),
        description: newDesc.trim(),
        isEnabled: false,
        environment: 'production',
        updatedAt: new Date().toISOString().split('T')[0],
        updatedBy: 'Admin',
      };

      await api.post('/feature-flags', newFlag).catch(() => {});
      setFlags((prev) => [newFlag, ...prev]);
      setIsModalOpen(false);
      setNewKey('');
      setNewDesc('');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<FeatureFlag>[] = [
    {
      header: 'Flag Key',
      cell: (f) => (
        <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
          {f.key}
        </span>
      ),
    },
    {
      header: 'Description',
      cell: (f) => <span className="text-gray-700 text-sm">{f.description}</span>,
    },
    {
      header: 'Enabled Status',
      cell: (f) => (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={f.isEnabled}
            onChange={() => handleToggle(f.key)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-xs font-medium text-gray-600">
            {f.isEnabled ? 'ON' : 'OFF'}
          </span>
        </label>
      ),
    },
    { header: 'Updated Date', accessorKey: 'updatedAt' },
  ];

  return (
    <div>
      <PageHeader
        title="Feature Flags"
        description="Dynamically enable, kill-switch, or test platform features without code deployments"
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-xs text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Feature Flag
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={flags}
        isLoading={loading}
        emptyMessage="No feature flags configured"
      />

      {/* Create Flag Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Feature Flag"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFlag}
              disabled={submitting || !newKey.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Save Flag'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateFlag} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
              Flag Key Identifier
            </label>
            <input
              type="text"
              required
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="FEATURE_NAME_IN_CAPS"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
              Description / Business Rationale
            </label>
            <textarea
              rows={3}
              required
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Explain purpose of flag and rollback procedures..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
