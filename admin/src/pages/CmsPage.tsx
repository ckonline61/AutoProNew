import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import api from '../config/api';
import { CmsPage as CmsPageType } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';

const mockPages: CmsPageType[] = [
  {
    id: 'cms-1',
    title: 'Terms of Service',
    slug: '/terms',
    category: 'LEGAL',
    isPublished: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-08-15',
  },
  {
    id: 'cms-2',
    title: 'Privacy Policy',
    slug: '/privacy',
    category: 'LEGAL',
    isPublished: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-08-15',
  },
  {
    id: 'cms-3',
    title: 'Mechanic Guarantee & Warranty Guidelines',
    slug: '/mechanic-guarantee',
    category: 'SUPPORT',
    isPublished: true,
    createdAt: '2026-03-10',
    updatedAt: '2026-09-02',
  },
  {
    id: 'cms-4',
    title: 'Winter Vehicle Preparedness Guide 2026',
    slug: '/blog/winter-car-care-2026',
    category: 'BLOG',
    isPublished: false,
    createdAt: '2026-10-05',
    updatedAt: '2026-10-05',
  },
];

export const CmsPage: React.FC = () => {
  const [pages, setPages] = useState<CmsPageType[]>(mockPages);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/cms/pages');
        if (res.data?.data && Array.isArray(res.data.data)) {
          setPages(res.data.data);
        }
      } catch {
        // Fallback to mock
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  const togglePublish = async (page: CmsPageType) => {
    const nextState = !page.isPublished;
    try {
      setActionLoading(page.id);
      await api.put(`/admin/cms/pages/${page.id}/publish`, { isPublished: nextState });
      setPages((prev) =>
        prev.map((p) => (p.id === page.id ? { ...p, isPublished: nextState } : p))
      );
    } catch {
      setPages((prev) =>
        prev.map((p) => (p.id === page.id ? { ...p, isPublished: nextState } : p))
      );
    } finally {
      setActionLoading(null);
    }
  };

  const columns: Column<CmsPageType>[] = [
    {
      header: 'Title',
      cell: (p) => <span className="font-semibold text-gray-900">{p.title}</span>,
    },
    {
      header: 'Slug / URL',
      cell: (p) => <span className="font-mono text-xs text-blue-600">{p.slug}</span>,
    },
    {
      header: 'Category',
      cell: (p) => (
        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-800">
          {p.category}
        </span>
      ),
    },
    {
      header: 'Published',
      cell: (p) => (
        <StatusBadge status={p.isPublished ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    { header: 'Last Updated', accessorKey: 'updatedAt' },
    {
      header: 'Actions',
      cell: (p) => (
        <button
          disabled={actionLoading === p.id}
          onClick={() => togglePublish(p)}
          className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            p.isPublished
              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
          }`}
        >
          {p.isPublished ? (
            <>
              <EyeOff className="w-3.5 h-3.5 mr-1" />
              Unpublish
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 mr-1" />
              Publish
            </>
          )}
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="CMS & Content Management"
        description="Manage legal agreements, help center articles, guidelines, and marketing editorial pages"
      />

      <DataTable
        columns={columns}
        data={pages}
        isLoading={loading}
        emptyMessage="No content pages found"
      />
    </div>
  );
};
