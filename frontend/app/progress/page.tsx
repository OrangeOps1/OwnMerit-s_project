"use client";

// ============================================================
// OwnMerit - Progress / Reward Path Page
// ============================================================

import { BottomNavigation, TopBar } from "@/components/ui/Navigation";
import { RewardPath } from "@/components/progress/RewardPath";
import { MOCK_MERIT_PROGRESS } from "@/lib/mockData";

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar title="Your Progress" />

      <div className="max-w-lg mx-auto px-4 py-4">
        <RewardPath progress={MOCK_MERIT_PROGRESS} />
      </div>

      <BottomNavigation />
    </div>
  );
}
