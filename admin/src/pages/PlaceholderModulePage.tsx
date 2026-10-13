import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { LucideIcon, Wrench } from 'lucide-react';

interface PlaceholderModulePageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export const PlaceholderModulePage: React.FC<PlaceholderModulePageProps> = ({
  title,
  description,
  icon: Icon = Wrench,
}) => {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title} — Under Development</h3>
        <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
          {description}. The interface for this module is not connected yet.
        </p>
      </div>
    </div>
  );
};
