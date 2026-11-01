import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import OpportunityCard from '../../components/OpportunityCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Building2, Globe, ExternalLink, ArrowLeft } from 'lucide-react';

export default function CompanyDetailPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompanyData() {
      try {
        setLoading(true);
        // Load company list and find matching id
        const compRes = await api.getCompanies();
        if (compRes.success) {
          const found = compRes.data.find(c => c.id === parseInt(id, 10));
          setCompany(found || null);
        }
        // Load opportunities for this company
        const oppRes = await api.getOpportunities({ limit: 50 });
        if (oppRes.success) {
          const compDrives = oppRes.data.filter(d => d.company_id === parseInt(id, 10));
          setDrives(compDrives);
        }
      } catch (err) {
        console.error('Failed to load company details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCompanyData();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading company directory..." />;
  if (!company) return <div className="p-8 text-center text-slate-500">Company not found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          to="/opportunities"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to opportunities
        </Link>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{company.name}</h1>
              {company.is_demo_data && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  DEMO DATA RECORD
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{company.industry}</p>
          </div>

          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <span>Visit Website</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          )}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          {company.description || 'Enterprise recruiting partner.'}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Active Roles from {company.name} ({drives.length})</h2>
        {drives.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {drives.map(opp => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No currently published drives for this company.</p>
        )}
      </div>
    </div>
  );
}
