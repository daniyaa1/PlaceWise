import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import OpportunityCard from '../../components/OpportunityCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  X
} from 'lucide-react';

export default function OpportunityDiscoveryPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('ALL');
  const [domain, setDomain] = useState('ALL');
  const [preferenceGroup, setPreferenceGroup] = useState('ALL');
  const [workMode, setWorkMode] = useState('ALL');
  const [sort, setSort] = useState('recent');

  // Track Application Modal
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [trackStatus, setTrackStatus] = useState('APPLIED');
  const [trackNotes, setTrackNotes] = useState('');
  const [trackSubmitting, setTrackSubmitting] = useState(false);
  const [trackMessage, setTrackMessage] = useState(null);

  const fetchOpportunities = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.getOpportunities({
        search,
        source,
        domain,
        preferenceGroup,
        workMode,
        sort,
        page,
        limit: 12
      });

      if (res.success) {
        setOpportunities(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities(1);
  }, [source, domain, preferenceGroup, workMode, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOpportunities(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSource('ALL');
    setDomain('ALL');
    setPreferenceGroup('ALL');
    setWorkMode('ALL');
    setSort('recent');
  };

  const handleQuickApply = (drive) => {
    setSelectedDrive(drive);
    setTrackStatus('APPLIED');
    setTrackNotes('');
    setTrackMessage(null);
    setTrackModalOpen(true);
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDrive) return;
    setTrackSubmitting(true);
    setTrackMessage(null);

    try {
      await api.createApplication({
        driveId: selectedDrive.id,
        status: trackStatus,
        notes: trackNotes
      });
      setTrackMessage({ type: 'success', text: 'Application recorded in your tracker!' });
      setTimeout(() => {
        setTrackModalOpen(false);
      }, 1200);
    } catch (err) {
      setTrackMessage({ type: 'error', text: err.message || 'Failed to record application.' });
    } finally {
      setTrackSubmitting(false);
    }
  };

  const careerDomains = [
    'Software Development',
    'Full Stack Development',
    'AI and Machine Learning',
    'Cloud Engineering',
    'Embedded Systems',
    'Data Analyst',
    'Management Trainee',
    'Operations'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Opportunity Discovery</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Explore campus recruitment drives and verified off-campus career openings.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-5 rounded-3xl dark:border-white/10 shadow-xl space-y-4">
        {/* Search Input Row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies, role titles, keywords, locations..."
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all shadow-md shadow-cyan-500/25 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter Selects Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
            >
              <option value="ALL" className="dark:bg-slate-900">All Sources</option>
              <option value="CAMPUS" className="dark:bg-slate-900">Campus Drives Only</option>
              <option value="EXTERNAL" className="dark:bg-slate-900">External Listings</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Career Domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
            >
              <option value="ALL" className="dark:bg-slate-900">All Career Domains</option>
              {careerDomains.map(d => (
                <option key={d} value={d} className="dark:bg-slate-900">{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Preference Group</label>
            <select
              value={preferenceGroup}
              onChange={(e) => setPreferenceGroup(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
            >
              <option value="ALL" className="dark:bg-slate-900">All Groups</option>
              <option value="TECHNICAL" className="dark:bg-slate-900">Technical Roles</option>
              <option value="NON_TECHNICAL" className="dark:bg-slate-900">Non-Technical Roles</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
            >
              <option value="ALL" className="dark:bg-slate-900">All Modes</option>
              <option value="IN_OFFICE" className="dark:bg-slate-900">In-Office</option>
              <option value="HYBRID" className="dark:bg-slate-900">Hybrid</option>
              <option value="REMOTE" className="dark:bg-slate-900">Remote</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
            >
              <option value="recent" className="dark:bg-slate-900">Recently Posted</option>
              <option value="deadline_asc" className="dark:bg-slate-900">Deadline (Earliest)</option>
              <option value="comp_desc" className="dark:bg-slate-900">Compensation (High)</option>
            </select>
          </div>
        </div>

        {/* Clear filters pill */}
        {(source !== 'ALL' || domain !== 'ALL' || preferenceGroup !== 'ALL' || workMode !== 'ALL' || search) && (
          <div className="flex items-center space-x-2 pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Filtered view active</span>
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-cyan-500 hover:text-cyan-400 flex items-center space-x-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <LoadingSpinner text="Searching and filtering opportunities..." />
      ) : opportunities.length === 0 ? (
        <EmptyState
          title="No opportunities found"
          description="Try broadening your search query or removing some active filters."
          actionLabel="Clear All Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {opportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onQuickApply={handleQuickApply}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-5">
              <span className="text-xs text-slate-500">
                Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} opportunities)
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchOpportunities(pagination.page - 1)}
                  className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 text-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchOpportunities(pagination.page + 1)}
                  className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 text-slate-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Track Application Modal */}
      <Modal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        title={selectedDrive ? `Track Application: ${selectedDrive.company_name}` : 'Track Application'}
      >
        {selectedDrive && (
          <form onSubmit={handleTrackSubmit} className="space-y-4">
            {trackMessage && (
              <div className={`p-3 rounded-lg text-xs ${trackMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                {trackMessage.text}
              </div>
            )}

            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Role: <span className="font-bold text-slate-900 dark:text-white">{selectedDrive.title}</span></p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Source: {selectedDrive.source_type === 'CAMPUS' ? 'On-Campus Drive' : 'External Listing'}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Application Stage</label>
              <select
                value={trackStatus}
                onChange={(e) => setTrackStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white"
              >
                <option value="INTERESTED" className="dark:bg-slate-900">Bookmarked / Interested</option>
                <option value="APPLIED" className="dark:bg-slate-900">Submitted Application</option>
                <option value="ASSESSMENT" className="dark:bg-slate-900">Online Assessment Scheduled</option>
                <option value="INTERVIEW" className="dark:bg-slate-900">Interview Round</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Personal Notes (Optional)</label>
              <textarea
                value={trackNotes}
                onChange={(e) => setTrackNotes(e.target.value)}
                placeholder="e.g. Applied via official portal, referral link."
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200/60 dark:border-white/10">
              <button
                type="button"
                onClick={() => setTrackModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={trackSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white disabled:opacity-60 shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                {trackSubmitting ? 'Saving...' : 'Confirm Tracking'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

