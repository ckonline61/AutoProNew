import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toUpperCase();

  let colorClasses = 'bg-gray-100 text-gray-800 border-gray-200';

  if (['ACTIVE', 'COMPLETED', 'VERIFIED', 'PASSED', 'APPROVED', 'HEALTHY', 'DELIVERED', 'IN_STOCK'].includes(normalized)) {
    colorClasses = 'bg-green-100 text-green-800 border-green-200';
  } else if (['PENDING', 'IN_PROGRESS', 'PROCESSING', 'LOW_STOCK', 'MEDIUM'].includes(normalized)) {
    colorClasses = 'bg-amber-100 text-amber-800 border-amber-200';
  } else if (['CONFIRMED', 'OPEN', 'SHIPPED'].includes(normalized)) {
    colorClasses = 'bg-blue-100 text-blue-800 border-blue-200';
  } else if (['FAILED', 'CANCELLED', 'REJECTED', 'SUSPENDED', 'DOWN', 'OUT_OF_STOCK', 'URGENT', 'HIGH'].includes(normalized)) {
    colorClasses = 'bg-red-100 text-red-800 border-red-200';
  } else if (['INACTIVE', 'CLOSED', 'RESOLVED'].includes(normalized)) {
    colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses} ${className}`}
    >
      {status}
    </span>
  );
};
