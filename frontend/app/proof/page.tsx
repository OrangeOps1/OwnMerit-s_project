"use client";

// ============================================================
// OwnMerit - Tasks / Proof Page
// View all tasks and upload proof
// ============================================================

import { useState } from "react";
import { BottomNavigation, TopBar } from "@/components/ui/Navigation";
import { ProofUploader } from "@/components/proof/ProofUploader";
import { MOCK_TASKS } from "@/lib/mockData";
import type { Task } from "@/lib/types";
import { CheckCircle2, Clock, ListFilter } from "lucide-react";

export default function ProofPage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const handleComplete = (taskId: string, proofUrl: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "completed" as const,
              proofUrl,
              completedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return t.status === "pending";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar title="Today's Tasks" />

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Summary */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <span className="flex items-center gap-1.5 text-success font-semibold">
            <CheckCircle2 size={16} />
            {completedCount} done
          </span>
          <span className="flex items-center gap-1.5 text-text-secondary font-semibold">
            <Clock size={16} />
            {pendingCount} remaining
          </span>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {[
            { key: "all" as const, label: "All Tasks", count: tasks.length },
            { key: "pending" as const, label: "To Do", count: pendingCount },
            { key: "completed" as const, label: "Done", count: completedCount },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filter === f.key
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-secondary hover:bg-primary-light"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 size={48} className="text-success mx-auto mb-3" />
              <p className="text-lg font-bold text-text-primary">
                All done for today!
              </p>
              <p className="text-text-muted mt-1">
                Great work. Check back tomorrow.
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="page-transition">
                <ProofUploader task={task} onComplete={handleComplete} />
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
