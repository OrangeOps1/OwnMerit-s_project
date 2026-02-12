"use client";

// ============================================================
// OwnMerit - Actionable Reminder Card
// Displayed on home screen as actionable items
// ============================================================

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Reminder, ReminderPriority } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/constants";
import {
  Clock,
  Bell,
  BellOff,
  CheckCircle2,
  AlarmClock,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

interface ActionableCardProps {
  reminder: Reminder;
  onDismiss?: (id: string) => void;
  onSnooze?: (id: string, minutes: number) => void;
  onAction?: (id: string) => void;
}

const priorityConfig: Record<
  ReminderPriority,
  { borderColor: string; bgColor: string; icon: React.ReactNode; label: string }
> = {
  low: {
    borderColor: "border-l-text-muted",
    bgColor: "",
    icon: <Bell size={16} className="text-text-muted" />,
    label: "",
  },
  medium: {
    borderColor: "border-l-primary",
    bgColor: "",
    icon: <Bell size={16} className="text-primary" />,
    label: "",
  },
  high: {
    borderColor: "border-l-warning",
    bgColor: "bg-warning-light/30",
    icon: <AlertTriangle size={16} className="text-warning" />,
    label: "Important",
  },
  urgent: {
    borderColor: "border-l-danger",
    bgColor: "bg-danger-light/30",
    icon: <AlertTriangle size={16} className="text-danger" />,
    label: "Urgent",
  },
};

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")}${period}`;
}

function getTimeUntil(time: string, date: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const target = new Date(date);
  target.setHours(hours, minutes, 0, 0);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs < 0) return "Overdue";
  if (diffMs < 60 * 1000) return "Now";
  if (diffMs < 60 * 60 * 1000) {
    const mins = Math.round(diffMs / (60 * 1000));
    return `In ${mins} min`;
  }
  const hrs = Math.round(diffMs / (60 * 60 * 1000));
  return `In ${hrs}h`;
}

export function ActionableCard({
  reminder,
  onDismiss,
  onSnooze,
  onAction,
}: ActionableCardProps) {
  const priority = priorityConfig[reminder.priority];
  const category = CATEGORY_CONFIG[reminder.category];
  const timeUntil = getTimeUntil(reminder.time, reminder.date);
  const isOverdue = timeUntil === "Overdue";
  const isSoon = timeUntil === "Now" || timeUntil.startsWith("In");

  return (
    <div
      className={`
        bg-surface rounded-2xl border border-border
        border-l-4 ${priority.borderColor}
        ${priority.bgColor}
        shadow-sm overflow-hidden
        transition-all duration-200
        ${reminder.isDismissed ? "opacity-50" : ""}
      `}
      role="article"
      aria-label={`Reminder: ${reminder.title}`}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Category icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${category.color}20` }}
            >
              {priority.icon}
            </div>

            <div className="flex-1 min-w-0">
              {/* Priority label */}
              {priority.label && (
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    reminder.priority === "urgent"
                      ? "text-danger"
                      : "text-warning"
                  }`}
                >
                  {priority.label}
                </span>
              )}

              {/* Title */}
              <h3 className="font-bold text-text-primary text-base">
                {reminder.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-text-secondary mt-0.5">
                {reminder.description}
              </p>

              {/* Time info */}
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary">
                  <Clock size={12} />
                  {formatTime(reminder.time)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold ${
                    isOverdue
                      ? "text-danger"
                      : isSoon
                      ? "text-accent"
                      : "text-text-muted"
                  }`}
                >
                  {isOverdue && <AlertTriangle size={12} />}
                  {timeUntil}
                </span>
                {reminder.recurrence !== "once" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                    <AlarmClock size={10} />
                    {reminder.recurrence}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {!reminder.isDismissed && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => onAction?.(reminder.id)}
            >
              <CheckCircle2 size={16} className="mr-1" />
              Done
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSnooze?.(reminder.id, 15)}
              aria-label="Snooze for 15 minutes"
            >
              <AlarmClock size={16} className="mr-1" />
              15min
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss?.(reminder.id)}
              aria-label="Dismiss reminder"
            >
              <BellOff size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// List of actionable cards
export function ReminderList({
  reminders,
  onDismiss,
  onSnooze,
  onAction,
}: {
  reminders: Reminder[];
  onDismiss?: (id: string) => void;
  onSnooze?: (id: string, minutes: number) => void;
  onAction?: (id: string) => void;
}) {
  const activeReminders = reminders.filter((r) => !r.isDismissed && r.isActive);

  if (activeReminders.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell size={40} className="text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary font-medium">All caught up!</p>
        <p className="text-sm text-text-muted mt-1">
          No reminders right now. Great job!
        </p>
      </div>
    );
  }

  // Sort: urgent first, then by time
  const sorted = [...activeReminders].sort((a, b) => {
    const priorityOrder: Record<string, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="space-y-3" role="list" aria-label="Reminders">
      {sorted.map((reminder) => (
        <div key={reminder.id} role="listitem">
          <ActionableCard
            reminder={reminder}
            onDismiss={onDismiss}
            onSnooze={onSnooze}
            onAction={onAction}
          />
        </div>
      ))}
    </div>
  );
}
