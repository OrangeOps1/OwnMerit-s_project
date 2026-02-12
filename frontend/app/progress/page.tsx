"use client";

// ============================================================
// OwnMerit - Progress / Reward Path Page
// ============================================================

import { BottomNavigation, TopBar } from "@/components/ui/Navigation";
import { RewardPath } from "@/components/progress/RewardPath";
import { MILESTONES } from "@/lib/constants";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getApiBaseUrl, getAuthHeader } from "@/lib/auth";
import { useEffect, useState } from "react";
import type { MeritProgress } from "@/lib/types";
import { Card } from "@/components/ui/Card";

const EMPTY_PROGRESS: MeritProgress = {
  currentPoints: 0,
  totalEarned: 0,
  level: 1,
  milestones: MILESTONES,
  weeklyHistory: [
    { day: "Mon", points: 0 },
    { day: "Tue", points: 0 },
    { day: "Wed", points: 0 },
    { day: "Thu", points: 0 },
    { day: "Fri", points: 0 },
    { day: "Sat", points: 0 },
    { day: "Sun", points: 0 },
  ],
};

export default function ProgressPage() {
  const { auth, checking } = useRequireAuth();
  const [progress, setProgress] = useState<MeritProgress>(EMPTY_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (checking) {
      return;
    }
    const load = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/progress/me`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });
        if (!response.ok) {
          throw new Error("Unable to load progress");
        }
        const data = (await response.json()) as {
          approved_submissions: number;
          pending_submissions: number;
          rejected_submissions: number;
          total_submissions: number;
        };

        const currentPoints = data.approved_submissions * 10 + data.pending_submissions * 2;
        const level = Math.max(1, Math.floor(currentPoints / 25) + 1);
        setProgress({
          currentPoints,
          totalEarned: currentPoints,
          level,
          milestones: MILESTONES.map((m) => ({
            ...m,
            achieved: currentPoints >= m.pointsRequired,
          })),
          weeklyHistory: [
            { day: "Mon", points: Math.min(currentPoints, 5) },
            { day: "Tue", points: Math.min(currentPoints, 8) },
            { day: "Wed", points: Math.min(currentPoints, 10) },
            { day: "Thu", points: Math.min(currentPoints, 12) },
            { day: "Fri", points: Math.min(currentPoints, 15) },
            { day: "Sat", points: Math.min(currentPoints, 7) },
            { day: "Sun", points: Math.min(currentPoints, 9) },
          ],
        });
      } catch (requestError) {
        const message =
          requestError instanceof Error ? requestError.message : "Unknown error";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [checking]);

  if (checking || !auth) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="max-w-lg mx-auto">
          <Card>
            <p className="text-text-secondary">Checking session...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar title="Your Progress" />

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading && (
          <Card className="mb-4">
            <p className="text-text-secondary">Loading progress...</p>
          </Card>
        )}
        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}
        <RewardPath progress={progress} />
      </div>

      <BottomNavigation />
    </div>
  );
}
