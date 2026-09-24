import React from 'react';
import { ActivityStatus, ActivityExecutionMode, ActivityPriority } from '../../types';
import { CheckCircle2, Play, Pause, AlertOctagon, Clock, XCircle, SkipForward, ShieldAlert } from 'lucide-react';

export function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  switch (status) {
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#0C9349] border border-[#A5D6A7]">
          <span className="w-2 h-2 rounded-full bg-[#0C9349] animate-pulse" />
          IN PROGRESS
        </span>
      );
    case 'STOPPED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF3E0] text-[#D97706] border border-[#FFE082]">
          <Pause className="w-3 h-3 text-[#D97706]" />
          STOPPED
        </span>
      );
    case 'READY':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
          <Play className="w-3 h-3 text-[#0284C7]" />
          READY
        </span>
      );
    case 'BLOCKED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
          <ShieldAlert className="w-3 h-3 text-[#DC2626]" />
          BLOCKED
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
          <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
          COMPLETED
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">
          <XCircle className="w-3 h-3 text-[#6B7280]" />
          CANCELLED
        </span>
      );
    case 'SKIPPED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
          <SkipForward className="w-3 h-3 text-[#64748B]" />
          SKIPPED
        </span>
      );
    case 'PLANNED':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB]">
          <Clock className="w-3 h-3 text-[#9CA3AF]" />
          PLANNED
        </span>
      );
  }
}

export function ExecutionModeBadge({ mode }: { mode: ActivityExecutionMode }) {
  if (mode === 'PRIMARY') {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#14181A] text-white">
        Primary
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EDEAE1] text-[#4F5B58]">
      Support
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ActivityPriority }) {
  switch (priority) {
    case 'CRITICAL':
      return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">CRITICAL</span>;
    case 'HIGH':
      return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">HIGH</span>;
    case 'LOW':
      return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">LOW</span>;
    case 'NORMAL':
    default:
      return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">NORMAL</span>;
  }
}
