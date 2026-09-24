/**
 * Activity API client for VIGOR Smart Port Operations
 * Wraps FastAPI / Express endpoints with full type safety
 */

import {
  VesselActivity,
  ActivityStatus,
  ActivityExecutionMode,
  ActivityConflictResolution,
  ActivityActionResponse,
} from '../types';
import { apiFetch, USE_MOCK_API } from './client';

export async function fetchActivities(filters?: {
  vesselId?: string;
  voyageId?: string;
  status?: ActivityStatus;
  executionMode?: ActivityExecutionMode;
  activityType?: string;
}): Promise<VesselActivity[]> {
  const params = new URLSearchParams();
  if (filters?.vesselId) params.append('vessel_id', filters.vesselId);
  if (filters?.voyageId) params.append('voyage_id', filters.voyageId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.executionMode) params.append('execution_mode', filters.executionMode);
  if (filters?.activityType) params.append('activity_type', filters.activityType);

  const query = params.toString();
  return apiFetch<VesselActivity[]>(`/activities${query ? `?${query}` : ''}`);
}

export async function fetchVesselActivities(vesselId: string): Promise<VesselActivity[]> {
  return apiFetch<VesselActivity[]>(`/vessels/${vesselId}/activities`);
}

export async function fetchActivityById(id: string): Promise<VesselActivity> {
  return apiFetch<VesselActivity>(`/activities/${id}`);
}

export async function createActivity(activity: Partial<VesselActivity>): Promise<VesselActivity> {
  return apiFetch<VesselActivity>('/activities', {
    method: 'POST',
    body: JSON.stringify(activity),
  });
}

export async function startActivity(
  id: string,
  options?: {
    startedAt?: string;
    resolution?: ActivityConflictResolution;
    overrideDependencyReason?: string;
  }
): Promise<ActivityActionResponse> {
  return apiFetch<ActivityActionResponse>(`/activities/${id}/start`, {
    method: 'POST',
    body: JSON.stringify({
      started_at: options?.startedAt,
      current_activity_resolution: options?.resolution,
      override_dependency_reason: options?.overrideDependencyReason,
    }),
  });
}

export async function stopActivity(
  id: string,
  reason: string,
  notes?: string
): Promise<VesselActivity> {
  return apiFetch<VesselActivity>(`/activities/${id}/stop`, {
    method: 'POST',
    body: JSON.stringify({ reason, notes }),
  });
}

export async function resumeActivity(id: string, notes?: string): Promise<VesselActivity> {
  return apiFetch<VesselActivity>(`/activities/${id}/resume`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}

export async function completeActivity(
  id: string,
  options?: { actualEnd?: string; completionNotes?: string }
): Promise<{ activity: VesselActivity; nextReadyActivities?: VesselActivity[] }> {
  return apiFetch<{ activity: VesselActivity; nextReadyActivities?: VesselActivity[] }>(
    `/activities/${id}/complete`,
    {
      method: 'POST',
      body: JSON.stringify({
        actual_end: options?.actualEnd,
        completion_notes: options?.completionNotes,
      }),
    }
  );
}

export async function cancelActivity(
  id: string,
  reason: string,
  notes?: string
): Promise<VesselActivity> {
  return apiFetch<VesselActivity>(`/activities/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ cancellation_reason: reason, reason, notes }),
  });
}

export async function skipActivity(
  id: string,
  reason: string,
  notes?: string
): Promise<VesselActivity> {
  return apiFetch<VesselActivity>(`/activities/${id}/skip`, {
    method: 'POST',
    body: JSON.stringify({ reason, notes }),
  });
}

export async function overrideDependency(
  id: string,
  reason: string,
  notes?: string
): Promise<ActivityActionResponse> {
  return apiFetch<ActivityActionResponse>(`/activities/${id}/override-dependency`, {
    method: 'POST',
    body: JSON.stringify({ reason, notes }),
  });
}

export async function moveActivity(id: string, direction: 'UP' | 'DOWN'): Promise<VesselActivity[]> {
  return apiFetch<VesselActivity[]>(`/activities/${id}/move`, {
    method: 'POST',
    body: JSON.stringify({ direction }),
  });
}

export async function completeAndStartNext(
  id: string,
  completionNotes?: string
): Promise<{ completedActivity: VesselActivity; nextStartedActivity?: VesselActivity }> {
  return apiFetch<{ completedActivity: VesselActivity; nextStartedActivity?: VesselActivity }>(
    `/activities/${id}/complete-and-start-next`,
    {
      method: 'POST',
      body: JSON.stringify({ completion_notes: completionNotes }),
    }
  );
}
