import React from 'react';
import { VesselActivity } from '../../types';
import { ActivityStatusBadge, ExecutionModeBadge, PriorityBadge } from './ActivityStatusBadge';
import { formatDateTime } from '../../lib/format';
import { Calendar, Clock, Play, ShieldAlert, ArrowRight, MapPin } from 'lucide-react';

interface NextActivityCardProps {
  activity?: VesselActivity;
  vesselName: string;
  onStart?: (activityId: string) => Promise<void>;
  onOpenDetail?: (activity: VesselActivity) => void;
  canEdit?: boolean;
}

export function NextActivityCard({
  activity,
  vesselName,
  onStart,
  onOpenDetail,
  canEdit = true,
}: NextActivityCardProps) {
  if (!activity) {
    return (
      <div className="bg-white border border-[#E1DED4] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E1DED4]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A6764]">
            Next Queued Activity
          </h2>
          <span className="text-xs text-[#7A8784]">Plan Complete</span>
        </div>
        <div className="py-6 text-center text-sm text-[#7A8784]">
          No upcoming scheduled tasks remaining for {vesselName}.
        </div>
      </div>
    );
  }

  const isReady = activity.status === 'READY';
  const isBlocked = activity.status === 'BLOCKED';

  return (
    <div className="bg-white border border-[#E1DED4] hover:border-[#C9C4B6] transition-colors rounded-xl p-5 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#EDEAE1]">
        <div className="flex items-center gap-2">
          <ArrowRight className="w-3.5 h-3.5 text-[#0C9349]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#14181A]">
            Next Queued Activity
          </h2>
          <ExecutionModeBadge mode={activity.executionMode} />
          <PriorityBadge priority={activity.priority} />
        </div>
        <ActivityStatusBadge status={activity.status} />
      </div>

      {/* Title & Location */}
      <div className="flex items-baseline justify-between gap-3">
        <h3
          onClick={() => onOpenDetail?.(activity)}
          className="text-base sm:text-lg font-bold text-[#14181A] hover:text-[#0C9349] cursor-pointer transition-colors"
        >
          {activity.title}
        </h3>
        {activity.location && (
          <span className="text-xs text-[#5A6764] flex items-center gap-1 shrink-0 font-medium">
            <MapPin className="w-3 h-3 text-[#7A8784]" />
            {activity.location}
          </span>
        )}
      </div>

      {activity.description && (
        <p className="text-xs text-[#5A6764] line-clamp-2 leading-relaxed">
          {activity.description}
        </p>
      )}

      {/* Blocker alert if blocked */}
      {isBlocked && (
        <div className="p-2.5 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#DC2626]">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            Blocked by Prerequisites
          </div>
          <p className="text-[#991B1B] text-[11px] leading-tight">
            {activity.blockerReason || 'Waiting on preceding operational dependencies'}
          </p>
        </div>
      )}

      {/* Schedule Info */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF9F5] p-2.5 rounded-lg border border-[#EDEAE1]">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#7A8784] block">Forecast Start</span>
          <span className="font-semibold text-[#14181A] font-mono text-xs">
            {activity.forecastStart
              ? formatDateTime(activity.forecastStart)
              : activity.plannedStart
              ? formatDateTime(activity.plannedStart)
              : 'TBD'}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-[#7A8784] block">Est. Duration</span>
          <span className="font-semibold text-[#14181A] font-mono text-xs">
            {Math.round((activity.estimatedDurationMinutes || 120) / 60 * 10) / 10} hrs
          </span>
        </div>
      </div>

      {/* Action footer */}
      {canEdit && (
        <div className="pt-2 flex items-center justify-between border-t border-[#EDEAE1]">
          <button
            type="button"
            onClick={() => onOpenDetail?.(activity)}
            className="text-xs font-semibold text-[#5A6764] hover:text-[#14181A] cursor-pointer"
          >
            View Details →
          </button>

          {isReady && onStart && (
            <button
              type="button"
              onClick={() => onStart(activity.id)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#0C9349] hover:bg-[#0A7A3C] text-white flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              Start Activity Now
            </button>
          )}

          {isBlocked && (
            <button
              type="button"
              onClick={() => onOpenDetail?.(activity)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#DC2626] text-[#DC2626] hover:bg-red-50 flex items-center gap-1.5 transition cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              View Blocker
            </button>
          )}
        </div>
      )}
    </div>
  );
}
