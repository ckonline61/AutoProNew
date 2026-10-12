import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { CmsPage } from '../types';
import { Shield, Clock } from 'lucide-react';

const defaultContent = `
## 1. Information We Collect
Auto Pro collects personal details (such as your name, mobile number, email, and vehicle registration number), location coordinates for doorstep service dispatch, and vehicle diagnostic history.

## 2. How We Use Your Information
- To dispatch certified mechanics and supply genuine automotive spare parts directly to your preferred address.
- To communicate real-time job status updates, quotes, and digital inspection certificates.
- To improve diagnostic algorithms and technician safety protocols across our network.

## 3. Data Protection & Security
We employ industry-standard encryption protocols (TLS/HTTPS) across all network exchanges. Your financial and payment details are processed through PCI-DSS Level 1 compliant payment gateways. Auto Pro never sells personal information to third-party data brokers.

## 4. Vehicle Diagnostic & Telemetry Data
Diagnostic health readouts generated during mechanic appointments are stored securely within your digital service passport to enable preventative maintenance alerts and facilitate future vehicle resale value.

## 5. Contacting the Data Privacy Officer
For inquiries regarding your data or to exercise your right of erasure, reach out to privacy@autopro.in.
`;

const PrivacyPolicyPage: React.FC = () => {
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPage = async () => {
      try {
        const res = await api.get('/cms/privacy-policy');
        if (isMounted && res.data) {
          const data = res.data.data || res.data;
          setPage(data);
        }
      } catch {
        // use fallback below
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPage();
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
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                {page?.title || 'Privacy Policy'}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Last Updated: October 2026</span>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-xs text-blue-600 mb-4 animate-pulse">Syncing policy with latest legal disclosures...</div>
          )}
          <div className="prose prose-blue max-w-none text-gray-700 text-sm leading-relaxed space-y-4">
            {page?.content ? (
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            ) : (
              <div>
                <p className="mb-4">
                  Welcome to Auto Pro. This Privacy Policy describes how Auto Pro Technologies Private Limited collects, uses, and safeguards information when you visit our website or use our mobile applications.
                </p>
                {defaultContent
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

export default PrivacyPolicyPage;
