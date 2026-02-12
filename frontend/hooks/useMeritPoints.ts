"use client";

// ============================================================
// OwnMerit - Merit Points Tracking Hook
// ============================================================

import { useState, useCallback, useMemo } from "react";
import type { MeritProgress, Task } from "@/lib/types";
import { MILESTONES, MERIT_CONFIG } from "@/lib/constants";

interface UseMeritPointsReturn {
  progress: MeritProgress;
  addPoints: (points: number) => void;
  completeTask: (task: Task) => void;
  hasReachedVoucherThreshold: boolean;
  pointsToNextMilestone: number;
  nextMilestone: (typeof MILESTONES)[0] | null;
  currentMilestone: (typeof MILESTONES)[0] | null;
  progressPercentage: number;
}

export function useMeritPoints(
  initial?: Partial<MeritProgress>
): UseMeritPointsReturn {
  const [progress, setProgress] = useState<MeritProgress>({
    currentPoints: initial?.currentPoints ?? 0,
    totalEarned: initial?.totalEarned ?? 0,
    level: initial?.level ?? 1,
    milestones: initial?.milestones ?? MILESTONES,
    weeklyHistory: initial?.weeklyHistory ?? [],
  });

  const addPoints = useCallback((points: number) => {
    setProgress((prev) => {
      const newCurrent = prev.currentPoints + points;
      const newTotal = prev.totalEarned + points;

      // Update milestones
      const updatedMilestones = prev.milestones.map((m) => ({
        ...m,
        achieved: m.pointsRequired <= newCurrent,
      }));

      // Calculate level
      const achievedCount = updatedMilestones.filter(
        (m) => m.achieved
      ).length;

      return {
        ...prev,
        currentPoints: newCurrent,
        totalEarned: newTotal,
        level: achievedCount + 1,
        milestones: updatedMilestones,
      };
    });
  }, []);

  const completeTask = useCallback(
    (task: Task) => {
      addPoints(task.meritPoints);
    },
    [addPoints]
  );

  const hasReachedVoucherThreshold = useMemo(
    () => progress.currentPoints >= MERIT_CONFIG.voucherThreshold,
    [progress.currentPoints]
  );

  const nextMilestone = useMemo(() => {
    return (
      progress.milestones.find((m) => !m.achieved) ?? null
    );
  }, [progress.milestones]);

  const currentMilestone = useMemo(() => {
    const achieved = progress.milestones.filter((m) => m.achieved);
    return achieved.length > 0 ? achieved[achieved.length - 1] : null;
  }, [progress.milestones]);

  const pointsToNextMilestone = useMemo(() => {
    if (!nextMilestone) return 0;
    return nextMilestone.pointsRequired - progress.currentPoints;
  }, [nextMilestone, progress.currentPoints]);

  const progressPercentage = useMemo(() => {
    return Math.min(
      (progress.currentPoints / MERIT_CONFIG.voucherThreshold) * 100,
      100
    );
  }, [progress.currentPoints]);

  return {
    progress,
    addPoints,
    completeTask,
    hasReachedVoucherThreshold,
    pointsToNextMilestone,
    nextMilestone,
    currentMilestone,
    progressPercentage,
  };
}
