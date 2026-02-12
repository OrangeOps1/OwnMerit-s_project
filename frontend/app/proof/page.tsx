"use client";

// ============================================================
// OwnMerit - Tasks / Proof Page
// View all tasks and upload proof
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { BottomNavigation, TopBar } from "@/components/ui/Navigation";
import { ProofUploader } from "@/components/proof/ProofUploader";
import type { Task } from "@/lib/types";
import { CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getApiBaseUrl, getAuthHeader } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface ActivityRow {
  id: string;
  title: string;
  description: string;
  activity_type: "assigned" | "voluntary";
}

interface SubmissionRow {
  id: string;
  activity_id: string;
  status: "pending" | "approved" | "rejected";
  proof_image_url?: string | null;
}

export default function ProofPage() {
  const { auth, checking } = useRequireAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const apiBase = getApiBaseUrl();

  const loadTasks = useMemo(
    () => async () => {
      if (!auth) {
        return;
      }
      setLoading(true);
      setError("");
      try {
        const [activitiesResponse, submissionsResponse] = await Promise.all([
          fetch(`${apiBase}/activities`, {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
          }),
          fetch(`${apiBase}/submissions`, {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
          }),
        ]);

        if (!activitiesResponse.ok || !submissionsResponse.ok) {
          throw new Error("Unable to load activities");
        }

        const activitiesData = (await activitiesResponse.json()) as {
          items: ActivityRow[];
        };
        const submissionsData = (await submissionsResponse.json()) as {
          items: SubmissionRow[];
        };

        const latestByActivity = new Map<string, SubmissionRow>();
        for (const submission of submissionsData.items) {
          if (!latestByActivity.has(submission.activity_id)) {
            latestByActivity.set(submission.activity_id, submission);
          }
        }

        const mapped: Task[] = activitiesData.items.map((activity) => {
          const submission = latestByActivity.get(activity.id);
          return {
            id: activity.id,
            title: activity.title,
            description: activity.description || "Complete this activity",
            category: "chore",
            status: submission?.status === "approved" ? "completed" : "pending",
            meritPoints: 10,
            dueDate: new Date().toISOString().slice(0, 10),
            requiresProof: true,
            proofUrl: submission?.proof_image_url || undefined,
          };
        });
        setTasks(mapped);
      } catch (requestError) {
        const message =
          requestError instanceof Error ? requestError.message : "Unknown error";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [apiBase, auth]
  );

  useEffect(() => {
    if (checking) {
      return;
    }
    void loadTasks();
  }, [checking, loadTasks]);

  const handleComplete = async (taskId: string, proofUrl: string) => {
    try {
      const response = await fetch(`${apiBase}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          activity_id: taskId,
          proof_text: "Submitted from proof screen",
          proof_image_url: proofUrl || null,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to submit proof");
      }
      await loadTasks();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Unknown error";
      setError(message);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return t.status === "pending";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;

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
      <TopBar title="Today's Tasks" />

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading && (
          <Card className="mb-4">
            <p className="text-text-secondary">Loading activities...</p>
          </Card>
        )}
        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}
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
