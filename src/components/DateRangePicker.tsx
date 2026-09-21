import React from 'react';
import { Calendar, CalendarDays, RotateCcw, X, Clock } from 'lucide-react';

export type DateRangePreset = 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'custom';

export interface DateRangePickerProps {
  preset: DateRangePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onPresetChange: (preset: DateRangePreset) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReset: () => void;
  itemCount?: number;
  totalCount?: number;
  label?: string;
  className?: string;
}

/**
 * Robust date comparison helper that handles timestamps (ms), ISO date strings, and date-only strings.
 */
export function isDateInRange(
  dateVal: any,
  preset: DateRangePreset,
  startDate?: string,
  endDate?: string
): boolean {
  if (preset === 'all') return true;
  if (!dateVal) return false;

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return false;

  const now = new Date();

  if (preset === 'today') {
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }

  if (preset === 'yesterday') {
    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    return (
      d.getFullYear() === yest.getFullYear() &&
      d.getMonth() === yest.getMonth() &&
      d.getDate() === yest.getDate()
    );
  }

  if (preset === '7days') {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    return d >= sevenDaysAgo && d <= now;
  }

  if (preset === '30days') {
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    return d >= thirtyDaysAgo && d <= now;
  }

  if (preset === 'this_month') {
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth()
    );
  }

  if (preset === 'custom') {
    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      if (d < s) return false;
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      if (d > e) return false;
    }
    return true;
  }

  return true;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  preset,
  startDate,
  endDate,
  onPresetChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
  itemCount,
  totalCount,
  label = 'Timeframe',
  className = '',
}) => {
  const isFiltered = preset !== 'all' || Boolean(startDate) || Boolean(endDate);

  const presets: { key: DateRangePreset; label: string }[] = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: '7days', label: 'Last 7 Days' },
    { key: '30days', label: 'Last 30 Days' },
    { key: 'this_month', label: 'This Month' },
    { key: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className={`bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 space-y-3 shadow-sm ${className}`}>
      {/* Top Header & Presets Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Label & Active Status */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 uppercase tracking-wider">
            <CalendarDays className="w-4 h-4 text-blue-400" />
            <span>{label}</span>
          </div>
          {isFiltered && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              Filtered
            </span>
          )}
          {typeof itemCount === 'number' && (
            <span className="text-xs text-neutral-400 font-mono">
              ({itemCount}{typeof totalCount === 'number' ? ` of ${totalCount}` : ''} records)
            </span>
          )}
        </div>

        {/* Preset Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {presets.map((p) => {
            const isActive = preset === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => onPresetChange(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/20'
                    : 'bg-neutral-950/60 text-neutral-400 hover:text-white hover:bg-neutral-800/80 border-neutral-800/80'
                }`}
              >
                {p.label}
              </button>
            );
          })}

          {/* Reset button when active */}
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              title="Reset date filter"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range Selector (Visible when Custom is chosen, or expandable) */}
      {preset === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-800/70 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            />
          </div>

          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                onStartDateChange('');
                onEndDateChange('');
              }}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 px-2 py-1 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 transition-all"
            >
              <X className="w-3 h-3" />
              <span>Clear Dates</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
