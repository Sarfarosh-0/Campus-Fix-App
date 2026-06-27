/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle, Sparkles, Check, RefreshCw } from 'lucide-react';
import { CampusReport, CAMPUS_BUILDINGS, Category, Priority } from '../types';

const BUILDING_CENTERS: Record<string, { x: number; y: number }> = {
  "Hostel A": { x: 18, y: 35 },
  "Hostel B": { x: 15, y: 70 },
  "Tech Block": { x: 50, y: 75 },
  "Canteen": { x: 80, y: 68 },
  "Library": { x: 52, y: 30 },
  "Science Lab": { x: 82, y: 28 },
  "Main Auditorium": { x: 50, y: 52 }
};

interface ReportFormProps {
  onSubmitReport: (newReport: {
    description: string;
    building_tag: string;
    image_payload: string;
    room_label: string;
    latitude: number;
    longitude: number;
  }) => Promise<any>;
}

export default function ReportForm({ onSubmitReport }: ReportFormProps) {
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState(CAMPUS_BUILDINGS[1]); // Default to Hostel B
  const [imageUrl, setImageUrl] = useState('');
  const [roomLabel, setRoomLabel] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triageDetails, setTriageDetails] = useState<{
    category: string;
    priority: string;
    reasoning: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Character count validation (Max 500 chars)
  const isDescriptionValid = description.trim().length > 0 && description.length <= 500;

  // Image upload handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerTriageAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDescriptionValid) {
      setError('Description must be between 1 and 500 characters.');
      return;
    }
    if (!imageUrl) {
      setError('A photo is strictly required to verify the infrastructure failure.');
      return;
    }

    setLoading(true);
    setError(null);
    setTriageDetails(null);

    try {
      // Calculate building coordinates
      const center = BUILDING_CENTERS[building] || { x: 50, y: 50 };
      const computedLat = center.x;
      const computedLng = center.y;

      // Submit through central app handler (which posts to /api/reports)
      const parsedTriageResult = await onSubmitReport({
        description,
        building_tag: building,
        image_payload: imageUrl,
        room_label: roomLabel || "General Area",
        latitude: Number(computedLat.toFixed(2)),
        longitude: Number(computedLng.toFixed(2))
      });

      setTriageDetails({
        category: parsedTriageResult.category,
        priority: parsedTriageResult.priority,
        reasoning: parsedTriageResult.reasoning || "Triage completed successfully."
      });

      // Reset form variables upon successful submission
      setDescription('');
      setImageUrl('');
      setRoomLabel('');
    } catch (err: any) {
      console.error(err);
      setError('AI Triage pipeline broke. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="report-form-container" className="glass-panel rounded-card p-6 sm:p-8 shadow-card relative overflow-hidden transition-all duration-300">
      
      {/* Absolute faint background gradient ring */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-blue/10 blur-2xl pointer-events-none"></div>

      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink-primary flex items-center gap-2">
            <span>📢</span> Report Campus Issue
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Capture or drag a photo. Our server-side Gemini AI Agent will instantly triage and classify.
          </p>
        </div>
        
      </div>

      <form onSubmit={triggerTriageAndSubmit} className="space-y-4 relative z-10">
        {/* Step 1: Photo Upload Component */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2">
            1. Evidence Image <span className="text-critical-red">*</span>
          </label>
          
          <div className="w-full">
            {/* Drag & Drop Canvas */}
            <div
              id="file-drop-target"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[250px] transition-all duration-300 ${
                isDragging 
                  ? 'border-primary-blue bg-primary-blue-tint/40' 
                  : imageUrl 
                    ? 'border-success-green/60 bg-success-tint/20' 
                    : 'border-white/30 dark:border-white/10 bg-white/20 dark:bg-slate-900/10 hover:border-primary-blue hover:bg-white/40 dark:hover:bg-slate-900/20'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              {imageUrl ? (
                <div className="relative w-full h-[220px] flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Upload Preview"
                    className="h-full object-cover rounded-md border border-white/20 shadow-md"
                  />
                  <div className="absolute top-1 right-1 bg-success-green text-white p-1.5 rounded-full shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageUrl('');
                    }}
                    className="absolute bottom-1 right-1 bg-critical-red hover:bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-md transition"
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <>
                  <div className="h-11 w-11 rounded-btn bg-primary-blue/10 text-primary-blue flex items-center justify-center mb-2 shadow-sm border border-primary-blue/10">
                    <Camera className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-ink-primary">
                    Drag photo here or <span className="text-primary-blue hover:underline">browse files</span>
                  </p>
                  <p className="text-[11px] text-text-secondary mt-1">
                    Please upload an issue photo to trigger real-time AI classification
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Location and Description Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                2. Building Tag <span className="text-critical-red">*</span>
              </label>
              <select
                id="report-building-select"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full bg-white/20 dark:bg-slate-900/20 border border-white/40 dark:border-white/10 rounded-btn px-3 py-2 text-sm text-ink-primary font-semibold focus:border-primary-blue focus:outline-none transition min-h-[42px] cursor-pointer backdrop-blur-sm"
              >
                {CAMPUS_BUILDINGS.map((b) => (
                  <option key={b} value={b} className="bg-surface-card text-ink-primary">
                    🏢 {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                📍 Room / Specific Spot
              </label>
              <input
                type="text"
                value={roomLabel}
                onChange={(e) => setRoomLabel(e.target.value)}
                placeholder="e.g. Room 302, Hallway B"
                className="w-full bg-white/20 dark:bg-slate-900/20 border border-white/40 dark:border-white/10 rounded-btn px-3.5 py-2 text-sm text-ink-primary focus:border-primary-blue focus:outline-none transition min-h-[42px] placeholder-text-secondary backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  3. Issue Description <span className="text-critical-red">*</span>
                </label>
                <span className={`text-[10px] font-bold ${description.length > 500 ? 'text-critical-red' : 'text-text-secondary'}`}>
                  {description.length}/500
                </span>
              </div>
              <textarea
                id="report-description-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={520}
                placeholder="e.g. Broken water pipe flooding Hostel B staircase..."
                rows={9}
                className="w-full bg-white/20 dark:bg-slate-900/20 border border-white/40 dark:border-white/10 rounded-btn px-3.5 py-3 text-sm text-ink-primary placeholder-text-secondary focus:border-primary-blue focus:outline-none transition min-h-[196px] backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-critical-red/10 border border-critical-red/30 text-critical-red p-3.5 rounded-btn text-xs font-semibold backdrop-blur-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic AI Triage Logs Panel */}
        {triageDetails && (
          <div className="bg-[#FAF5FF]/40 dark:bg-purple-950/10 border border-purple-300/40 rounded-btn p-4 space-y-3 text-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-[#6B21A8] dark:text-purple-300 font-bold">
              <span className="flex items-center gap-1.5 select-none">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                Gemini AI Autonomous Decision Logs:
              </span>
              <span className="bg-purple-100 dark:bg-purple-900/30 px-2.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider text-purple-700 dark:text-purple-300">Classified</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-ink-primary font-medium">
              <div>
                <span className="text-[9px] text-text-secondary uppercase tracking-wider block select-none">Category Route</span>
                <span className="bg-white/30 dark:bg-slate-900/30 border border-white/20 px-2.5 py-1 rounded inline-block mt-1 font-mono text-xs text-ink-primary">{triageDetails.category}</span>
              </div>
              <div>
                <span className="text-[9px] text-text-secondary uppercase tracking-wider block select-none">Calculated Priority</span>
                <span className="bg-white/30 dark:bg-slate-900/30 border border-white/20 px-2.5 py-1 rounded inline-block mt-1 font-mono text-xs text-ink-primary">{triageDetails.priority}</span>
              </div>
            </div>
            <p className="text-text-secondary leading-relaxed bg-white/20 dark:bg-slate-900/25 border border-white/20 p-2.5 rounded italic font-mono text-[11px] mt-2">
              <strong>Triage Reasoning:</strong> {triageDetails.reasoning}
            </p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/20">
          <button
            id="report-submit-btn"
            type="submit"
            disabled={loading || !isDescriptionValid || !imageUrl}
            className={`flex-1 py-3 px-4 rounded-btn font-extrabold text-sm transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none cursor-pointer tracking-wider uppercase ${
              loading 
                ? 'bg-primary-blue-dark/70 text-white cursor-not-allowed animate-pulse' 
                : (!isDescriptionValid || !imageUrl)
                  ? 'bg-slate-200/80 dark:bg-slate-800/40 border border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-300 cursor-not-allowed shadow-inner' 
                  : 'bg-[dodgerblue] hover:bg-[#157cdb] dark:bg-[blueviolet] dark:hover:bg-[#731cb2] text-white shadow-md hover:shadow-lg active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Triggering Server-side Triage...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Submit Report & Triage
              </>
            )}
          </button>
          
          <button
            id="reset-form-btn"
            type="button"
            onClick={() => {
              setDescription('');
              setImageUrl('');
              setError(null);
              setTriageDetails(null);
            }}
            className="border border-[dodgerblue]/30 dark:border-[blueviolet]/30 bg-[dodgerblue]/10 hover:bg-[dodgerblue] dark:bg-[blueviolet]/10 dark:hover:bg-[blueviolet] text-[dodgerblue] hover:text-white dark:text-[#d39eff] dark:hover:text-white font-semibold text-sm px-4 py-3 rounded-btn transition-all duration-300 cursor-pointer shadow-sm"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
