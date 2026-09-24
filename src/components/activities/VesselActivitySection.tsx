import React, { useState } from 'react';
import { VesselActivity, ActivityConflictResolution } from '../../types';
import { CurrentActivityCard } from './CurrentActivityCard';
import { NextActivityCard } from './NextActivityCard';
import { ActivityPlanList } from './ActivityPlanList';
import { ActivityDetailModal } from './ActivityDetailModal';
import { AddActivityModal } from './AddActivityModal';
import { ConflictResolutionModal } from './ConflictResolutionModal';
import { useAppData } from '../../hooks/useAppData';

interface VesselActivitySectionProps {
  vesselId: string;
  vesselName: string;
  canEdit?: boolean;
}

export function VesselActivitySection({
  vesselId,
  vesselName,
  canEdit = true,
}: VesselActivitySectionProps) {
  const { activities, api } = useAppData();

  const [selectedActivity, setSelectedActivity] = useState<VesselActivity | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Concurrency conflict modal state
  const [conflictData, setConflictData] = useState<{
    targetActivity: VesselActivity;
    currentActivity: VesselActivity;
  } | null>(null);

  // Vessel activities sorted by sequence
  const vesselActivities = (activities || [])
    .filter((a) => a.vesselId === vesselId)
    .sort((a, b) => a.sequenceNo - b.sequenceNo);

  // Identify current active activity:
  // 1) First primary activity that is IN_PROGRESS or STOPPED
  // 2) Or if none, the first support activity IN_PROGRESS
  const currentActivity =
    vesselActivities.find(
      (a) => a.executionMode === 'PRIMARY' && (a.status === 'IN_PROGRESS' || a.status === 'STOPPED')
    ) ||
    vesselActivities.find(
      (a) => a.status === 'IN_PROGRESS' || a.status === 'STOPPED'
    );

  // Identify next queued activity:
  // First READY or PLANNED primary activity after current
  const nextActivity = vesselActivities.find((a) => {
    if (a.id === currentActivity?.id) return false;
    if (a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'SKIPPED') return false;
    if (currentActivity && a.sequenceNo <= currentActivity.sequenceNo) return false;
    return a.executionMode === 'PRIMARY' && (a.status === 'READY' || a.status === 'PLANNED' || a.status === 'BLOCKED');
  });

  // Action handlers calling api
  const handleStartActivity = async (
    activityId: string,
    options?: { startedAt?: string; resolution?: ActivityConflictResolution }
  ) => {
    const res = await api.startActivity(activityId, options);
    if (res.conflict) {
      const target = vesselActivities.find((a) => a.id === activityId);
      if (target) {
        setConflictData({
          targetActivity: target,
          currentActivity: res.conflict.currentActivity,
        });
      }
    }
  };

  const handleStopActivity = async (activityId: string, reason: string, notes?: string) => {
    await api.stopActivity(activityId, reason, notes);
  };

  const handleResumeActivity = async (activityId: string, notes?: string) => {
    await api.resumeActivity(activityId, notes);
  };

  const handleCompleteActivity = async (
    activityId: string,
    options?: { actualEnd?: string; completionNotes?: string }
  ) => {
    await api.completeActivity(activityId, options);
  };

  const handleCancelActivity = async (activityId: string, reason: string, notes?: string) => {
    await api.cancelActivity(activityId, reason, notes);
  };

  const handleSkipActivity = async (activityId: string, reason: string, notes?: string) => {
    await api.skipActivity(activityId, reason, notes);
  };

  const handleOverrideDependency = async (activityId: string, reason: string, notes?: string) => {
    await api.overrideActivityDependency(activityId, reason, notes);
  };

  const handleCompleteAndStartNext = async (activityId: string, completionNotes?: string) => {
    await api.completeAndStartNextActivity(activityId, completionNotes);
  };

  const handleMoveActivity = async (activityId: string, direction: 'UP' | 'DOWN') => {
    await api.moveActivity(activityId, direction);
  };

  const handleAddActivity = async (newActivity: Partial<VesselActivity>) => {
    await api.addActivity({
      ...newActivity,
      vesselId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top 2 Cards: Current Activity & Next Queued Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CurrentActivityCard
          activity={currentActivity}
          vesselName={vesselName}
          onStart={handleStartActivity}
          onStop={handleStopActivity}
          onResume={handleResumeActivity}
          onComplete={handleCompleteActivity}
          onCancel={handleCancelActivity}
          onCompleteAndStartNext={handleCompleteAndStartNext}
          onOpenDetail={(act) => setSelectedActivity(act)}
          canEdit={canEdit}
        />

        <NextActivityCard
          activity={nextActivity}
          vesselName={vesselName}
          onStart={handleStartActivity}
          onOpenDetail={(act) => setSelectedActivity(act)}
          canEdit={canEdit}
        />
      </div>

      {/* Full Operational Sequence List */}
      <ActivityPlanList
        activities={vesselActivities}
        vesselName={vesselName}
        onSelectActivity={(act) => setSelectedActivity(act)}
        onMoveActivity={handleMoveActivity}
        onStartActivity={handleStartActivity}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        canEdit={canEdit}
      />

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        allActivities={vesselActivities}
        isOpen={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
        onStart={handleStartActivity}
        onStop={handleStopActivity}
        onResume={handleResumeActivity}
        onComplete={handleCompleteActivity}
        onCancel={handleCancelActivity}
        onSkip={handleSkipActivity}
        onOverrideDependency={handleOverrideDependency}
        canEdit={canEdit}
      />

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        vesselId={vesselId}
        vesselName={vesselName}
        existingActivities={vesselActivities}
        onAdd={handleAddActivity}
      />

      {/* Concurrency Conflict Resolution Modal */}
      {conflictData && (
        <ConflictResolutionModal
          isOpen={Boolean(conflictData)}
          onClose={() => setConflictData(null)}
          targetActivity={conflictData.targetActivity}
          currentActivity={conflictData.currentActivity}
          vesselName={vesselName}
          onResolve={async (resolution) => {
            await handleStartActivity(conflictData.targetActivity.id, { resolution });
          }}
        />
      )}
    </div>
  );
}
