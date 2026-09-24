export type ActivityExecutionMode = 'PRIMARY' | 'SUPPORT';

export type ActivityStatus =
  | 'PLANNED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'STOPPED'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'SKIPPED';

export type ActivityPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export type StandardActivityType =
  | 'WAITING_FOR_VIGOR_BERTH'
  | 'VIGOR_BERTHING'
  | 'VIGOR_UNLOADING'
  | 'VIGOR_POST_UNLOAD'
  | 'FUEL'
  | 'OUTBOUND_VOYAGE'
  | 'MANUFACTURER_PAYMENT'
  | 'MANUFACTURER_QUEUE'
  | 'WAITING_AT_MANUFACTURER'
  | 'MANUFACTURER_BERTHING'
  | 'MANUFACTURER_LOADING'
  | 'MANUFACTURER_DEPARTURE'
  | 'RETURN_VOYAGE'
  | 'VIGOR_ARRIVAL'
  | 'MAINTENANCE'
  | 'INSPECTION'
  | 'DOCUMENTATION'
  | 'CUSTOM';

export type ActivityType = StandardActivityType | string;

export interface ActivityDependency {
  id: string;
  activityId: string;
  dependsOnActivityId: string;
  requiredStatus: string;
  dependsOnActivityTitle?: string;
  createdAt: string;
}

export type ActivityEventType =
  | 'CREATED'
  | 'EDITED'
  | 'STARTED'
  | 'STOPPED'
  | 'RESUMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'SKIPPED'
  | 'BLOCKED'
  | 'UNBLOCKED'
  | 'REORDERED'
  | 'DEPENDENCY_OVERRIDDEN'
  | 'PROGRESS_UPDATED';

export interface VesselActivityEvent {
  id: string;
  activityId: string;
  vesselId: string;
  voyageId?: string;
  eventType: ActivityEventType;
  previousStatus?: string;
  newStatus: string;
  reason?: string;
  notes?: string;
  performedBy?: string;
  occurredAt: string;
}

export interface VesselActivity {
  id: string;
  vesselId: string;
  voyageId?: string;
  visitId?: string;
  berthId?: string;
  activityType: StandardActivityType | string;
  title: string;
  description?: string;
  executionMode: ActivityExecutionMode;
  status: ActivityStatus;
  sequenceNo: number;
  priority: ActivityPriority;
  location?: string;
  plannedStart?: string;
  plannedEnd?: string;
  forecastStart?: string;
  forecastEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  stoppedAt?: string;
  estimatedDurationMinutes?: number;
  progressPct?: number;
  blocksNext: boolean;
  linkedEntityType?: string;
  linkedEntityId?: string;
  stopReason?: string;
  cancellationReason?: string;
  completionNotes?: string;
  blockerReason?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  dependencies?: ActivityDependency[];
  events?: VesselActivityEvent[];
}

export interface ActivityConflictResolution {
  action: 'COMPLETE' | 'STOP' | 'CANCEL' | 'NONE';
  reason?: string;
  notes?: string;
}

export interface ActivityActionResponse {
  activity: VesselActivity;
  nextReadyActivities?: VesselActivity[];
  affectedActivities?: VesselActivity[];
  updatedVoyageStage?: string;
  conflict?: {
    currentActivity: VesselActivity;
    message: string;
  };
}
