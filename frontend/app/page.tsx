"use client";

// ============================================================
// OwnMerit - Home Screen
// Shows greeting, merit points, upcoming reminders as actionable cards
// ============================================================

import { BottomNavigation } from "@/components/ui/Navigation";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ReminderList } from "@/components/reminders/ActionableCard";
import { useReminders } from "@/hooks/useReminders";
import { useMeritPoints } from "@/hooks/useMeritPoints";
import { MOCK_REMINDERS, MOCK_MERIT_PROGRESS, MOCK_TASKS } from "@/lib/mockData";
import { MERIT_CONFIG } from "@/lib/constants";
import Link from "next/link";
import {
  Star,
  TrendingUp,
  Gift,
  ClipboardCheck,
  ChevronRight,
  Sun,
  Sparkles,
} from "lucide-react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const {
    reminders,
    dismissReminder,
    snoozeReminder,
  } = useReminders({ initialReminders: MOCK_REMINDERS });

  const { progress, progressPercentage, hasReachedVoucherThreshold, nextMilestone, pointsToNextMilestone } =
    useMeritPoints({
      currentPoints: MOCK_MERIT_PROGRESS.currentPoints,
      totalEarned: MOCK_MERIT_PROGRESS.totalEarned,
      level: MOCK_MERIT_PROGRESS.level,
      milestones: MOCK_MERIT_PROGRESS.milestones,
      weeklyHistory: MOCK_MERIT_PROGRESS.weeklyHistory,
    });

  const pendingTasks = MOCK_TASKS.filter((t) => t.status === "pending");

  const handleReminderAction = (id: string) => {
    dismissReminder(id);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white px-4 pt-8 pb-6 rounded-b-3xl">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Sun size={20} className="text-accent" />
            <span className="text-sm opacity-80">{getGreeting()}</span>
          </div>
          <h1 className="text-2xl font-bold">James</h1>

          {/* Merit Points Quick View */}
          <div className="mt-4 bg-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Merit Points</p>
                <p className="text-3xl font-bold flex items-center gap-2">
                  {progress.currentPoints}
                  <Star size={20} className="text-accent" />
                </p>
              </div>
              {hasReachedVoucherThreshold ? (
                <Link
                  href="/voucher"
                  className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  <Gift size={18} />
                  Claim Voucher
                </Link>
              ) : (
                <div className="text-right">
                  <p className="text-xs opacity-60">Next milestone</p>
                  <p className="text-sm font-semibold">
                    {pointsToNextMilestone} pts away
                  </p>
                </div>
              )}
            </div>
            <div className="mt-3">
              <ProgressBar
                value={progressPercentage}
                size="sm"
                color="accent"
              />
              <div className="flex justify-between text-xs opacity-60 mt-1">
                <span>0</span>
                <span>{MERIT_CONFIG.voucherThreshold} pts (E-Voucher)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-3">
        {/* Quick action cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link href="/proof" className="block">
            <Card
              hover
              padding="sm"
              className="text-center"
            >
              <ClipboardCheck
                size={24}
                className="text-primary mx-auto mb-1"
              />
              <p className="text-xs font-bold text-text-primary">
                {pendingTasks.length} Tasks
              </p>
              <p className="text-[10px] text-text-muted">Today</p>
            </Card>
          </Link>
          <Link href="/progress" className="block">
            <Card
              hover
              padding="sm"
              className="text-center"
            >
              <TrendingUp
                size={24}
                className="text-secondary mx-auto mb-1"
              />
              <p className="text-xs font-bold text-text-primary">Level {progress.level}</p>
              <p className="text-[10px] text-text-muted">Progress</p>
            </Card>
          </Link>
          <Link href="/voucher" className="block">
            <Card
              hover
              padding="sm"
              className="text-center"
            >
              <Gift size={24} className="text-accent mx-auto mb-1" />
              <p className="text-xs font-bold text-text-primary">
                {hasReachedVoucherThreshold ? "Ready!" : `${Math.round(progressPercentage)}%`}
              </p>
              <p className="text-[10px] text-text-muted">Rewards</p>
            </Card>
          </Link>
        </div>

        {/* Upcoming reminders */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Sparkles size={18} className="text-accent" />
              Your Day
            </h2>
            <span className="text-sm text-text-muted">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>

          <ReminderList
            reminders={reminders}
            onDismiss={dismissReminder}
            onSnooze={snoozeReminder}
            onAction={handleReminderAction}
          />
        </div>

        {/* Pending tasks preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-text-primary">
              Today&apos;s Tasks
            </h2>
            <Link
              href="/proof"
              className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline"
            >
              See all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="space-y-2">
            {pendingTasks.slice(0, 3).map((task) => (
              <Link href="/proof" key={task.id} className="block">
                <Card hover padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                      <ClipboardCheck
                        size={16}
                        className="text-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary text-sm">
                        {task.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        {task.dueTime} &middot; +{task.meritPoints} pts
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-text-muted" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
