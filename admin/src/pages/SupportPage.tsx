import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { SupportTicket } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

const mockTickets: SupportTicket[] = [
  {
    id: 't-101',
    ticketNumber: 'TKT-1001',
    userId: 'u-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    subject: 'Mechanic did not arrive at scheduled window',
    category: 'BOOKING',
    priority: 'HIGH',
    status: 'OPEN',
    createdAt: '2026-10-12 09:30',
    updatedAt: '2026-10-12 09:30',
    messages: [
      {
        id: 'msg-1',
        senderId: 'u-1',
        senderName: 'John Doe',
        senderRole: 'USER',
        message: 'I have been waiting for 45 minutes and the mechanic has not arrived.',
        createdAt: '2026-10-12 09:30',
      },
    ],
  },
  {
    id: 't-102',
    ticketNumber: 'TKT-1002',
    userId: 'u-2',
    userName: 'Sarah Jenkins',
    userEmail: 'sarah@example.com',
    subject: 'Charged twice on Stripe card payment',
    category: 'PAYMENT',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-11 14:10',
    updatedAt: '2026-10-11 15:00',
    messages: [
      {
        id: 'msg-2',
        senderId: 'u-2',
        senderName: 'Sarah Jenkins',
        senderRole: 'USER',
        message: 'My credit card statement shows two identical charges of $220.',
        createdAt: '2026-10-11 14:10',
      },
      {
        id: 'msg-3',
        senderId: 'admin-1',
        senderName: 'Auto Pro Support',
        senderRole: 'SUPPORT',
        message: 'We are investigating the payment processor logs and will issue a refund if duplicated.',
        createdAt: '2026-10-11 15:00',
      },
    ],
  },
  {
    id: 't-103',
    ticketNumber: 'TKT-1003',
    userId: 'u-3',
    userName: 'David Kim',
    userEmail: 'david@example.com',
    subject: 'Inquiry on spare part warranty coverage',
    category: 'TECHNICAL',
    priority: 'LOW',
    status: 'CLOSED',
    createdAt: '2026-10-09 11:00',
    updatedAt: '2026-10-10 10:00',
    messages: [
      {
        id: 'msg-4',
        senderId: 'u-3',
        senderName: 'David Kim',
        senderRole: 'USER',
        message: 'Does the OEM brake rotor include a 12-month manufacturer warranty?',
        createdAt: '2026-10-09 11:00',
      },
      {
        id: 'msg-5',
        senderId: 'admin-1',
        senderName: 'Support Agent',
        senderRole: 'SUPPORT',
        message: 'Yes, all OEM parts sourced via Auto Pro include 12-month or 15,000 km replacement coverage.',
        createdAt: '2026-10-10 10:00',
      },
    ],
  },
];

export const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/support');
        if (res.data?.data && Array.isArray(res.data.data)) {
          setTickets(res.data.data);
        }
      } catch {
        // Fallback to mock
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const columns: Column<SupportTicket>[] = [
    {
      header: 'Ticket #',
      cell: (t) => <span className="font-semibold text-blue-600">{t.ticketNumber}</span>,
    },
    {
      header: 'Subject & Requester',
      cell: (t) => (
        <div>
          <p className="font-medium text-gray-900">{t.subject}</p>
          <p className="text-xs text-gray-400">By {t.userName || 'User'} ({t.userEmail || ''})</p>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (t) => (
        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-700">
          {t.category}
        </span>
      ),
    },
    {
      header: 'Priority',
      cell: (t) => <StatusBadge status={t.priority} />,
    },
    {
      header: 'Status',
      cell: (t) => <StatusBadge status={t.status} />,
    },
    { header: 'Date', accessorKey: 'createdAt' },
  ];

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        description="Customer inquiries, dispute resolutions, and mechanic dispatch issue escalation"
      />

      <DataTable
        columns={columns}
        data={tickets}
        isLoading={loading}
        onRowClick={(ticket) => setSelectedTicket(ticket)}
        emptyMessage="No open support tickets"
      />

      {/* Ticket Conversation View Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket ? `${selectedTicket.ticketNumber}: ${selectedTicket.subject}` : ''}
        footer={
          <button
            onClick={() => setSelectedTicket(null)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        }
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs text-gray-500">
              <div>
                Requester: <span className="font-medium text-gray-900">{selectedTicket.userName}</span>
              </div>
              <div className="flex space-x-2">
                <StatusBadge status={selectedTicket.priority} />
                <StatusBadge status={selectedTicket.status} />
              </div>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                selectedTicket.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-lg text-sm ${
                      m.senderRole === 'USER'
                        ? 'bg-blue-50 border border-blue-100 ml-4'
                        : 'bg-gray-50 border border-gray-200 mr-4'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                      <span className="font-semibold text-gray-700">{m.senderName}</span>
                      <span>{m.createdAt}</span>
                    </div>
                    <p className="text-gray-800">{m.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No messages in ticket history</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
