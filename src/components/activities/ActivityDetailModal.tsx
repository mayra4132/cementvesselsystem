import React, { useState } from 'react';
import { VesselActivity, ActivityStatus } from '../../types';
import { Modal } from '../ui/Modal';
import { ActivityStatusBadge, ExecutionModeBadge, PriorityBadge } from './ActivityStatusBadge';
import { formatDateTime } from '../../lib/format';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  XCircle,
  SkipForward,
  User,
  History,
  Unlock,
} from 'lucide-react';

interface ActivityDetailModalProps {
  activity: VesselActivity | null;
  allActivities: VesselActivity[];
  isOpen: boolean;
  onClose: () => void;
  onStart: (id: string) => Promise<void>;
  onStop: (id: string, reason: string) => Promise<void>;
  onResume: (id: string) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
  onCancel: (id: string, reason: string) => Promise<void>;
  onSkip: (id: string, reason: string) => Promise<void>;
  onOverrideDependency: (id: string, reason: string) => Promise<void>;
  canEdit?: boolean;
}

export function ActivityDetailModal({
  activity,
  allActivities,
  isOpen,
  onClose,
  onStart,
  onStop,
  onResume,
  onComplete,
  onCancel,
  onSkip,
  onOverrideDependency,
  canEdit = true,
}: ActivityDetailModalProps) {
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!activity) return null;

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onOverrideDependency(activity.id, overrideReason.trim());
      setShowOverrideForm(false);
      setOverrideReason('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find upstream dependency details
  const dependencyDetails = (activity.dependencies || []).map((dep) => {
    const parent = allActivities.find((a) => a.id === dep.dependsOnActivityId);
    return {
      ...dep,
      parentActivity: parent,
      isMet: parent && (parent.status === 'COMPLETED' || parent.status === 'SKIPPED'),
    };
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity.title}
      subtitle={`Seq #${activity.sequenceNo} · ${activity.activityType}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Header Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#FAF9F5] border border-[#EDEAE1] rounded-xl">
          <div className="flex items-center gap-2">
            <ExecutionModeBadge mode={activity.executionMode} />
            <PriorityBadge priority={activity.priority} />
            {activity.location && (
              <span className="text-xs text-[#5A6764] flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#7A8784]" />
                {activity.location}
              </span>
            )}
          </div>
          <ActivityStatusBadge status={activity.status} />
        </div>

        {/* Description */}
        {activity.description && (
          <div>
            <span className="text-xs font-bold text-[#14181A] block mb-1">Activity Scope</span>
            <p className="text-xs text-[#5A6764] leading-relaxed bg-[#F7F5F0] p-3 rounded-lg border border-[#EDEAE1]">
              {activity.description}
            </p>
          </div>
        )}

        {/* Progress & Blocker notices */}
        {activity.status === 'BLOCKED' && (
          <div className="p-3.5 bg-[#FEE2E2] border border-[#FECACA] rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#DC2626]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Operational Dependency Blocker
            </div>
            <p className="text-[#991B1B]">
              {activity.blockerReason || 'Waiting on required preceding activities to complete.'}
            </p>

            {canEdit && !showOverrideForm && (
              <button
                type="button"
                onClick={() => setShowOverrideForm(true)}
                className="mt-1 px-3 py-1.5 rounded-lg bg-white border border-[#DC2626] text-[#DC2626] font-bold text-xs hover:bg-red-50 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                Override Dependency Lock (Admin/Ops)
              </button>
            )}

            {showOverrideForm && (
              <form onSubmit={handleOverrideSubmit} className="pt-2 border-t border-[#FECACA] space-y-2">
                <label className="block text-xs font-bold text-[#991B1B]">
                  Reason for Dependency Override <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Master confirmed berthing cleared verbally by harbor control"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#DC2626] rounded-lg focus:outline-hidden"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOverrideForm(false)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded-lg text-gray-700 bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !overrideReason.trim()}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-[#DC2626] text-white hover:bg-red-700"
                  >
                    Confirm Override
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activity.status === 'STOPPED' && (
          <div className="p-3 bg-[#FFF3E0] border border-[#FFE082] rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#D97706]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Activity Stopped
            </div>
            <p className="text-[#92400E]">
              Reason: <strong>{activity.stopReason || 'No reason provided'}</strong>
            </p>
            {activity.stoppedAt && (
              <p className="text-[#B45309] text-[11px]">
                Halted at: {formatDateTime(activity.stoppedAt)}
              </p>
            )}
          </div>
        )}

        {/* Schedule & Timing Grid */}
        <div>
          <span className="text-xs font-bold text-[#14181A] block mb-2">Schedule & Execution Timestamps</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-[#FAF9F5] p-2.5 rounded-lg border border-[#EDEAE1]">
              <span className="text-[10px] font-bold text-[#7A8784] uppercase block">Planned Start</span>
              <span className="font-mono font-semibold text-[#14181A]">
                {activity.plannedStart ? formatDateTime(activity.plannedStart) : '—'}
              </span>
            </div>

            <div className="bg-[#FAF9F5] p-2.5 rounded-lg border border-[#EDEAE1]">
              <span className="text-[10px] font-bold text-[#7A8784] uppercase block">Forecast Start</span>
              <span className="font-mono font-semibold text-[#14181A]">
                {activity.forecastStart ? formatDateTime(activity.forecastStart) : '—'}
              </span>
            </div>

            <div className="bg-[#FAF9F5] p-2.5 rounded-lg border border-[#EDEAE1]">
              <span className="text-[10px] font-bold text-[#7A8784] uppercase block">Actual Start</span>
              <span className="font-mono font-bold text-[#0C9349]">
                {activity.actualStart ? formatDateTime(activity.actualStart) : '—'}
              </span>
            </div>

            <div className="bg-[#FAF9F5] p-2.5 rounded-lg border border-[#EDEAE1]">
              <span className="text-[10px] font-bold text-[#7A8784] uppercase block">Planned Finish</span>
              <span className="font-mono font-semibold text-[#14181A]">
                {activity.plannedEnd ? formatDateTime(activity.plannedEnd) : '—'}
              </span>
            </div>

            <div className="bg-[#FAF9F5] p-2.5 rounded-lg border border-[#EDEAE1]">
              <span className="text-[10px] font-bold text-[#7A8784] uppercase block">Forecast Finish</span>
              <span className="font-mono font-semibold text-[#14181A]">
                {activity.forecastEnd ? formatDateTime(activity.forecastEnd) : '—'}
              </span>
            </div>

            <div className="bg-[#FAF9F5] p-2.5 rounded-lg border border-[#EDEAE1]">
              <span className="text-[10px] font-bold text-[#7A8784] uppercase block">Actual Finish</span>
              <span className="font-mono font-bold text-[#0C9349]">
                {activity.actualEnd ? formatDateTime(activity.actualEnd) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Dependencies Section */}
        <div>
          <span className="text-xs font-bold text-[#14181A] block mb-2">Prerequisite Dependencies</span>
          {dependencyDetails.length === 0 ? (
            <div className="text-xs text-[#7A8784] italic bg-[#FAF9F5] p-2.5 rounded-lg border border-[#EDEAE1]">
              No prerequisite tasks defined. This activity can execute immediately when reached.
            </div>
          ) : (
            <div className="space-y-1.5">
              {dependencyDetails.map((dep, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-white border border-[#EDEAE1] rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2">
                    {dep.isMet ? (
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
                    )}
                    <span className="font-semibold text-[#14181A]">
                      {dep.dependsOnActivityTitle || dep.parentActivity?.title || dep.dependsOnActivityId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#7A8784]">Must be {dep.requiredStatus}</span>
                    {dep.parentActivity && (
                      <ActivityStatusBadge status={dep.parentActivity.status} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completion Notes */}
        {activity.completionNotes && (
          <div>
            <span className="text-xs font-bold text-[#14181A] block mb-1">Completion Notes</span>
            <div className="text-xs text-[#5A6764] bg-[#F0FDF4] p-3 rounded-lg border border-[#DCFCE7]">
              {activity.completionNotes}
            </div>
          </div>
        )}

        {/* Audit event history */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#14181A] mb-2">
            <History className="w-3.5 h-3.5 text-[#5A6764]" />
            Activity Audit Timeline
          </div>
          <div className="border border-[#EDEAE1] rounded-lg divide-y divide-[#EDEAE1] text-xs max-h-36 overflow-y-auto">
            <div className="p-2.5 flex items-center justify-between bg-[#FAF9F5]">
              <span className="text-[#5A6764]">Created by {activity.createdBy || 'Operations'}</span>
              <span className="font-mono text-[11px] text-[#7A8784]">{formatDateTime(activity.createdAt)}</span>
            </div>
            {activity.actualStart && (
              <div className="p-2.5 flex items-center justify-between bg-white">
                <span className="text-[#0C9349] font-medium">Activity Started</span>
                <span className="font-mono text-[11px] text-[#7A8784]">{formatDateTime(activity.actualStart)}</span>
              </div>
            )}
            {activity.stoppedAt && (
              <div className="p-2.5 flex items-center justify-between bg-[#FFF3E0]">
                <span className="text-[#D97706] font-medium">Stopped: {activity.stopReason}</span>
                <span className="font-mono text-[11px] text-[#7A8784]">{formatDateTime(activity.stoppedAt)}</span>
              </div>
            )}
            {activity.actualEnd && (
              <div className="p-2.5 flex items-center justify-between bg-[#F0FDF4]">
                <span className="text-[#16A34A] font-medium">Completed Successfully</span>
                <span className="font-mono text-[11px] text-[#7A8784]">{formatDateTime(activity.actualEnd)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-[#EDEAE1] flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#C9C4B6] text-[#5A6764] hover:bg-[#F7F5F0]"
          >
            Close
          </button>

          {canEdit && (
            <div className="flex items-center gap-2">
              {activity.status === 'READY' && (
                <button
                  type="button"
                  onClick={async () => {
                    await onStart(activity.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#0C9349] text-white hover:bg-[#0A7A3C] flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Activity
                </button>
              )}

              {activity.status === 'IN_PROGRESS' && (
                <button
                  type="button"
                  onClick={async () => {
                    await onComplete(activity.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#0C9349] text-white hover:bg-[#0A7A3C] flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Complete Activity
                </button>
              )}

              {(activity.status === 'PLANNED' || activity.status === 'READY') && (
                <button
                  type="button"
                  onClick={async () => {
                    await onSkip(activity.id, 'Skipped from detail view');
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  Skip
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
