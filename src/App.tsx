/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  INITIAL_REPORTS, 
  CampusReport, 
  Priority, 
  STATUS_COLORS, 
  PRIORITY_COLORS, 
  CATEGORY_COLORS 
} from './types';
import ReportForm from './components/ReportForm';
import ResolverQueue from './components/ResolverQueue';
import PublicDashboard from './components/PublicDashboard';
import MapVisualizer from './components/MapVisualizer';
import LoginScreen from './components/LoginScreen';
import { 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Layers, 
  FileText, 
  MapPin, 
  AlertTriangle,
  History,
  X,
  Sun,
  Moon,
  LogOut,
  User,
  Shield,
  Inbox,
  BarChart3,
  Github,
  Linkedin,
  Instagram
} from 'lucide-react';

export default function App() {
  const [reports, setReports] = useState<CampusReport[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Real-time toast feedback for issue state changes
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const reportsRef = React.useRef<CampusReport[]>([]);
  
  // User authentication state
  const [user, setUser] = useState<{ email: string; role: 'reporter' | 'authority' } | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user_session');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  // Fetch reports from persistent server-side JSON database
  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        
        // Spot status transitions dynamically for active session feedback
        if (reportsRef.current.length > 0) {
          data.forEach((newRep: CampusReport) => {
            const oldRep = reportsRef.current.find(o => o.report_id === newRep.report_id);
            if (oldRep && oldRep.status_state !== newRep.status_state) {
              const statusEmoji = newRep.status_state === 'In Progress' ? '🛠️' : newRep.status_state === 'Resolved' ? '✅' : '📢';
              setStatusToast(`${statusEmoji} Status Update: Issue ${newRep.report_id} at ${newRep.building_tag} is now "${newRep.status_state}"!`);
              setTimeout(() => setStatusToast(null), 6000);
            }
          });
        }
        
        reportsRef.current = data;
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Enable active polling every 4 seconds for immediate collaborative updates
  React.useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 4000);
    return () => clearInterval(interval);
  }, []);

  // Active view inside Authority Workspace ('queue' | 'analytics')
  const [authorityView, setAuthorityView] = useState<'queue' | 'analytics'>('queue');
  
  // Dark mode state with persistence support
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) {
        return saved === 'dark';
      }
    }
    return true; // Default to dark theme
  });

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  // Real-time agentic cluster alerting system state
  const [escalatedAlert, setEscalatedAlert] = useState<{
    building: string;
    category: string;
    count: number;
  } | null>(null);

  // Status updates in Resolver Queue (securely guarded by RBAC checks)
  const handleUpdateStatus = async (reportId: string, nextStatus: CampusReport['status_state']) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': user?.role || 'reporter'
        },
        body: JSON.stringify({ status_state: nextStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update ticket status.');
        return;
      }

      const updatedReport = await response.json();
      
      // Instantly update reports state in UI
      setReports(prev => prev.map(r => r.report_id === reportId ? updatedReport : r));
    } catch (error) {
      console.error("Error transitioning ticket status:", error);
    }
  };

  // Submit report to server-side triage and persistence database
  const handleSubmitReport = async (newReportData: {
    description: string;
    building_tag: string;
    image_payload: string;
    room_label: string;
    latitude: number;
    longitude: number;
  }) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReportData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      const result = await response.json();
      setReports(result.allReports);

      if (result.escalatedAlert) {
        setEscalatedAlert(result.escalatedAlert);
      }

      return result.newReport;
    } catch (error) {
      console.error("Error submitting report:", error);
      throw error;
    }
  };

  // Filter reported issues list in live side panel (affected by map selection)
  const displayedListReports = reports.filter(r => {
    if (selectedBuilding) {
      return r.building_tag === selectedBuilding;
    }
    return true;
  });

  const handleLoginSuccess = (email: string, role: 'reporter' | 'authority') => {
    const session = { email, role };
    setUser(session);
    localStorage.setItem('user_session', JSON.stringify(session));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col font-sans text-ink-primary transition-colors duration-200 relative overflow-x-hidden">
      
      {/* Dynamic Ambient Blur Background Orbs for high-fidelity Glassmorphic feel */}
      <div className="ambient-glow top-[5%] left-[2%] bg-gradient-to-tr from-sky-400 via-indigo-400 to-purple-500 opacity-20 dark:opacity-10"></div>
      <div className="ambient-glow bottom-[10%] right-[3%] bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500 opacity-15 dark:opacity-10"></div>
      <div className="ambient-glow top-[50%] left-[40%] bg-gradient-to-r from-pink-300 to-amber-300 opacity-10 dark:opacity-5"></div>

      {/* Live Status Change Alert Toast */}
      {statusToast && (
        <div className="fixed bottom-6 right-6 bg-slate-950/95 border border-white/10 text-white py-4.5 px-5 shadow-2xl rounded-xl flex items-center justify-between gap-4 transition-all duration-300 z-50 max-w-sm animate-pulse-slow">
          <p className="text-xs font-bold leading-snug">{statusToast}</p>
          <button 
            onClick={() => setStatusToast(null)}
            className="text-white hover:text-gray-300 transition p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic Global Agent Escalation Toast */}
      {escalatedAlert && (
        <div className="bg-critical-red text-white py-3 px-4 shadow-lg flex items-center justify-between transition-all duration-300 relative z-50">
          <div className="flex items-center gap-3 max-w-5xl mx-auto w-full">
            <Flame className="w-5 h-5 animate-bounce flex-shrink-0" />
            <p className="text-xs sm:text-sm font-semibold leading-snug">
              ⚠️ <strong>Agentic Escalation Triggered!</strong> {escalatedAlert.count} recurring reports of <strong>{escalatedAlert.category}</strong> at <strong>{escalatedAlert.building}</strong>. The system has automatically escalated their priorities to <strong>High</strong>.
            </p>
          </div>
          <button 
            onClick={() => setEscalatedAlert(null)}
            className="text-white hover:text-gray-200 transition p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Bar Header with adaptive items */}
      <header className="glass-panel border-b border-white/25 dark:border-white/5 transition-colors duration-200 sticky top-0 z-40 shadow-sm backdrop-blur-md">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-primary-blue tracking-tight hover:scale-[1.02] transition cursor-pointer select-none flex-shrink-0">
              Campus<span className="text-purple-500">Fix</span>
            </h1>
            {user && (
              <span className={`text-[9px] sm:text-[10px] uppercase font-black px-2 sm:px-2.5 py-0.5 rounded-badge select-none border truncate ${
                user.role === 'authority' 
                  ? 'bg-success-green/10 text-success-green border-success-green/20' 
                  : 'bg-primary-blue/10 text-primary-blue border-primary-blue/20'
              }`}>
                {user.role} Panel
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Logged In Info & Switcher Options */}
            {user && (
              <div className="hidden md:flex items-center gap-2 text-xs text-text-secondary select-none mr-1">
                {user.role === 'authority' ? (
                  <Shield className="w-3.5 h-3.5 text-success-green" />
                ) : (
                  <User className="w-3.5 h-3.5 text-primary-blue" />
                )}
                <span className="font-semibold text-ink-primary max-w-[150px] truncate">
                  {user.email}
                </span>
              </div>
            )}

            {/* Dark Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle Dark Theme"
              className="p-2 rounded-btn border border-white/20 bg-white/20 dark:bg-slate-900/20 text-text-secondary hover:text-ink-primary hover:bg-white/40 dark:hover:bg-slate-900/40 transition-all cursor-pointer flex items-center justify-center shadow-sm"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {/* Logout button */}
            {user && (
              <button
                id="logout-header-btn"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-btn text-xs font-bold text-critical-red bg-critical-red/10 hover:bg-critical-red/20 border border-critical-red/20 transition cursor-pointer select-none shadow-sm flex-shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* WORKSPACE AREA */}
      {!user ? (
        /* If logged out: render the beautiful Login view */
        <div className="flex-grow flex items-center justify-center py-10">
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        /* If logged in: render the partitioned panels */
        <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 relative z-10">
          
          {/* Explicit Panel Title Block */}
          <div className="glass-panel rounded-card p-5 border border-white/25 dark:border-white/5 shadow-card backdrop-blur-md">
            <h2 className="text-xl sm:text-2xl font-black text-ink-primary tracking-tight select-none">
              {user.role === 'authority' ? '🛡️ Authority Panel' : '📢 Reporter Panel'}
            </h2>
            <p className="text-xs text-text-secondary mt-1 font-medium">
              {user.role === 'authority' 
                ? 'Review live diagnostics, manage ticket status queues, and trace real-time compliance SLA metrics.' 
                : 'Lodge physical failure incidents with base64 evidence uploads, automatic AI triage categorization, and precise floor plotting.'}
            </p>
          </div>
          


          {/* Subheader / Tabs for Authority panel to switch between ResolverQueue and PublicDashboard */}
          {user.role === 'authority' && (
            <div className="glass-panel rounded-card p-3.5 flex flex-wrap items-center justify-between gap-4 select-none border border-white/20 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block px-1">
                  🛡️ Authority Control Station
                </span>
              </div>
              
              <div className="flex bg-white/20 dark:bg-slate-950/40 p-1 rounded-badge border border-white/20">
                <button
                  id="auth-tab-queue"
                  onClick={() => setAuthorityView('queue')}
                  className={`px-4 py-2 rounded-badge text-xs font-bold transition duration-300 flex items-center gap-2 cursor-pointer ${
                    authorityView === 'queue'
                      ? 'bg-primary-blue text-white shadow-md'
                      : 'text-text-secondary hover:text-ink-primary'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Active Queue</span>
                </button>
                <button
                  id="auth-tab-analytics"
                  onClick={() => setAuthorityView('analytics')}
                  className={`px-4 py-2 rounded-badge text-xs font-bold transition duration-300 flex items-center gap-2 cursor-pointer ${
                    authorityView === 'analytics'
                      ? 'bg-primary-blue text-white shadow-md'
                      : 'text-text-secondary hover:text-ink-primary'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Analytics & Dashboard</span>
                </button>
              </div>
            </div>
          )}

          {/* Primary Split Workspace */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Left Side Column: Form or active authority view */}
            <section className="xl:col-span-7 space-y-6">
              {user.role === 'reporter' ? (
                /* Reporter Panel Form */
                <ReportForm onSubmitReport={handleSubmitReport} />
              ) : (
                /* Authority Panel views (Analytics nested perfectly here!) */
                <>
                  {authorityView === 'queue' && (
                    <ResolverQueue reports={reports} onUpdateStatus={handleUpdateStatus} />
                  )}
                  {authorityView === 'analytics' && (
                    <PublicDashboard 
                      reports={reports} 
                      selectedBuilding={selectedBuilding} 
                      onSelectBuilding={setSelectedBuilding} 
                    />
                  )}
                </>
              )}
            </section>
            
            {/* Right Side Column: Real-time map & reports view timeline */}
            <section className="xl:col-span-5 space-y-6 flex flex-col justify-between">
              
              {/* Real-time Map Visualizer */}
              <div className="flex-1 min-h-[350px]">
                <MapVisualizer 
                  reports={reports} 
                  selectedBuilding={selectedBuilding} 
                  onSelectBuilding={setSelectedBuilding}
                />
              </div>

              {/* Map Affected Live Subscriptions Feed (List View) */}
              <div className="glass-panel rounded-card p-5 shadow-card border border-white/20 dark:border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold tracking-tight text-ink-primary flex items-center gap-1.5 select-none">
                    <History className="w-4 h-4 text-primary-blue" />
                    {selectedBuilding ? `🚨 Issues inside ${selectedBuilding}` : '📋 Live Action Feed'}
                  </h3>
                  
                  <span className="text-[10px] font-mono text-text-secondary font-bold bg-white/20 px-2 py-0.5 rounded border border-white/10">
                    {displayedListReports.length} reports total
                  </span>
                </div>

                <div id="live-timeline-feed" className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
                  {displayedListReports.length === 0 ? (
                    <div className="text-center py-8 bg-primary-blue-tint/10 rounded border border-dashed border-border-divider text-text-secondary">
                      <p className="text-xs">No reports reported yet for this location.</p>
                    </div>
                  ) : (
                    displayedListReports.map((report) => {
                      const pStyle = PRIORITY_COLORS[report.priority] || PRIORITY_COLORS.Medium;
                      const sStyle = STATUS_COLORS[report.status_state] || STATUS_COLORS.Pending;
                      
                      return (
                        <div 
                          key={report.report_id} 
                          className="border border-white/20 dark:border-white/10 rounded-lg p-3.5 hover:bg-white/40 dark:hover:bg-slate-900/30 transition-all flex gap-3 items-start relative bg-white/20 dark:bg-slate-900/10 backdrop-blur-sm shadow-sm"
                        >
                          {/* Thumbnail of actual report photo */}
                          <img 
                            src={report.image_payload} 
                            alt="Evidence thumbnail"
                            className="w-12 h-12 rounded object-cover flex-shrink-0 border border-white/20 shadow-sm"
                            referrerPolicy="no-referrer"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-1">
                              <span className="text-xs font-bold text-ink-primary leading-tight truncate">
                                {report.building_tag}
                              </span>
                              <span 
                                style={{ backgroundColor: sStyle.bg, color: sStyle.text }}
                                className="text-[9px] font-extrabold px-1.5 py-0.5 rounded"
                              >
                                {report.status_state}
                              </span>
                            </div>

                            <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-normal">
                              {report.description}
                            </p>

                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-white/20 flex-wrap gap-1.5">
                              <div className="flex gap-1.5 flex-wrap">
                                {/* Category badge */}
                                <span 
                                  style={{ backgroundColor: CATEGORY_COLORS[report.category] + '15', color: CATEGORY_COLORS[report.category] }}
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                >
                                  {report.category}
                                </span>
                                
                                {/* Priority badge */}
                                <span 
                                  style={{ backgroundColor: pStyle.bg, color: pStyle.text }}
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                >
                                  {report.priority}
                                </span>
                              </div>

                              {/* Escalation tracker banner */}
                              {report.cluster_flag && (
                                <span className="text-[8px] font-black tracking-wider text-[#6B21A8]/90 uppercase flex items-center gap-0.5 select-none">
                                  <Flame className="w-2.5 h-2.5 animate-pulse" />
                                  AI Escalated
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </section>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="glass-panel border-t border-white/10 dark:border-white/5 py-6 text-center mt-auto backdrop-blur-md relative z-10">
        <div className="max-w-[1240px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary font-medium">
            CampusFix &copy; {new Date().getFullYear()} · Modern Infrastructure Management
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/Sarfarosh-0" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-text-secondary hover:text-ink-primary transition-colors p-1.5 rounded-full hover:bg-white/10 dark:hover:bg-white/5"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a 
              href="https://www.linkedin.com/in/sarfarosh-xxi" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-text-secondary hover:text-ink-primary transition-colors p-1.5 rounded-full hover:bg-white/10 dark:hover:bg-white/5"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a 
              href="https://www.instagram.com/sarfarosh_0/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-text-secondary hover:text-ink-primary transition-colors p-1.5 rounded-full hover:bg-white/10 dark:hover:bg-white/5"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

