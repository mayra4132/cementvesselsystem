import React, { useState } from 'react';
import { VesselActivity, ActivityConflictResolution } from '../../types';
import { Modal } from '../ui/Modal';
import { AlertTriangle, CheckCircle2, Pause, XCircle } from 'lucide-react';
import { formatDateTime } from '../../lib/format';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetActivity: VesselActivity;
  currentActivity: VesselActivity;
  vesselName: string;
  onResolve: (resolution: ActivityConflictResolution) => Promise<void>;
}

export function ConflictResolutionModal({
  isOpen,
  onClose,
  targetActivity,
  currentActivity,
  vesselName,
  onResolve,
}: ConflictResolutionModalProps) {
  const [selectedAction, setSelectedAction] = useState<'COMPLETE' | 'STOP' | 'CANCEL'>('COMPLETE');
  const [reasonText, setReasonText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAction !== 'COMPLETE' && !reasonText.trim()) return;

    setIsSubmitting(true);
    try {
      await onResolve({
        action: selectedAction,
        reason: reasonText.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Primary Activity Conflict"
      subtitle={`Resolve active task before starting ${targetActivity.title}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Warning Banner */}
        <div className="p-3.5 bg-[#FFF3E0] border border-[#FFE082] rounded-xl flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#92400E] block">
              Active Primary Task Conflict
            </span>
            <p className="text-[#B45309] leading-relaxed">
              A vessel can only execute one <strong>PRIMARY</strong> activity at a time. Vessel <strong>{vesselName}</strong> currently has the following task active:
            </p>
          </div>
        </div>

        {/* Current Active Task Card */}
        <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#EDEAE1] space-y-1 text-xs">
          <div className="font-bold text-[#14181A] text-sm">{currentActivity.title}</div>
          <div className="text-[#5A6764]">
            Started at: <span className="font-mono font-medium">{formatDateTime(currentActivity.actualStart || currentActivity.plannedStart)}</span>
          </div>
          {currentActivity.progressPct !== undefined && (
            <div className="text-[#5A6764]">
              Current Progress: <span className="font-mono font-bold text-[#0C9349]">{currentActivity.progressPct}%</span>
            </div>
          )}
        </div>

        {/* Radio Choices */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-bold text-[#14181A]">
            Select resolution for the running activity:
          </label>

          {/* Option 1: Complete */}
          <label
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
              selectedAction === 'COMPLETE'
                ? 'border-[#0C9349] bg-[#E8F5E9]/30'
                : 'border-[#EDEAE1] bg-white hover:bg-[#FAF9F5]'
            }`}
          >
            <input
              type="radio"
              name="resolution_action"
              checked={selectedAction === 'COMPLETE'}
              onChange={() => setSelectedAction('COMPLETE')}
              className="mt-0.5 text-[#0C9349] focus:ring-[#0C9349]"
            />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-[#14181A] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0C9349]" />
                Mark as Completed
              </span>
              <p className="text-[#5A6764]">
                Sets current task to 100% and begins {targetActivity.title}.
              </p>
            </div>
          </label>

          {/* Option 2: Stop */}
          <label
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
              selectedAction === 'STOP'
                ? 'border-[#D97706] bg-[#FFF3E0]/40'
                : 'border-[#EDEAE1] bg-white hover:bg-[#FAF9F5]'
            }`}
          >
            <input
              type="radio"
              name="resolution_action"
              checked={selectedAction === 'STOP'}
              onChange={() => setSelectedAction('STOP')}
              className="mt-0.5 text-[#D97706] focus:ring-[#D97706]"
            />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-[#14181A] flex items-center gap-1.5">
                <Pause className="w-3.5 h-3.5 text-[#D97706]" />
                Stop Temporarily
              </span>
              <p className="text-[#5A6764]">
                Pauses current task with a stoppage reason so it can be resumed later.
              </p>
            </div>
          </label>

          {/* Option 3: Cancel */}
          <label
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
              selectedAction === 'CANCEL'
                ? 'border-[#DC2626] bg-[#FEE2E2]/30'
                : 'border-[#EDEAE1] bg-white hover:bg-[#FAF9F5]'
            }`}
          >
            <input
              type="radio"
              name="resolution_action"
              checked={selectedAction === 'CANCEL'}
              onChange={() => setSelectedAction('CANCEL')}
              className="mt-0.5 text-[#DC2626] focus:ring-[#DC2626]"
            />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-[#14181A] flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />
                Cancel Current Activity
              </span>
              <p className="text-[#5A6764]">
                Cancels current activity permanently and transitions directly to {targetActivity.title}.
              </p>
            </div>
          </label>
        </div>

        {/* Reason field (mandatory if STOP or CANCEL, optional if COMPLETE) */}
        <div>
          <label className="block text-xs font-semibold text-[#14181A] mb-1">
            {selectedAction === 'COMPLETE' ? 'Handover Remarks (Optional)' : 'Reason for Stoppage / Cancellation *'}
          </label>
          <input
            type="text"
            required={selectedAction !== 'COMPLETE'}
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            placeholder={
              selectedAction === 'COMPLETE'
                ? 'Handover completed cleanly...'
                : 'Specify reason for stopping/cancelling task...'
            }
            className="w-full px-3 py-2 text-xs border border-[#C9C4B6] rounded-lg focus:outline-hidden focus:border-[#0C9349]"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[#EDEAE1]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#C9C4B6] text-[#5A6764] hover:bg-[#F7F5F0]"
          >
            Abort
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (selectedAction !== 'COMPLETE' && !reasonText.trim())}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-[#0C9349] hover:bg-[#0A7A3C] text-white"
          >
            Resolve & Start Activity
          </button>
        </div>
      </form>
    </Modal>
  );
}
