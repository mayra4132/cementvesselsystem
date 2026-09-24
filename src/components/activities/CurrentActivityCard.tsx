import React, { useState, useEffect } from 'react';
import { VesselActivity, ActivityConflictResolution } from '../../types';
import { ActivityStatusBadge, ExecutionModeBadge, PriorityBadge } from './ActivityStatusBadge';
import { formatDateTime, formatHoursAndMinutes } from '../../lib/format';
import {
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  FastForward,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  AlertOctagon,
  ShieldAlert,
} from 'lucide-react';
import { Modal } from '../ui/Modal';

interface CurrentActivityCardProps {
  activity?: VesselActivity;
  vesselName: string;
  onStart: (activityId: string, options?: { startedAt?: string; resolution?: ActivityConflictResolution }) => Promise<void>;
  onStop: (activityId: string, reason: string, notes?: string) => Promise<void>;
  onResume: (activityId: string, notes?: string) => Promise<void>;
  onComplete: (activityId: string, options?: { actualEnd?: string; completionNotes?: string }) => Promise<void>;
  onCancel: (activityId: string, reason: string, notes?: string) => Promise<void>;
  onCompleteAndStartNext: (activityId: string, completionNotes?: string) => Promise<void>;
  onOpenDetail?: (activity: VesselActivity) => void;
  canEdit?: boolean;
}

export function CurrentActivityCard({
  activity,
  vesselName,
  onStart,
  onStop,
  onResume,
  onComplete,
  onCancel,
  onCompleteAndStartNext,
  onOpenDetail,
  canEdit = true,
}: CurrentActivityCardProps) {
  // Live elapsed time counter
  const [elapsedString, setElapsedString] = useState<string>('');

  // Modals state
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [stopReason, setStopReason] = useState('');
  const [stopNotes, setStopNotes] = useState('');

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!activity || !activity.actualStart || activity.status !== 'IN_PROGRESS') {
      if (activity?.actualStart && activity.actualEnd) {
        const ms = new Date(activity.actualEnd).getTime() - new Date(activity.actualStart).getTime();
        const hrs = ms / 3600000;
        setElapsedString(formatHoursAndMinutes(hrs));
      } else {
        setElapsedString('');
      }
      return;
    }

    const updateTimer = () => {
      const startMs = new Date(activity.actualStart!).getTime();
      const nowMs = Date.now();
      const diffHrs = Math.max(0, (nowMs - startMs) / 3600000);
      setElapsedString(formatHoursAndMinutes(diffHrs));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [activity?.actualStart, activity?.actualEnd, activity?.status]);

  if (!activity) {
    return (
      <div className="bg-white border border-[#E1DED4] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E1DED4]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A6764]">
            Current Activity
          </h2>
          <span className="text-xs text-[#7A8784]">No Active Primary Task</span>
        </div>
        <div className="py-8 text-center text-sm text-[#7A8784]">
          No activity is currently in progress for {vesselName}.
        </div>
      </div>
    );
  }

  const handleConfirmStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onStop(activity.id, stopReason.trim(), stopNotes.trim());
      setIsStopModalOpen(false);
      setStopReason('');
      setStopNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onComplete(activity.id, { completionNotes: completionNotes.trim() });
      setIsCompleteModalOpen(false);
      setCompletionNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onCancel(activity.id, cancelReason.trim());
      setIsCancelModalOpen(false);
      setCancelReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteAndStartNextClick = async () => {
    setIsSubmitting(true);
    try {
      await onCompleteAndStartNext(activity.id, 'Completed via fast track button');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = activity.progressPct !== undefined ? activity.progressPct : null;

  return (
    <div className="bg-white border-2 border-[#C9C4B6] hover:border-[#0C9349]/50 transition-colors rounded-xl p-5 shadow-xs space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E1DED4]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#0C9349] animate-ping" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#14181A]">
            Current Activity
          </h2>
          <ExecutionModeBadge mode={activity.executionMode} />
          <PriorityBadge priority={activity.priority} />
        </div>
        <div className="flex items-center gap-2">
          <ActivityStatusBadge status={activity.status} />
        </div>
      </div>

      {/* Main Activity Details */}
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h3
            onClick={() => onOpenDetail?.(activity)}
            className="text-xl sm:text-2xl font-black text-[#14181A] hover:text-[#0C9349] cursor-pointer transition-colors"
          >
            {activity.title}
          </h3>
          {activity.location && (
            <span className="text-xs text-[#5A6764] flex items-center gap-1 shrink-0 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#7A8784]" />
              {activity.location}
            </span>
          )}
        </div>
        {activity.description && (
          <p className="text-xs text-[#5A6764] mt-1 leading-relaxed">
            {activity.description}
          </p>
        )}
      </div>

      {/* Progress Bar (if applicable) */}
      {progress !== null && (
        <div className="space-y-1.5 bg-[#FAF9F5] p-3 rounded-lg border border-[#EDEAE1]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#14181A]">Activity Progress</span>
            <span className="font-bold font-mono text-[#0C9349]">{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-[#E1DED4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0C9349] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Alert Banners: STOPPED or BLOCKED */}
      {activity.status === 'STOPPED' && (
        <div className="p-3 bg-[#FFF3E0] border border-[#FFE082] rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#D97706]">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            Activity Stopped Temporarily
          </div>
          <p className="text-[#92400E] font-medium">
            Reason: {activity.stopReason || 'No reason specified'}
          </p>
          {activity.stoppedAt && (
            <p className="text-[#B45309] text-[11px]">
              Stopped since: {formatDateTime(activity.stoppedAt)}
            </p>
          )}
        </div>
      )}

      {activity.status === 'BLOCKED' && (
        <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#DC2626]">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            Activity Blocked by Dependency
          </div>
          <p className="text-[#991B1B] font-medium">
            {activity.blockerReason || 'Waiting on preceding operational prerequisites'}
          </p>
        </div>
      )}

      {/* Metrics Row: Started, Elapsed, Forecast Finish */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        <div className="bg-[#F7F5F0] p-2.5 rounded-lg border border-[#EDEAE1]">
          <div className="text-[11px] font-semibold text-[#7A8784] uppercase">Started</div>
          <div className="text-xs font-bold text-[#14181A] mt-0.5 font-mono">
            {activity.actualStart ? formatDateTime(activity.actualStart) : 'Not Started'}
          </div>
        </div>

        <div className="bg-[#F7F5F0] p-2.5 rounded-lg border border-[#EDEAE1]">
          <div className="text-[11px] font-semibold text-[#7A8784] uppercase">Elapsed Time</div>
          <div className="text-xs font-bold text-[#0C9349] mt-0.5 font-mono">
            {elapsedString || '—'}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-[#F7F5F0] p-2.5 rounded-lg border border-[#EDEAE1]">
          <div className="text-[11px] font-semibold text-[#7A8784] uppercase">Forecast Finish</div>
          <div className="text-xs font-bold text-[#14181A] mt-0.5 font-mono">
            {activity.forecastEnd
              ? formatDateTime(activity.forecastEnd)
              : activity.plannedEnd
              ? formatDateTime(activity.plannedEnd)
              : 'TBD'}
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      {canEdit && (
        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-[#EDEAE1]">
          {activity.status === 'IN_PROGRESS' && (
            <>
              {/* Prominent Complete & Start Next button */}
              <button
                type="button"
                onClick={handleCompleteAndStartNextClick}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg bg-[#0C9349] hover:bg-[#0A7A3C] text-white flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                title="Complete current activity and immediately start next queued activity"
              >
                <FastForward className="w-4 h-4" />
                Complete & Start Next
              </button>

              <button
                type="button"
                onClick={() => setIsStopModalOpen(true)}
                disabled={isSubmitting}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-[#D97706] text-[#D97706] hover:bg-[#FFF3E0] flex items-center gap-1.5 transition cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                Stop Activity
              </button>

              <button
                type="button"
                onClick={() => setIsCompleteModalOpen(true)}
                disabled={isSubmitting}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-[#C9C4B6] text-[#14181A] hover:bg-[#F7F5F0] flex items-center gap-1.5 transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0C9349]" />
                Complete
              </button>

              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                disabled={isSubmitting}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#DC2626] hover:border-[#DC2626] transition cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </button>
            </>
          )}

          {activity.status === 'STOPPED' && (
            <>
              <button
                type="button"
                onClick={() => onResume(activity.id)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-xs font-bold rounded-lg bg-[#0C9349] hover:bg-[#0A7A3C] text-white flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Play className="w-4 h-4" />
                Resume Activity
              </button>

              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                disabled={isSubmitting}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-[#E5E7EB] text-[#DC2626] hover:bg-red-50 transition cursor-pointer"
              >
                Cancel Activity
              </button>
            </>
          )}

          {(activity.status === 'READY' || activity.status === 'PLANNED') && (
            <button
              type="button"
              onClick={() => onStart(activity.id)}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-xs font-bold rounded-lg bg-[#0C9349] hover:bg-[#0A7A3C] text-white flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Play className="w-4 h-4" />
              Start Activity
            </button>
          )}

          {activity.status === 'BLOCKED' && (
            <button
              type="button"
              onClick={() => onOpenDetail?.(activity)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-[#DC2626] text-[#DC2626] hover:bg-red-50 flex items-center gap-2 transition cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              Review Blockers / Override
            </button>
          )}
        </div>
      )}

      {/* STOP MODAL */}
      <Modal
        isOpen={isStopModalOpen}
        onClose={() => setIsStopModalOpen(false)}
        title="Stop Operational Activity"
        subtitle={`Temporarily halting ${activity.title} on ${vesselName}`}
      >
        <form onSubmit={handleConfirmStop} className="space-y-4">
          <div className="p-3 bg-[#FFF3E0] rounded-lg border border-[#FFE082] text-xs text-[#92400E]">
            Stopping this activity will record a stoppage event in the audit trail and dynamically shift downstream schedule forecasts.
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14181A] mb-1">
              Reason for Stoppage <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={stopReason}
              onChange={(e) => setStopReason(e.target.value)}
              placeholder="e.g. Silo line valve gasket maintenance, weather hold, power outage"
              className="w-full px-3 py-2 text-xs border border-[#C9C4B6] rounded-lg focus:outline-hidden focus:border-[#0C9349]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A6764] mb-1">
              Operational Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={stopNotes}
              onChange={(e) => setStopNotes(e.target.value)}
              placeholder="Provide technician or terminal context..."
              className="w-full px-3 py-2 text-xs border border-[#C9C4B6] rounded-lg focus:outline-hidden focus:border-[#0C9349]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <button
              type="button"
              onClick={() => setIsStopModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#C9C4B6] text-[#5A6764] hover:bg-[#F7F5F0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !stopReason.trim()}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white"
            >
              Confirm Stop
            </button>
          </div>
        </form>
      </Modal>

      {/* COMPLETE MODAL */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title="Complete Operational Activity"
        subtitle={`Marking ${activity.title} as completed`}
      >
        <form onSubmit={handleConfirmComplete} className="space-y-4">
          <div className="p-3 bg-[#E8F5E9] rounded-lg border border-[#A5D6A7] text-xs text-[#0C9349]">
            Completing this activity will set progress to 100%, record completion time, and automatically unlock any downstream tasks that depend on it.
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14181A] mb-1">
              Completion Notes / Handover Remarks
            </label>
            <textarea
              rows={3}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="e.g. Lines cleared, valves secured, sounding verified by chief officer."
              className="w-full px-3 py-2 text-xs border border-[#C9C4B6] rounded-lg focus:outline-hidden focus:border-[#0C9349]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <button
              type="button"
              onClick={() => setIsCompleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#C9C4B6] text-[#5A6764] hover:bg-[#F7F5F0]"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-[#0C9349] hover:bg-[#0A7A3C] text-white"
            >
              Confirm Complete
            </button>
          </div>
        </form>
      </Modal>

      {/* CANCEL MODAL */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Operational Activity"
        subtitle={`Cancelling ${activity.title}`}
      >
        <form onSubmit={handleConfirmCancel} className="space-y-4">
          <div className="p-3 bg-[#FEE2E2] rounded-lg border border-[#FECACA] text-xs text-[#DC2626]">
            Are you sure you want to cancel this activity? Cancelled activities cannot be resumed.
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14181A] mb-1">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Berth change, cargo diversion, order retracted"
              className="w-full px-3 py-2 text-xs border border-[#C9C4B6] rounded-lg focus:outline-hidden focus:border-[#0C9349]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#C9C4B6] text-[#5A6764] hover:bg-[#F7F5F0]"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !cancelReason.trim()}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white"
            >
              Cancel Activity
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
