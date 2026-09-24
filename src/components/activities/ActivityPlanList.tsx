import React, { useState } from 'react';
import { VesselActivity, ActivityStatus, ActivityExecutionMode } from '../../types';
import { ActivityStatusBadge, ExecutionModeBadge, PriorityBadge } from './ActivityStatusBadge';
import { formatDateTime } from '../../lib/format';
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Play,
  CheckCircle2,
  Pause,
  AlertCircle,
  MoreVertical,
  Clock,
  Layers,
  MapPin,
  ShieldAlert,
} from 'lucide-react';

interface ActivityPlanListProps {
  activities: VesselActivity[];
  vesselName: string;
  onSelectActivity: (activity: VesselActivity) => void;
  onMoveActivity?: (activityId: string, direction: 'UP' | 'DOWN') => Promise<void>;
  onStartActivity?: (activityId: string) => Promise<void>;
  onOpenAddModal?: () => void;
  canEdit?: boolean;
}

type FilterOption = 'ALL' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'PRIMARY' | 'SUPPORT';

export function ActivityPlanList({
  activities,
  vesselName,
  onSelectActivity,
  onMoveActivity,
  onStartActivity,
  onOpenAddModal,
  canEdit = true,
}: ActivityPlanListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('ALL');

  const filtered = activities.filter((act) => {
    if (activeFilter === 'ACTIVE') {
      return act.status === 'IN_PROGRESS' || act.status === 'STOPPED';
    }
    if (activeFilter === 'UPCOMING') {
      return act.status === 'READY' || act.status === 'PLANNED' || act.status === 'BLOCKED';
    }
    if (activeFilter === 'COMPLETED') {
      return act.status === 'COMPLETED' || act.status === 'SKIPPED' || act.status === 'CANCELLED';
    }
    if (activeFilter === 'PRIMARY') {
      return act.executionMode === 'PRIMARY';
    }
    if (activeFilter === 'SUPPORT') {
      return act.executionMode === 'SUPPORT';
    }
    return true;
  });

  return (
    <div className="bg-white border border-[#E1DED4] rounded-xl p-5 shadow-xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDEAE1]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0C9349]" />
            <h2 className="text-sm font-bold text-[#14181A] uppercase tracking-wide">
              Operational Activity Sequence
            </h2>
            <span className="text-xs bg-[#EDEAE1] text-[#4F5B58] px-2 py-0.5 rounded-full font-bold">
              {activities.length} tasks
            </span>
          </div>
          <p className="text-xs text-[#5A6764] mt-0.5">
            Full operational lifecycle and dependency plan for {vesselName}
          </p>
        </div>

        {canEdit && onOpenAddModal && (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#0C9349] hover:bg-[#0A7A3C] text-white flex items-center gap-1.5 shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Activity
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED', 'PRIMARY', 'SUPPORT'] as FilterOption[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveFilter(tab)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
              activeFilter === tab
                ? 'bg-[#14181A] text-white'
                : 'bg-[#FAF9F5] text-[#5A6764] hover:bg-[#EDEAE1]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="divide-y divide-[#EDEAE1] border border-[#EDEAE1] rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#7A8784]">
            No activities match the selected filter.
          </div>
        ) : (
          filtered.map((act, index) => {
            const isFirst = index === 0;
            const isLast = index === filtered.length - 1;
            const isActionable = act.status === 'READY';

            return (
              <div
                key={act.id}
                className={`p-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF9F5] transition ${
                  act.status === 'IN_PROGRESS'
                    ? 'bg-[#F0FDF4]/50 border-l-4 border-l-[#0C9349]'
                    : act.status === 'STOPPED'
                    ? 'bg-[#FFFBEB]/50 border-l-4 border-l-[#D97706]'
                    : act.status === 'BLOCKED'
                    ? 'bg-red-50/30 border-l-4 border-l-[#DC2626]'
                    : ''
                }`}
              >
                {/* Left: Sequence No, Reordering Arrows & Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Reorder Buttons (only for non-completed) */}
                  {canEdit && onMoveActivity && act.status !== 'COMPLETED' ? (
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveActivity(act.id, 'UP');
                        }}
                        disabled={isFirst}
                        className="p-0.5 rounded text-[#7A8784] hover:text-[#14181A] disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveActivity(act.id, 'DOWN');
                        }}
                        disabled={isLast}
                        className="p-0.5 rounded text-[#7A8784] hover:text-[#14181A] disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="w-5 text-center text-xs font-mono font-bold text-[#7A8784] shrink-0">
                      #{act.sequenceNo}
                    </span>
                  )}

                  {/* Info */}
                  <div
                    onClick={() => onSelectActivity(act)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#14181A] hover:text-[#0C9349] transition">
                        {act.title}
                      </span>
                      <ExecutionModeBadge mode={act.executionMode} />
                      <PriorityBadge priority={act.priority} />
                      {act.status === 'IN_PROGRESS' && act.progressPct !== undefined && (
                        <span className="text-[11px] font-bold font-mono text-[#0C9349]">
                          ({act.progressPct}%)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#5A6764]">
                      {act.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#7A8784]" />
                          {act.location}
                        </span>
                      )}
                      <span>
                        Est: {Math.round((act.estimatedDurationMinutes || 120) / 60 * 10) / 10}h
                      </span>
                      {act.blockerReason && (
                        <span className="text-[#DC2626] font-medium flex items-center gap-1 truncate max-w-xs">
                          <ShieldAlert className="w-3 h-3 shrink-0" />
                          {act.blockerReason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status Badge & Quick Action Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <ActivityStatusBadge status={act.status} />

                  {canEdit && isActionable && onStartActivity && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartActivity(act.id);
                      }}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#0C9349] hover:bg-[#0A7A3C] text-white flex items-center gap-1 shadow-xs cursor-pointer transition"
                    >
                      <Play className="w-3 h-3" />
                      Start
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectActivity(act)}
                    className="p-1.5 text-xs font-semibold text-[#5A6764] hover:text-[#14181A] hover:bg-[#EDEAE1] rounded-lg transition cursor-pointer"
                    title="View Full Details"
                  >
                    Details →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
