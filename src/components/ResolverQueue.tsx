/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { CampusReport, Category, STATUS_COLORS, PRIORITY_COLORS, CATEGORY_COLORS } from '../types';
import { 
  Wrench, 
  Utensils, 
  ShieldAlert, 
  Wifi, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Flame,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ResolverQueueProps {
  reports: CampusReport[];
  onUpdateStatus: (reportId: string, nextStatus: CampusReport['status_state']) => void;
}

const DEPARTMENT_TABS: { category: Category; label: string; icon: any }[] = [
  { category: 'Infrastructure', label: 'Infrastructure (Gov)', icon: Wrench },
  { category: 'Canteen & Hygiene', label: 'Canteen & Hygiene', icon: Utensils },
  { category: 'Safety', label: 'Campus Safety', icon: ShieldAlert },
  { category: 'Connectivity', label: 'IT & Connectivity', icon: Wifi }
];

export default function ResolverQueue({ reports, onUpdateStatus }: ResolverQueueProps) {
  const [activeTab, setActiveTab] = useState<Category>('Infrastructure');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Filter accounts inside active queue
  const filteredReports = reports.filter(r => {
    const isCategory = r.category === activeTab;
    const matchesSearch = r.description.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          r.building_tag.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' ? true : r.status_state === statusFilter;
    
    return isCategory && matchesSearch && matchesStatus;
  });

  // Department report totals for badges
  const getTabCount = (cat: Category) => {
    return reports.filter(r => r.category === cat && r.status_state !== 'Resolved').length;
  };

  return (
    <div id="resolver-queue-card" className="glass-panel rounded-card p-6 sm:p-8 shadow-card border border-white/20 dark:border-white/10 relative overflow-hidden">
      
      {/* Dynamic faint background gradient ring */}
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>

      <div className="flex justify-between items-start flex-wrap gap-4 mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink-primary">🛠️ Campus Resolver Queues</h2>
        </div>
        
        {/* Simple search and status filters */}
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              placeholder="Search reports/locations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-white/20 dark:bg-slate-900/20 border border-white/40 dark:border-white/10 rounded-btn pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-primary-blue text-ink-primary backdrop-blur-sm"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-secondary" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/20 dark:bg-slate-900/20 border border-white/40 dark:border-white/10 rounded-btn px-3 py-2 text-xs text-ink-primary focus:outline-none focus:border-primary-blue cursor-pointer backdrop-blur-sm font-semibold"
          >
            <option value="ALL" className="bg-surface-card text-ink-primary">All States</option>
            <option value="Pending" className="bg-surface-card text-ink-primary">Pending</option>
            <option value="In Progress" className="bg-surface-card text-ink-primary">In Progress</option>
            <option value="Resolved" className="bg-surface-card text-ink-primary">Resolved</option>
          </select>
        </div>
      </div>

      {/* Role-Specific Queue Navigation Tabs with Horizontal Navigation Arrows */}
      <div className="relative flex items-center mb-5 select-none w-full">
        {/* Left Scroll Button */}
        <button
          type="button"
          onClick={() => scrollTabs('left')}
          className="p-1.5 rounded-full border border-white/20 bg-white/30 dark:bg-slate-900/40 text-ink-primary hover:bg-white/60 dark:hover:bg-slate-900/70 transition cursor-pointer mr-2 flex-shrink-0 shadow-sm"
          title="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={tabsContainerRef}
          className="flex-1 flex overflow-x-auto gap-2 border-b border-white/10 pt-1 pb-2.5 select-none scroll-smooth focus:outline-none scrollbar-thin"
        >
          {DEPARTMENT_TABS.map((tab) => {
            const Icon = tab.icon;
            const pendingCount = getTabCount(tab.category);
            const isActive = activeTab === tab.category;

            return (
              <button
                key={tab.category}
                id={`tab-resolver-${tab.category.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setActiveTab(tab.category)}
                className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border ${
                  isActive
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md transform scale-[1.02]'
                    : 'text-text-secondary bg-white/10 hover:bg-white/30 dark:bg-slate-900/10 dark:hover:bg-slate-900/20 border-white/20 dark:border-white/5 hover:text-ink-primary'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
                {pendingCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all duration-300 ${
                    isActive ? 'bg-white text-purple-600' : 'bg-critical-red text-white'
                  }`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          type="button"
          onClick={() => scrollTabs('right')}
          className="p-1.5 rounded-full border border-white/20 bg-white/30 dark:bg-slate-900/40 text-ink-primary hover:bg-white/60 dark:hover:bg-slate-900/70 transition cursor-pointer ml-2 flex-shrink-0 shadow-sm"
          title="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Report Cards Grid */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border-divider rounded-lg bg-primary-blue-tint/5 p-6">
          <p className="text-sm font-semibold text-text-secondary select-none">
            No active reports in this queue.
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Toggle filter menus or simulate reporting a new issue!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const priorityStyle = PRIORITY_COLORS[report.priority] || PRIORITY_COLORS.Medium;
            const statusStyle = STATUS_COLORS[report.status_state] || STATUS_COLORS.Pending;

            return (
              <div
                key={report.report_id}
                id={`report-card-resolver-${report.report_id}`}
                className="bg-white/20 dark:bg-slate-900/20 border border-white/30 dark:border-white/10 rounded-card p-4 shadow-sm hover:shadow-md hover:border-white/50 dark:hover:border-white/20 transition-all flex flex-col justify-between backdrop-blur-sm"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] font-mono font-semibold bg-primary-blue-tint/20 text-text-secondary px-1.5 py-0.5 rounded">
                      ID: {report.report_id}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      {/* Active Agentic Clustering Alert Banner */}
                      {report.cluster_flag && (
                        <div id={`cluster-tag-${report.report_id}`} className="bg-purple-100 text-[#6B21A8] border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-badge flex items-center gap-1.5 animate-pulse select-none">
                          <Flame className="w-3 h-3 text-purple-600 animate-bounce" />
                          Escalated by AI
                        </div>
                      )}

                      {/* Priority Tag */}
                      <span
                        style={{
                          backgroundColor: priorityStyle.bg,
                          color: priorityStyle.text,
                        }}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-badge flex items-center gap-1 select-none"
                      >
                        <span
                          style={{ backgroundColor: priorityStyle.dot }}
                          className="h-1.5 w-1.5 rounded-full"
                        ></span>
                        {report.priority} Urgent
                      </span>
                    </div>
                  </div>

                  {/* Evidence Photo */}
                  <div className="flex gap-3 mb-3 items-start">
                    <div className="relative h-16 w-16 bg-primary-blue-tint/10 rounded-md overflow-hidden flex-shrink-0 border border-border-divider">
                      <img
                        src={report.image_payload}
                        alt="Evidence Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-ink-primary leading-tight">
                        🏢 {report.building_tag}
                      </h4>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Logged {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-ink-primary mt-1 line-clamp-3 leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* State controls inside dashboard */}
                <div className="mt-2 pt-3 border-t border-border-divider flex items-center justify-between gap-2 flex-wrap">
                  {/* Current Status Badge */}
                  <div className="text-xs flex items-center gap-1.5">
                    <span className="text-text-secondary uppercase text-[10px] tracking-wider select-none">Status:</span>
                    <span
                      style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                      }}
                      className="px-2 py-0.5 rounded-badge font-bold text-[11px]"
                    >
                      {report.status_state}
                    </span>
                  </div>

                  {/* Actions to shift states */}
                  <div className="flex gap-1.5">
                    {report.status_state === 'Pending' && (
                      <button
                        id={`btn-progress-${report.report_id}`}
                        onClick={() => onUpdateStatus(report.report_id, 'In Progress')}
                        className="bg-warning-tint text-warning-amber border border-warning-amber/30 text-[11px] font-semibold px-3 py-1.5 rounded-btn hover:bg-warning-amber hover:text-white transition cursor-pointer"
                      >
                        ⚡ Start Repair
                      </button>
                    )}
                    {report.status_state !== 'Resolved' && (
                      <button
                        id={`btn-resolve-${report.report_id}`}
                        onClick={() => onUpdateStatus(report.report_id, 'Resolved')}
                        className="bg-success-tint text-success-green border border-success-green/30 text-[11px] font-semibold px-3 py-1.5 rounded-btn hover:bg-success-green hover:text-white transition cursor-pointer animate-pulse-slow"
                      >
                        ✓ Mark Resolved
                      </button>
                    )}
                    {report.status_state === 'Resolved' && (
                      <span className="text-[11px] text-[#2E9E5B] font-bold flex items-center gap-1 py-1 px-2 select-none">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Fixed End-to-End
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
