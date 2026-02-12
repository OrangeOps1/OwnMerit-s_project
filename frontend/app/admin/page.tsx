"use client";

import { useEffect, useState } from "react";
import { BottomNavigation, TopBar } from "@/components/ui/Navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  LayoutDashboard,
  ListChecks,
  Gift,
  ClipboardCheck,
  Plus,
  Trash2,
  Edit3,
  Save,
  RefreshCw,
  Shield,
} from "lucide-react";

type AdminTab = "overview" | "submissions" | "activities" | "rewards";
type ActivityType = "assigned" | "voluntary";

interface AdminDashboard {
  activities_count: number;
  submissions_pending: number;
  submissions_approved: number;
  submissions_rejected: number;
  rewards_assigned: number;
}

interface Submission {
  id: string;
  activity_id: string;
  user_id: string;
  proof_text: string;
  proof_image_url?: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  activity_type: ActivityType;
  assigned_to_user_id?: string | null;
  recurrence_text?: string | null;
  created_at: string;
}

interface Reward {
  reward_id: string;
  user_id: string;
  submission_id: string;
  voucher_code: string;
  status: string;
  assigned_at: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [activityForm, setActivityForm] = useState({
    title: "",
    description: "",
    activity_type: "assigned" as ActivityType,
    assigned_to_user_id: "",
    recurrence_text: "",
  });

  async function loadAdminData() {
    setLoading(true);
    setError("");
    try {
      const [dashboardData, submissionsData, activitiesData, rewardsData] =
        await Promise.all([
          apiRequest<AdminDashboard>("/admin/dashboard"),
          apiRequest<{ items: Submission[] }>("/admin/submissions"),
          apiRequest<{ items: Activity[] }>("/admin/activities"),
          apiRequest<{ items: Reward[] }>("/admin/rewards"),
        ]);
      setDashboard(dashboardData);
      setSubmissions(submissionsData.items);
      setActivities(activitiesData.items);
      setRewards(rewardsData.items);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Unknown error";
      setError(`Unable to load admin data: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAdminData();
  }, []);

  async function handleReview(
    submissionId: string,
    action: "approve" | "reject"
  ) {
    try {
      await apiRequest(`/admin/submissions/${submissionId}/${action}`, {
        method: "PATCH",
        body: JSON.stringify({
          feedback:
            action === "approve"
              ? "Approved by admin dashboard"
              : "Please resubmit with more proof details",
        }),
      });
      await loadAdminData();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Unknown error";
      setError(`Unable to ${action} submission: ${message}`);
    }
  }

  async function handleDeleteActivity(activityId: string) {
    try {
      await apiRequest(`/admin/activities/${activityId}`, { method: "DELETE" });
      if (editingActivityId === activityId) {
        setEditingActivityId(null);
      }
      await loadAdminData();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Unknown error";
      setError(`Unable to delete activity: ${message}`);
    }
  }

  function startEditActivity(activity: Activity) {
    setEditingActivityId(activity.id);
    setActivityForm({
      title: activity.title,
      description: activity.description || "",
      activity_type: activity.activity_type,
      assigned_to_user_id: activity.assigned_to_user_id || "",
      recurrence_text: activity.recurrence_text || "",
    });
    setActiveTab("activities");
  }

  function resetActivityForm() {
    setEditingActivityId(null);
    setActivityForm({
      title: "",
      description: "",
      activity_type: "assigned",
      assigned_to_user_id: "",
      recurrence_text: "",
    });
  }

  async function handleActivitySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activityForm.title.trim()) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: activityForm.title.trim(),
        description: activityForm.description.trim(),
        activity_type: activityForm.activity_type,
        assigned_to_user_id: activityForm.assigned_to_user_id.trim() || null,
        recurrence_text: activityForm.recurrence_text.trim() || null,
      };

      if (editingActivityId) {
        await apiRequest(`/admin/activities/${editingActivityId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/admin/activities", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetActivityForm();
      await loadAdminData();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Unknown error";
      setError(`Unable to save activity: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar title="Staff Dashboard" />

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Admin badge */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Shield size={16} className="text-primary" />
          <span className="font-semibold text-primary">Staff Access</span>
        </div>

        <div className="mb-4">
          <Button variant="outline" size="sm" onClick={() => void loadAdminData()}>
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </Button>
        </div>

        {/* Tab navigation */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { key: "overview" as const, label: "Overview", icon: LayoutDashboard },
            { key: "submissions" as const, label: "Submissions", icon: ClipboardCheck },
            { key: "activities" as const, label: "Activities", icon: ListChecks },
            { key: "rewards" as const, label: "Rewards", icon: Gift },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-primary text-white shadow-md"
                    : "bg-surface border border-border text-text-secondary hover:bg-primary-light"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {loading ? (
          <Card>
            <p className="text-text-secondary">Loading admin dashboard...</p>
          </Card>
        ) : (
          <div className="space-y-4 page-transition" key={activeTab}>
            {activeTab === "overview" && dashboard && (
              <div className="grid grid-cols-2 gap-3">
                <Card padding="sm">
                  <p className="text-xs text-text-muted">Activities</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {dashboard.activities_count}
                  </p>
                </Card>
                <Card padding="sm">
                  <p className="text-xs text-text-muted">Pending Reviews</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {dashboard.submissions_pending}
                  </p>
                </Card>
                <Card padding="sm">
                  <p className="text-xs text-text-muted">Approved</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {dashboard.submissions_approved}
                  </p>
                </Card>
                <Card padding="sm">
                  <p className="text-xs text-text-muted">Vouchers Assigned</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {dashboard.rewards_assigned}
                  </p>
                </Card>
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <Card padding="sm">
                    <p className="text-text-secondary">No submissions yet.</p>
                  </Card>
                ) : (
                  submissions.map((submission) => (
                    <Card key={submission.id} padding="sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-text-primary">
                          Submission {submission.id.slice(0, 8)}
                        </p>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary-light text-primary">
                          {submission.status}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-1">
                        User: {submission.user_id} | Activity: {submission.activity_id}
                      </p>
                      <p className="text-sm text-text-secondary mt-2">
                        {submission.proof_text || "No text proof provided."}
                      </p>
                      {submission.proof_image_url && (
                        <a
                          href={submission.proof_image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block mt-2 text-sm text-primary underline"
                        >
                          View image proof
                        </a>
                      )}
                      {submission.status === "pending" && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => void handleReview(submission.id, "approve")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => void handleReview(submission.id, "reject")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === "activities" && (
              <div className="space-y-4">
                <Card>
                  <h3 className="font-semibold text-text-primary mb-3">
                    {editingActivityId ? "Edit Activity" : "Create Activity"}
                  </h3>
                  <form className="space-y-3" onSubmit={handleActivitySubmit}>
                    <input
                      value={activityForm.title}
                      onChange={(event) =>
                        setActivityForm((prev) => ({ ...prev, title: event.target.value }))
                      }
                      placeholder="Activity title"
                      className="w-full rounded-xl border border-border px-3 py-2"
                      required
                    />
                    <textarea
                      value={activityForm.description}
                      onChange={(event) =>
                        setActivityForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Description"
                      className="w-full rounded-xl border border-border px-3 py-2 min-h-24"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={activityForm.activity_type}
                        onChange={(event) =>
                          setActivityForm((prev) => ({
                            ...prev,
                            activity_type: event.target.value as ActivityType,
                          }))
                        }
                        className="w-full rounded-xl border border-border px-3 py-2"
                      >
                        <option value="assigned">Assigned</option>
                        <option value="voluntary">Voluntary</option>
                      </select>
                      <input
                        value={activityForm.assigned_to_user_id}
                        onChange={(event) =>
                          setActivityForm((prev) => ({
                            ...prev,
                            assigned_to_user_id: event.target.value,
                          }))
                        }
                        placeholder="User ID (optional)"
                        className="w-full rounded-xl border border-border px-3 py-2"
                      />
                    </div>
                    <input
                      value={activityForm.recurrence_text}
                      onChange={(event) =>
                        setActivityForm((prev) => ({
                          ...prev,
                          recurrence_text: event.target.value,
                        }))
                      }
                      placeholder="Recurrence (optional)"
                      className="w-full rounded-xl border border-border px-3 py-2"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={saving}>
                        {editingActivityId ? (
                          <>
                            <Save size={14} className="mr-1" />
                            Update
                          </>
                        ) : (
                          <>
                            <Plus size={14} className="mr-1" />
                            Create
                          </>
                        )}
                      </Button>
                      {editingActivityId && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={resetActivityForm}
                        >
                          Cancel edit
                        </Button>
                      )}
                    </div>
                  </form>
                </Card>

                {activities.length === 0 ? (
                  <Card padding="sm">
                    <p className="text-text-secondary">No activities available.</p>
                  </Card>
                ) : (
                  activities.map((activity) => (
                    <Card key={activity.id} padding="sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-text-primary">{activity.title}</p>
                          <p className="text-xs text-text-muted mt-1">
                            Type: {activity.activity_type}
                            {activity.assigned_to_user_id
                              ? ` | Assigned to: ${activity.assigned_to_user_id}`
                              : ""}
                          </p>
                          {activity.description && (
                            <p className="text-sm text-text-secondary mt-2">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditActivity(activity)}
                          >
                            <Edit3 size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => void handleDeleteActivity(activity.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === "rewards" && (
              <div className="space-y-3">
                {rewards.length === 0 ? (
                  <Card padding="sm">
                    <p className="text-text-secondary">No rewards assigned yet.</p>
                  </Card>
                ) : (
                  rewards.map((reward) => (
                    <Card key={reward.reward_id} padding="sm">
                      <p className="font-semibold text-text-primary">{reward.voucher_code}</p>
                      <p className="text-xs text-text-muted mt-1">
                        User: {reward.user_id} | Submission: {reward.submission_id}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        Assigned: {new Date(reward.assigned_at).toLocaleString()}
                      </p>
                    </Card>
                  ))
                )}
              </div>
            )}
          )}
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
