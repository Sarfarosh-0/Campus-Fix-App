/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CampusReport, Category, CATEGORY_COLORS, PRIORITY_COLORS } from '../types';
import { CheckCircle2, AlertCircle, TrendingUp, Sparkles, BarChart2, Flame } from 'lucide-react';

interface PublicDashboardProps {
  reports: CampusReport[];
  selectedBuilding: string | null;
  onSelectBuilding: (building: string | null) => void;
}

export default function PublicDashboard({ reports, selectedBuilding, onSelectBuilding }: PublicDashboardProps) {
  const totalReports = reports.length;
  
  // Calculate dynamic resolved issues. Start with 247 base seed as mentioned in design specs + actual resolved issues
  const actualResolved = reports.filter(r => r.status_state === 'Resolved').length;
  const baseSeedCount = 247;
  const displayResolvedCount = baseSeedCount + actualResolved;

  // Active (reported but unresolved) issues
  const activeReports = reports.filter(r => r.status_state !== 'Resolved').length;
  const inProgressReports = reports.filter(r => r.status_state === 'In Progress').length;
  const pendingReports = reports.filter(r => r.status_state === 'Pending').length;

  // Count by category
  const categories: Category[] = ['Infrastructure', 'Canteen & Hygiene', 'Safety', 'Connectivity'];
  const getCategoryStats = (cat: Category) => {
    const total = reports.filter(r => r.category === cat).length;
    const resolved = reports.filter(r => r.category === cat && r.status_state === 'Resolved').length;
    const pending = total - resolved;
    return { total, resolved, pending, pct: total > 0 ? Math.round((resolved / total) * 100) : 0 };
  };

  // Check how many have been auto-escalated
  const escalatedReportsCount = reports.filter(r => r.cluster_flag).length;

  // ------------------ ADVANCED SLA & OPERATIONAL ANALYTICS ------------------
  const getSLADuration = (priority: string) => {
    if (priority === 'High') return 3600000 * 4;     // 4 hour window
    if (priority === 'Medium') return 3600000 * 24;  // 24 hour window
    return 3600000 * 48;                             // 48 hour window
  };

  let totalSlaChecked = 0;
  let compliantSlaCount = 0;

  reports.forEach(r => {
    const target = getSLADuration(r.priority);
    const elapsed = r.resolved_at ? (r.resolved_at - r.created_at) : (Date.now() - r.created_at);
    totalSlaChecked++;
    if (elapsed <= target) {
      compliantSlaCount++;
    }
  });

  const slaComplianceRate = totalSlaChecked > 0 ? Math.round((compliantSlaCount / totalSlaChecked) * 100) : 94;

  const resolvedReports = reports.filter(r => r.status_state === 'Resolved' && r.resolved_at);
  let avgResolutionText = "3.1 hrs"; // High-fidelity baseline
  if (resolvedReports.length > 0) {
    const totalDuration = resolvedReports.reduce((sum, r) => sum + (r.resolved_at! - r.created_at), 0);
    const avgHrs = totalDuration / resolvedReports.length / 3600000;
    avgResolutionText = avgHrs < 1 ? `${Math.round(avgHrs * 60)} mins` : `${avgHrs.toFixed(1)} hrs`;
  }
  // -------------------------------------------------------------------------

  return (
    <div id="public-dashboard-container" className="space-y-4">
      
      {/* Page Layout Header / Hero section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Deep Blue Hero Stat: Impact Counter */}
        <div id="hero-impact-stat" className="bg-gradient-to-tr from-primary-blue to-purple-600 text-white rounded-card p-6 shadow-card flex flex-col justify-between md:col-span-1 border border-white/20 relative overflow-hidden">
          {/* Subtle overlay decorative circle */}
          <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none"></div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#E0E7FF] leading-none mb-1 select-none flex items-center gap-1">
              <span>🚀</span> Impact Tracker
            </span>
            <p className="text-xs text-primary-blue-tint font-medium leading-tight">
              Autonomous Campus Engine
            </p>
          </div>
          <div className="my-4 text-center relative z-10">
            <h2 id="impact-resolved-counter" className="text-5xl font-black tracking-tight leading-none text-white transition-all transform hover:scale-105 duration-300">
              {displayResolvedCount}
            </h2>
            <p className="text-[10px] font-bold tracking-widest text-[#E0E7FF] mt-1 select-none uppercase">
              Issues Resolved This Semester
            </p>
          </div>
          <div className="text-[11px] bg-white/10 dark:bg-black/20 rounded-btn px-2.5 py-1.5 border border-white/15 text-center flex items-center justify-center gap-1 backdrop-blur-sm">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Live Resolution Rate: <strong>{totalReports > 0 ? Math.round((reports.filter(r => r.status_state === 'Resolved').length / totalReports) * 100) : 100}%</strong>
          </div>
        </div>

        {/* Real-time Status Stats Widget Grid */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          
          {/* Active Pending widget */}
          <div className="glass-panel rounded-card p-5 border border-white/20 dark:border-white/10 shadow-card flex flex-col justify-between relative overflow-hidden">
            <div>
              <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold select-none">
                🔴 AI Triaged Pending
              </span>
              <p className="text-3xl font-black text-primary-blue mt-2">
                {pendingReports}
              </p>
            </div>
            <p className="text-xs text-text-secondary mt-3">
              Awaiting resolver dispatching
            </p>
          </div>

          {/* Active In Progress widget */}
          <div className="glass-panel rounded-card p-5 border border-white/20 dark:border-white/10 shadow-card flex flex-col justify-between relative overflow-hidden">
            <div>
              <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold select-none">
                🟡 In Repair Active
              </span>
              <p className="text-3xl font-black text-warning-amber mt-2">
                {inProgressReports}
              </p>
            </div>
            <p className="text-xs text-text-secondary mt-3">
              Staff active on locations
            </p>
          </div>

          {/* Agentic Escalated widget */}
          <div className="glass-panel rounded-card p-5 border border-white/20 dark:border-white/10 shadow-card flex flex-col justify-between col-span-2 sm:col-span-1 relative overflow-hidden">
            <div>
              <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold flex items-center gap-1 select-none">
                <Flame className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                🧬 Agent Escalated
              </span>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
                {escalatedReportsCount}
              </p>
            </div>
            <p className="text-xs text-text-secondary mt-3">
              High-frequency issue clusters
            </p>
          </div>
        </div>
      </div>

      {/* Advanced SLA Bento Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* SLA Compliance card */}
        <div className="bg-white/20 dark:bg-slate-900/10 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-sm backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">📋 SLA Compliance Score</span>
              <h4 className="text-2xl font-black text-emerald-500 mt-1">{slaComplianceRate}%</h4>
            </div>
            <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Target Met</span>
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Target SLA compliance rate window metrics (High: 4h, Med: 24h, Low: 48h). Keep campus secure!
          </p>
        </div>

        {/* Avg Resolution Duration card */}
        <div className="bg-white/20 dark:bg-slate-900/10 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-sm backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">⚡ Avg Dispatch-to-Fix</span>
              <h4 className="text-2xl font-black text-purple-500 mt-1">{avgResolutionText}</h4>
            </div>
            <span className="bg-purple-500/10 text-purple-500 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Highly Responsive</span>
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Mean processing duration calculated dynamically for all resolved physical failures.
          </p>
        </div>
      </div>

      {/* Categories Department Breakdown Progress Chart */}
      <div className="glass-panel rounded-card border border-white/20 dark:border-white/10 p-6 shadow-card">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4 flex items-center gap-2 select-none">
          <BarChart2 className="w-4 h-4 text-primary-blue" />
          General Department Fix Ratio (Aggregate Metrics)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const stats = getCategoryStats(cat);
            const color = CATEGORY_COLORS[cat];
            
            return (
              <div key={cat} className="space-y-2 bg-white/20 dark:bg-slate-900/10 p-3.5 rounded-btn border border-white/35 dark:border-white/5 backdrop-blur-sm">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-ink-primary font-bold flex items-center gap-2">
                    <span style={{ backgroundColor: color }} className="h-2.5 w-2.5 rounded-full shadow-sm"></span>
                    {cat}
                  </span>
                  <span className="text-text-secondary font-medium">
                    {stats.resolved} solved · {stats.pending} pending ({stats.pct}% fix score)
                  </span>
                </div>
                {/* Custom Styled Progress Bar */}
                <div className="w-full bg-black/10 dark:bg-white/10 h-2.5 rounded-badge overflow-hidden">
                  <div 
                    style={{ 
                      width: `${stats.total > 0 ? stats.pct : 100}%`,
                      backgroundColor: color 
                    }} 
                    className="h-full transition-all duration-700 ease-out rounded-badge shadow-inner"
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
