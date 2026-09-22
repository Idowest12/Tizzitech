import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Save, 
  Eye, 
  Calendar,
  Flame,
  PartyPopper,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { LaunchSettings } from '../types';
import { auth, logAuditActivity } from '../firebase';

interface AdminLaunchControlProps {
  onSuccessToast?: (msg: string) => void;
}

const DEFAULT_LAUNCH_TARGET = '2026-12-22T00:00:00+01:00';

export function AdminLaunchControl({ onSuccessToast }: AdminLaunchControlProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [targetDate, setTargetDate] = useState<string>(DEFAULT_LAUNCH_TARGET);
  const [isLaunched, setIsLaunched] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('Next-Gen Smartphone & Wearable Drops');
  const [announcement, setAnnouncement] = useState<string>(
    'Be among the privileged first in West Africa to reserve upcoming flagship foldables, high-tier smartphones, and smartwatch innovations.'
  );

  // Live timer calculation for admin preview
  const [previewTime, setPreviewTime] = useState<{ days: number; hours: number; minutes: number; seconds: number; totalMs: number }>({
    days: 90,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 90 * 86400000
  });

  // Load existing settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.launchSettings) {
          const ls: LaunchSettings = data.launchSettings;
          if (ls.targetDate) setTargetDate(ls.targetDate);
          if (typeof ls.isLaunched === 'boolean') setIsLaunched(ls.isLaunched);
          if (ls.title) setTitle(ls.title);
          if (ls.announcement) setAnnouncement(ls.announcement);
        }
      }
    } catch (err) {
      console.error('Failed to load launch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Live Countdown preview ticker
  useEffect(() => {
    const updatePreview = () => {
      const target = new Date(targetDate).getTime();
      const now = Date.now();
      const diff = target - now;

      if (isNaN(target) || diff <= 0) {
        setPreviewTime({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: Math.max(0, diff) });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setPreviewTime({ days, hours, minutes, seconds, totalMs: diff });
      }
    };

    updatePreview();
    const interval = setInterval(updatePreview, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const handleSet90DaysFromTomorrow = () => {
    // Tomorrow + 90 days = Dec 22, 2026
    setTargetDate(DEFAULT_LAUNCH_TARGET);
    setIsLaunched(false);
    setMessage({
      type: 'success',
      text: 'Target set to 90 Days from tomorrow (December 22, 2026). Remember to click "Save Changes" below.'
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      const payload: LaunchSettings = {
        targetDate,
        isLaunched,
        title,
        announcement,
        lastUpdated: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || 'admin'
      };

      const res = await fetch('/api/admin/launch-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ launchSettings: payload })
      });

      if (!res.ok) {
        throw new Error('Failed to update launch configuration');
      }

      const statusDesc = isLaunched ? 'Launched & Live Drops' : `Countdown active (${previewTime.days} Days left)`;
      logAuditActivity('LAUNCH_SETTINGS_UPDATE', `Updated launch config: ${statusDesc}`, auth.currentUser?.email || 'admin');

      setMessage({ type: 'success', text: 'Launch settings updated and synchronized across all storefront visitors!' });
      if (onSuccessToast) onSuccessToast('Launch settings saved successfully!');
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Error saving launch configuration' });
    } finally {
      setSaving(false);
    }
  };

  // Helper to format ISO date to datetime-local input string
  const formatForDateTimeInput = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      // Format to YYYY-MM-DDTHH:mm
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-900">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Rocket className="w-6 h-6 text-blue-500" />
            Pre-Launch & Drop Countdown Manager
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Manage the flagship product drop countdown, set fixed target dates, or trigger the live launch celebration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-2 border border-neutral-800 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Launch Settings'}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-red-950/40 border-red-800/60 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* LIVE PREVIEW HERO CARD */}
      <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Public Storefront Status</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {isLaunched ? '🚀 Drops Are Officially LIVE' : '⏳ Pre-Launch Countdown in Progress'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isLaunched
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
              }`}
            >
              {isLaunched ? '🎉 Live Drops Activated' : `Active Countdown: ${previewTime.days} Days`}
            </span>
          </div>
        </div>

        {/* Live Timer Grid Preview */}
        {!isLaunched ? (
          <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-xl mx-auto my-6 relative z-10">
            {[
              { label: 'DAYS', val: previewTime.days },
              { label: 'HOURS', val: previewTime.hours },
              { label: 'MINUTES', val: previewTime.minutes },
              { label: 'SECONDS', val: previewTime.seconds }
            ].map((unit, idx) => (
              <div
                key={idx}
                className="bg-black/60 border border-neutral-800 rounded-2xl p-4 text-center backdrop-blur-md shadow-inner relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-[2px] bg-blue-500/50" />
                <span className="text-2xl sm:text-4xl font-mono font-black text-white block">
                  {String(unit.val).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase text-neutral-400 tracking-wider mt-1 block">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="my-6 p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center relative z-10">
            <PartyPopper className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-emerald-300">Launch Day Celebration Mode Active!</p>
            <p className="text-xs text-neutral-400 mt-1">
              Storefront displays the launch celebration animation, congratulatory banner, and instant reservation shopping links.
            </p>
          </div>
        )}

        <div className="text-center text-xs text-neutral-400 relative z-10 pt-2 border-t border-neutral-800/80">
          Target Date: <strong className="text-neutral-200">{new Date(targetDate).toUTCString()}</strong>
          {' • '}(Lagos Time: <strong className="text-neutral-200">{new Date(targetDate).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}</strong>)
        </div>
      </div>

      {/* CONTROLS & SETTINGS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Countdown Controls */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Clock className="w-4 h-4 text-blue-400" />
            <h3>Countdown Target Configuration</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Quick Preset
              </label>
              <button
                type="button"
                onClick={handleSet90DaysFromTomorrow}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 font-semibold text-xs flex items-center justify-between transition-all"
              >
                <span>Set to 90 Days from Tomorrow</span>
                <span className="text-[11px] font-mono text-neutral-400">Dec 22, 2026</span>
              </button>
              <p className="text-[11px] text-neutral-500 mt-1.5">
                Locks the countdown to stick to exactly 90 days from tomorrow without floating on browser refreshes.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Target Date & Time (Custom)
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formatForDateTimeInput(targetDate)}
                  onChange={(e) => {
                    if (e.target.value) {
                      setTargetDate(new Date(e.target.value).toISOString());
                    }
                  }}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                The countdown will continuously tick down to this precise moment.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Launch Trigger & Mode */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3>Launch Action & Celebration State</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Live Launch Toggle</h4>
                  <p className="text-xs text-neutral-400">
                    Force the drop to go live immediately, regardless of timer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLaunched(!isLaunched)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    isLaunched ? 'bg-emerald-600' : 'bg-neutral-800'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isLaunched ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsLaunched(false)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    !isLaunched
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  ⏳ Countdown Mode
                </button>
                <button
                  type="button"
                  onClick={() => setIsLaunched(true)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isLaunched
                      ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  🚀 Launch Now Mode
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Hero Announcement Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Next-Gen Smartphone & Wearable Drops"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description & Save Action Footer */}
      <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs text-neutral-400">
            Changes save to global database settings and are cached server-side so visitors experience zero delay.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Launch Settings'}
        </button>
      </div>
    </div>
  );
}
