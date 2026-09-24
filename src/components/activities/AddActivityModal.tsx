import React, { useState } from 'react';
import {
  VesselActivity,
  ActivityType,
  ActivityExecutionMode,
  ActivityPriority,
} from '../../types';
import { Modal } from '../ui/Modal';
import { Plus } from 'lucide-react';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  vesselId: string;
  vesselName: string;
  existingActivities: VesselActivity[];
  onAdd: (activity: Partial<VesselActivity>) => Promise<void>;
}

const ACTIVITY_TYPE_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: 'VIGOR_BERTHING', label: 'VIGOR Berth Mooring & Preparation' },
  { value: 'VIGOR_UNLOADING', label: 'Unloading Bulk Cement at VIGOR' },
  { value: 'WAITING_FOR_VIGOR_BERTH', label: 'Waiting for VIGOR Berth (Anchorage)' },
  { value: 'FUEL', label: 'Fuel / MGO Bunkering' },
  { value: 'OUTBOUND_VOYAGE', label: 'Sailing to Manufacturer' },
  { value: 'MANUFACTURER_QUEUE', label: 'Manufacturer Queue & Berthing' },
  { value: 'MANUFACTURER_LOADING', label: 'Loading Cement at Manufacturer' },
  { value: 'RETURN_VOYAGE', label: 'Sailing to VIGOR Port' },
  { value: 'MAINTENANCE', label: 'Maintenance / Technical Repair' },
  { value: 'INSPECTION', label: 'Customs & Port Health Clearance' },
  { value: 'CREW_CHANGE', label: 'Crew Change / Provisions' },
  { value: 'MANUFACTURER_PAYMENT', label: 'Manufacturer Advance Payment (Support)' },
  { value: 'CUSTOM', label: 'Custom Operational Activity' },
];

export function AddActivityModal({
  isOpen,
  onClose,
  vesselId,
  vesselName,
  existingActivities,
  onAdd,
}: AddActivityModalProps) {
  const [title, setTitle] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('VIGOR_UNLOADING');
  const [executionMode, setExecutionMode] = useState<ActivityExecutionMode>('PRIMARY');
  const [priority, setPriority] = useState<ActivityPriority>('NORMAL');
  const [location, setLocation] = useState('Berth B01 · Zanzibar');
  const [durationHours, setDurationHours] = useState('4.0');
  const [description, setDescription] = useState('');
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [blocksNext, setBlocksNext] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-set title suggestion when activity type changes
  const handleTypeChange = (type: ActivityType) => {
    setActivityType(type);
    const opt = ACTIVITY_TYPE_OPTIONS.find((o) => o.value === type);
    if (opt && (!title || ACTIVITY_TYPE_OPTIONS.some((o) => o.label === title))) {
      setTitle(opt.label);
    }
  };

  const handleToggleDependency = (id: string) => {
    setSelectedDependencies((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const durMinutes = Math.max(15, Math.round(parseFloat(durationHours || '2') * 60));
      const end = new Date(now.getTime() + durMinutes * 60000).toISOString();

      const deps = selectedDependencies.map((depId) => {
        const p = existingActivities.find((a) => a.id === depId);
        return {
          id: `dep-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          activityId: '',
          dependsOnActivityId: depId,
          requiredStatus: 'COMPLETED' as const,
          dependsOnActivityTitle: p?.title || depId,
          createdAt: now.toISOString(),
        };
      });

      await onAdd({
        vesselId,
        title: title.trim(),
        activityType,
        executionMode,
        priority,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        estimatedDurationMinutes: durMinutes,
        plannedStart: now.toISOString(),
        plannedEnd: end,
        forecastStart: now.toISOString(),
        forecastEnd: end,
        blocksNext,
        dependencies: deps,
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
      title="Schedule Operational Activity"
      subtitle={`Create planned task for ${vesselName}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Activity Type & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#14181A] mb-1">
              Activity Type <span className="text-red-500">*</span>
            </label>
            <select
              value={activityType}
              onChange={(e) => handleTypeChange(e.target.value as ActivityType)}
              className="w-full px-3 py-2 text-xs border border-[#C9C4B6] rounded-lg bg-white focus:outline-hidden focus:border-[#0C9349]"
            >
              {ACTIVITY_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14181A] mb-1">
              Activity Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unloading Bulk Cement"
              className="w-full px-3 py-2 text-xs border border-[#C9C4B6] rounded-lg focus:outline-hidden focus:border-[#0C9349]"
            />
          </div>
        </div>

        {/* Execution Mode & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#14181A] mb-1">
              Execution Mode
            </label>
            <select
              value={executionMode}
              onChange={(e) => setExecutionMode(e.target.value as ActivityExecutionMode)}
              className="w-full px-3 py-2 text-xs border border-[#C9C4B6] rounded-lg bg-white focus:outline-hidden focus:border-[#0C9349]"
            >
              <option value="PRIMARY">PRIMARY (1 at a time)</option>
              <option value="SUPPORT">SUPPORT (Concurrent)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14181A] mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ActivityPriority)}
              className="w-full px-3 py-2 text-xs border border-[#C9C4B6] rounded-lg bg-white focus:outline-hidden focus:border-[#0C9349]"
            >
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14181A] mb-1">
              Est. Duration (Hrs)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#C9C4B6] rounded-lg focus:outline-hidden focus:border-[#0C9349]"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-[#14181A] mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Berth B01 · Zanzibar"
            className="w-full px-3 py-2 text-xs border border-[#C9C4B6] rounded-lg focus:outline-hidden focus:border-[#0C9349]"
          />
        </div>

        {/* Dependencies Multi-select */}
        {existingActivities.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-[#14181A] mb-1">
              Prerequisite Dependencies (Must Complete First)
            </label>
            <div className="max-h-36 overflow-y-auto border border-[#EDEAE1] rounded-lg p-2 space-y-1.5 bg-[#FAF9F5]">
              {existingActivities.map((act) => (
                <label
                  key={act.id}
                  className="flex items-center gap-2 text-xs text-[#14181A] cursor-pointer hover:bg-white p-1 rounded transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedDependencies.includes(act.id)}
                    onChange={() => handleToggleDependency(act.id)}
                    className="text-[#0C9349] focus:ring-[#0C9349] rounded"
                  />
                  <span className="font-semibold">Seq #{act.sequenceNo}</span>
                  <span>{act.title}</span>
                  <span className="text-[10px] text-[#7A8784]">({act.status})</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#14181A] mb-1">
            Description / Operational Notes
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detail operational procedure, contractor requirements, or cargo notes..."
            className="w-full px-3 py-2 text-xs border border-[#C9C4B6] rounded-lg focus:outline-hidden focus:border-[#0C9349]"
          />
        </div>

        {/* Checkbox: Blocks Next */}
        <label className="flex items-center gap-2 text-xs text-[#14181A] cursor-pointer">
          <input
            type="checkbox"
            checked={blocksNext}
            onChange={(e) => setBlocksNext(e.target.checked)}
            className="text-[#0C9349] focus:ring-[#0C9349] rounded"
          />
          <span>Blocks next sequential task until completed</span>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[#EDEAE1]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#C9C4B6] text-[#5A6764] hover:bg-[#F7F5F0]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-[#0C9349] hover:bg-[#0A7A3C] text-white flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add to Activity Plan
          </button>
        </div>
      </form>
    </Modal>
  );
}
