"use client";

// ============================================================
// OwnMerit - Alarm/Reminder Logic Hook
// Handles recurring reminders and displays them as actionable items
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";
import type { Reminder, ReminderRecurrence } from "@/lib/types";

interface UseRemindersOptions {
  checkIntervalMs?: number; // How often to check for due reminders (default: 60s)
  initialReminders?: Reminder[];
}

interface UseRemindersReturn {
  reminders: Reminder[];
  activeReminders: Reminder[];
  upcomingReminders: Reminder[];
  overdueReminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, "id" | "isDismissed">) => void;
  removeReminder: (id: string) => void;
  dismissReminder: (id: string) => void;
  snoozeReminder: (id: string, minutes: number) => void;
  toggleReminder: (id: string) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  getNextOccurrence: (reminder: Reminder) => Date | null;
}

function generateId(): string {
  return `rem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseReminderDateTime(reminder: Reminder): Date {
  const [hours, minutes] = reminder.time.split(":").map(Number);
  const date = new Date(reminder.date);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getNextOccurrenceDate(
  reminder: Reminder,
  fromDate: Date = new Date()
): Date | null {
  const baseDate = parseReminderDateTime(reminder);

  if (!reminder.isActive) return null;

  switch (reminder.recurrence) {
    case "once":
      return baseDate > fromDate ? baseDate : null;

    case "daily": {
      const next = new Date(fromDate);
      next.setHours(baseDate.getHours(), baseDate.getMinutes(), 0, 0);
      if (next <= fromDate) next.setDate(next.getDate() + 1);
      return next;
    }

    case "weekdays": {
      const next = new Date(fromDate);
      next.setHours(baseDate.getHours(), baseDate.getMinutes(), 0, 0);
      if (next <= fromDate) next.setDate(next.getDate() + 1);
      // Skip weekends (0=Sun, 6=Sat)
      while (next.getDay() === 0 || next.getDay() === 6) {
        next.setDate(next.getDate() + 1);
      }
      return next;
    }

    case "weekly": {
      const next = new Date(fromDate);
      const targetDay = baseDate.getDay();
      next.setHours(baseDate.getHours(), baseDate.getMinutes(), 0, 0);
      while (next.getDay() !== targetDay || next <= fromDate) {
        next.setDate(next.getDate() + 1);
      }
      return next;
    }

    case "monthly": {
      const next = new Date(fromDate);
      next.setDate(baseDate.getDate());
      next.setHours(baseDate.getHours(), baseDate.getMinutes(), 0, 0);
      if (next <= fromDate) next.setMonth(next.getMonth() + 1);
      return next;
    }

    default:
      return null;
  }
}

export function useReminders(
  options: UseRemindersOptions = {}
): UseRemindersReturn {
  const { checkIntervalMs = 60000, initialReminders = [] } = options;
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Categorize reminders
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const activeReminders = reminders.filter((r) => {
    if (!r.isActive || r.isDismissed) return false;
    const reminderDate = parseReminderDateTime(r);
    const diffMs = reminderDate.getTime() - now.getTime();
    // Active: due within the next 30 minutes or past due today
    return (
      (r.date === todayStr && diffMs <= 30 * 60 * 1000 && diffMs > -60 * 60 * 1000) ||
      r.recurrence !== "once"
    );
  });

  const upcomingReminders = reminders.filter((r) => {
    if (!r.isActive || r.isDismissed) return false;
    const reminderDate = parseReminderDateTime(r);
    return reminderDate.getTime() - now.getTime() > 30 * 60 * 1000;
  });

  const overdueReminders = reminders.filter((r) => {
    if (!r.isActive || r.isDismissed) return false;
    const reminderDate = parseReminderDateTime(r);
    return (
      r.date === todayStr &&
      reminderDate.getTime() < now.getTime() - 60 * 60 * 1000
    );
  });

  // Check for due reminders periodically
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // Trigger re-render to re-categorize reminders
      setReminders((prev) => [...prev]);
    }, checkIntervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkIntervalMs]);

  const addReminder = useCallback(
    (reminder: Omit<Reminder, "id" | "isDismissed">) => {
      const newReminder: Reminder = {
        ...reminder,
        id: generateId(),
        isDismissed: false,
      };
      setReminders((prev) => [...prev, newReminder]);
    },
    []
  );

  const removeReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const dismissReminder = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isDismissed: true } : r))
    );
  }, []);

  const snoozeReminder = useCallback((id: string, minutes: number) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const newTime = new Date();
        newTime.setMinutes(newTime.getMinutes() + minutes);
        const hours = String(newTime.getHours()).padStart(2, "0");
        const mins = String(newTime.getMinutes()).padStart(2, "0");
        return {
          ...r,
          time: `${hours}:${mins}`,
          date: newTime.toISOString().split("T")[0],
          isDismissed: false,
        };
      })
    );
  }, []);

  const toggleReminder = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  }, []);

  const updateReminder = useCallback(
    (id: string, updates: Partial<Reminder>) => {
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
    },
    []
  );

  const getNextOccurrence = useCallback(
    (reminder: Reminder): Date | null => {
      return getNextOccurrenceDate(reminder);
    },
    []
  );

  return {
    reminders,
    activeReminders,
    upcomingReminders,
    overdueReminders,
    addReminder,
    removeReminder,
    dismissReminder,
    snoozeReminder,
    toggleReminder,
    updateReminder,
    getNextOccurrence,
  };
}
