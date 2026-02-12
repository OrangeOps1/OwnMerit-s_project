"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNavigation, TopBar } from "@/components/ui/Navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clearAuthState, getApiBaseUrl, getAuthState } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
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
  LogOut,
} from "lucide-react";

type AdminTab = "overview" | "submissions" | "activities" | "rewards" | "users";
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

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  group: string;
  created_at: string;
}

const API_BASE = getApiBaseUrl();

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = getAuthState();
  const token = auth?.access_token;
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  const router = useRouter();
  const { checking } = useRequireAuth("admin");
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "admin",
    group: "general",
  });
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
      const [dashboardData, submissionsData, activitiesData, rewardsData, usersData] =
        await Promise.all([
          apiRequest<AdminDashboard>("/admin/dashboard"),
          apiRequest<{ items: Submission[] }>("/admin/submissions"),
          apiRequest<{ items: Activity[] }>("/admin/activities"),
          apiRequest<{ items: Reward[] }>("/admin/rewards"),
          apiRequest<{ items: UserRow[] }>("/admin/users"),
        ]);
      setDashboard(dashboardData);
      setSubmissions(submissionsData.items);
      setActivities(activitiesData.items);
      setRewards(rewardsData.items);
      setUsers(usersData.items);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Unknown error";
      setError(`Unable to load admin data: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (checking) {
      return;
    }
    void loadAdminData();
  }, [checking]);

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

  async function handleActivitySubmit(event: FormEvent<HTMLFormElement>) {
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

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password.trim()) {
      return;
    }
    setCreatingUser(true);
    try {
      await apiRequest("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          name: userForm.name.trim(),
          email: userForm.email.trim().toLowerCase(),
          password: userForm.password,
          role: userForm.role,
          group: userForm.group.trim() || "general",
        }),
      });
      setUserForm({
        name: "",
        email: "",
        password: "",
        role: "user",
        group: "general",
      });
      await loadAdminData();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Unknown error";
      setError(`Unable to create user: ${message}`);
    } finally {
      setCreatingUser(false);
    }
  }

  function handleLogout() {
    clearAuthState();
    router.push("/login");
  }

  if (checking) {
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
      <TopBar title="Staff Dashboard" />

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Admin badge */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Shield size={16} className="text-primary" />
          <span className="font-semibold text-primary">Staff Access</span>
        </div>

        <div className="mb-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void loadAdminData()}>
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={14} className="mr-1" />
            Logout
          </Button>
        </div>

        {/* Tab navigation */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { key: "overview" as const, label: "Overview", icon: LayoutDashboard },
            { key: "submissions" as const, label: "Submissions", icon: ClipboardCheck },
            { key: "activities" as const, label: "Activities", icon: ListChecks },
            { key: "rewards" as const, label: "Rewards", icon: Gift },
            { key: "users" as const, label: "Users", icon: Shield },
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
                      <select
                        value={activityForm.assigned_to_user_id}
                        onChange={(event) =>
                          setActivityForm((prev) => ({
                            ...prev,
                            assigned_to_user_id: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-border px-3 py-2"
                      >
                        <option value="">Assign to user (optional)</option>
                        {users
                          .filter((user) => user.role === "user")
                          .map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                      </select>
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

            {activeTab === "users" && (
              <div className="space-y-4">
                <Card>
                  <h3 className="font-semibold text-text-primary mb-3">Create User</h3>
                  <form className="space-y-3" onSubmit={handleCreateUser}>
                    <Input
                      label="Name"
                      value={userForm.name}
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={userForm.email}
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      required
                    />
                    <Input
                      label="Password"
                      type="password"
                      value={userForm.password}
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={userForm.role}
                        onChange={(event) =>
                          setUserForm((prev) => ({
                            ...prev,
                            role: event.target.value as "user" | "admin",
                          }))
                        }
                        className="w-full rounded-xl border border-border px-3 py-2"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <input
                        value={userForm.group}
                        onChange={(event) =>
                          setUserForm((prev) => ({ ...prev, group: event.target.value }))
                        }
                        className="w-full rounded-xl border border-border px-3 py-2"
                        placeholder="Group"
                      />
                    </div>
                    <Button type="submit" size="sm" disabled={creatingUser}>
                      {creatingUser ? "Creating..." : "Create user"}
                    </Button>
                  </form>
                </Card>

                <div className="space-y-2">
                  {users.map((user) => (
                    <Card key={user.id} padding="sm">
                      <p className="font-semibold text-text-primary">{user.name}</p>
                      <p className="text-xs text-text-muted mt-1">
                        {user.email} | {user.role} | {user.group}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
