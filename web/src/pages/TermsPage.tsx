import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { CmsPage } from '../types';
import { FileText, Clock } from 'lucide-react';

const defaultTerms = `
## 1. Acceptance of Terms
By accessing or using the Auto Pro platform, booking doorstep auto services, ordering automotive parts, or viewing vehicle listings, you agree to be bound by these Terms of Service.

## 2. Doorstep Service Appointments
- Customers are responsible for providing safe, legal, and adequately lit parking space for mobile technicians to carry out servicing.
- Any additional repairs identified during the mandatory preliminary checkup will require explicit customer approval through a digital estimate before work commences.

## 3. Workmanship Warranty
- Auto Pro provides a 30-day or 1,000 km warranty (whichever comes first) on labor and workmanship for periodic maintenance services.
- Spare parts carry original manufacturer warranties which are passed directly to the customer. Warranty does not cover normal wear-and-tear items or external accident impacts.

## 4. Cancellation & Rescheduling
- Doorstep bookings can be rescheduled or cancelled free of charge up to 2 hours before the scheduled time slot.
- Late cancellations once a mechanic has already departed may incur a nominal conveyance fee.

## 5. Limitation of Liability
Auto Pro technicians exercise utmost professional care. Any pre-existing vehicle flaws documented in the initial digital inspection report remain the customer's responsibility.
`;

const TermsPage: React.FC = () => {
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTerms = async () => {
      try {
        const res = await api.get('/cms/terms');
        if (isMounted && res.data) {
          const data = res.data.data || res.data;
          setPage(data);
        }
      } catch {
        // use fallback terms
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTerms();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                {page?.title || 'Terms of Service'}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Last Updated: October 2026</span>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-xs text-blue-600 mb-4 animate-pulse">Syncing terms of service with latest terms...</div>
          )}
          <div className="prose prose-blue max-w-none text-gray-700 text-sm leading-relaxed space-y-4">
            {page?.content ? (
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            ) : (
              <div>
                <p className="mb-4">
                  These Terms of Service govern your relationship with Auto Pro Technologies Private Limited and define the rules and conditions for using our website, applications, and on-demand vehicle services.
                </p>
                {defaultTerms
                  .trim()
                  .split('## ')
                  .filter(Boolean)
                  .map((section, idx) => {
                    const [heading, ...body] = section.split('\n');
                    return (
                      <div key={idx} className="pt-4 border-t border-gray-100 first:border-t-0">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">{heading}</h2>
                        <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                          {body.join('\n').trim()}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
