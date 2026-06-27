/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CampusReport, CATEGORY_COLORS } from '../types';
import { MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MapVisualizerProps {
  reports: CampusReport[];
  selectedBuilding: string | null;
  onSelectBuilding: (building: string | null) => void;
  interactive?: boolean;
}

// Fixed coordinates in a relative 100% SVG box for campus buildings
export const BUILDING_COORDINATES: Record<string, { x: number; y: number; label: string }> = {
  "Hostel A": { x: 18, y: 35, label: "Hostel Block A" },
  "Hostel B": { x: 15, y: 70, label: "Hostel Block B" },
  "Tech Block": { x: 50, y: 75, label: "Tech Block & Labs" },
  "Canteen": { x: 80, y: 68, label: "Central Canteen" },
  "Library": { x: 52, y: 30, label: "Central Library" },
  "Science Lab": { x: 82, y: 28, label: "Science & Research" },
  "Main Auditorium": { x: 50, y: 52, label: "Main Auditorium" }
};

export default function MapVisualizer({
  reports,
  selectedBuilding,
  onSelectBuilding,
  interactive = true
}: MapVisualizerProps) {
  
  // Calculate issue count (unresolved vs resolved) for each building
  const getBuildingStats = (buildingName: string) => {
    const buildingReports = reports.filter(r => r.building_tag === buildingName);
    const active = buildingReports.filter(r => r.status_state !== 'Resolved');
    const resolved = buildingReports.filter(r => r.status_state === 'Resolved');
    return {
      total: buildingReports.length,
      active: active.length,
      resolved: resolved.length,
      hasEscalated: active.some(r => r.cluster_flag || r.priority === 'High')
    };
  };

  return (
    <div id="map-visualizer-card" className="glass-panel rounded-card p-5 shadow-card h-full flex flex-col justify-between border border-white/20 dark:border-white/10 relative overflow-hidden">
      <div className="mb-4 flex justify-between items-center flex-wrap gap-2 relative z-10">
        <div>
          <h3 className="text-xs font-bold tracking-wider uppercase text-text-secondary select-none">
            📍 Interactive Campus Blueprint
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Click nodes to filter reported issues by building node.
          </p>
        </div>
        {selectedBuilding && (
          <button
            id="clear-map-filter-btn"
            onClick={() => onSelectBuilding(null)}
            className="text-[11px] bg-primary-blue/15 hover:bg-primary-blue/25 text-primary-blue px-3 py-1.5 rounded-badge font-bold transition cursor-pointer border border-primary-blue/25"
          >
            Clear Filter ({selectedBuilding})
          </button>
        )}
      </div>

      {/* SVG Campus Map Wrapper */}
      <div className="relative flex-1 bg-white/20 dark:bg-slate-900/10 backdrop-blur-sm rounded-card min-h-[300px] max-h-[450px] border border-white/25 dark:border-white/5 overflow-hidden select-none transition-colors duration-200">
        
        {/* Subtle decorative mesh grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border-divider)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border-divider)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40"></div>
        
        <svg className="w-full h-full min-h-[300px]" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Decorative Campus pathways (grey lines connecting blocks) */}
          <path
            d="M 18,35 L 52,30 M 15,70 L 50,75 M 52,30 L 50,52 M 50,52 L 50,75 M 50,52 L 80,68 M 52,30 L 82,28"
            stroke="currentColor"
            className="text-border-divider"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            fill="none"
          />

          {/* Draw connecting roads */}
          <path
            d="M 16.5,50 C 35,50 40,55 50,52 M 50,52 L 81,48"
            stroke="currentColor"
            className="text-border-divider/40"
            strokeWidth="2.5"
            fill="none"
          />
        </svg>

        {/* Precise Pinpoints for Unresolved Reports */}
        {reports.filter(r => r.status_state !== 'Resolved' && r.latitude && r.longitude).map((report) => {
          const color = CATEGORY_COLORS[report.category] || '#5B7FBF';
          
          return (
            <div
              key={report.report_id}
              id={`pinpoint-${report.report_id}`}
              style={{
                left: `${report.latitude}%`,
                top: `${report.longitude}%`
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
            >
              {/* Pulse effect */}
              <span className="absolute -inset-1 rounded-full animate-ping opacity-75" style={{ backgroundColor: color }}></span>
              
              {/* Core Dot */}
              <div 
                className="w-3 h-3 rounded-full border-2 border-white shadow-md cursor-pointer transition-all duration-300 hover:scale-150"
                style={{ backgroundColor: color }}
              ></div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/95 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 font-semibold flex flex-col items-center">
                <span className="font-bold text-indigo-300">ID: {report.report_id} ({report.room_label || 'General'})</span>
                <span className="text-[9px] text-gray-300 italic max-w-[160px] overflow-hidden text-ellipsis mt-0.5">{report.description.slice(0, 32)}...</span>
              </div>
            </div>
          );
        })}

        {/* Dynamic Building Cards Rendered on Map */}
        {Object.entries(BUILDING_COORDINATES).map(([name, coords]) => {
          const stats = getBuildingStats(name);
          const isSelected = selectedBuilding === name;
          
          return (
            <button
              key={name}
              id={`map-building-${name.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => interactive && onSelectBuilding(isSelected ? null : name)}
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 p-2 rounded-lg text-center flex flex-col items-center ${
                interactive ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {/* Outer Glow Core Indicator */}
              <div className="relative">
                {stats.active > 0 && (
                  <span className={`absolute -inset-1.5 rounded-full ${
                    stats.hasEscalated 
                      ? 'bg-critical-red animate-ping' 
                      : 'bg-warning-amber animate-pulse'
                  } opacity-35`}></span>
                )}
                
                {/* Visual Icon Badge */}
                <div className={`relative h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  stats.active > 0 
                  ? (stats.hasEscalated ? 'bg-critical-red text-white shadow-md shadow-critical-red/20' : 'bg-warning-amber text-white shadow-md')
                  : (stats.resolved > 0 ? 'bg-success-green text-white shadow' : 'bg-surface-card text-primary-blue border-2 border-primary-blue-tint')
                } ${isSelected ? 'scale-125 ring-4 ring-primary-blue ring-offset-2' : ''}`}>
                  {stats.active > 0 ? (
                    stats.hasEscalated ? (
                      <AlertCircle className="w-5 h-5 animate-bounce" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )
                  ) : stats.resolved > 0 ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <MapPin className="w-4 h-4 text-primary-gray" />
                  )}
                </div>

                {/* Counter Badge if counts > 0 */}
                {stats.active > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 bg-ink-primary text-surface-card font-mono text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-border-divider">
                    {stats.active}
                  </div>
                )}
              </div>

              {/* Building Label Card (grows on hover / selected) */}
              <div className={`mt-1.5 px-2 py-1 rounded border shadow-sm transition-all duration-200 ${
                isSelected 
                  ? 'bg-primary-blue-dark text-white border-primary-blue-dark'
                  : 'bg-surface-card text-ink-primary border-border-divider hover:shadow-md'
              }`}>
                <p className="text-[11px] font-bold whitespace-nowrap leading-none select-none">
                  {name}
                </p>
                {stats.total > 0 ? (
                  <p className={`text-[9px] mt-0.5 select-none ${isSelected ? 'text-gray-200' : 'text-text-secondary'}`}>
                    {stats.active} pending · {stats.resolved} fixed
                  </p>
                ) : (
                  <p className={`text-[8px] uppercase tracking-wider select-none ${isSelected ? 'text-gray-200' : 'text-text-secondary'}`}>
                    Clear Status
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Map Legend */}
      <div className="mt-3 grid grid-cols-3 gap-2 px-1 text-[11px] border-t border-border-divider pt-3 text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-critical-red"></span>
          Cluster Alert / High Priority
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-warning-amber"></span>
          Pending Issues
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-success-green"></span>
          All Issues Resolved
        </span>
      </div>
    </div>
  );
}
