"use client";

// ============================================================
// OwnMerit - Admin Dashboard
// Staff view: Resident list, traffic lights, appointments
// ============================================================

import { useState } from "react";
import { BottomNavigation, TopBar } from "@/components/ui/Navigation";
import { ResidentList } from "@/components/admin/ResidentList";
import { AppointmentManager } from "@/components/admin/AppointmentForm";
import { Card } from "@/components/ui/Card";
import {
  MOCK_RESIDENTS,
  MOCK_APPOINTMENTS,
} from "@/lib/mockData";
import type { Resident } from "@/lib/types";
import {
  Users,
  CalendarPlus,
  LayoutDashboard,
  Shield,
  X,
  Star,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

type AdminTab = "residents" | "appointments";

function ResidentDetail({
  resident,
  onClose,
}: {
  resident: Resident;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative bg-surface rounded-t-3xl sm:rounded-3xl w-full max-w-md mx-auto p-6 pb-8 scale-in max-h-[80vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={`${resident.name} details`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            {resident.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-primary-light transition-colors touch-target"
            aria-label="Close"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card padding="sm" className="text-center">
              <Star size={20} className="text-accent mx-auto mb-1" />
              <p className="text-xl font-bold text-text-primary">
                {resident.meritPoints}
              </p>
              <p className="text-xs text-text-muted">Merit Points</p>
            </Card>
            <Card padding="sm" className="text-center">
              <TrendingUp size={20} className="text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-text-primary">
                {resident.taskCompletion}%
              </p>
              <p className="text-xs text-text-muted">Task Completion</p>
            </Card>
          </div>

          <Card padding="sm">
            <h3 className="font-bold text-text-primary text-sm mb-2">
              Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Room</span>
                <span className="font-medium text-text-primary">
                  {resident.roomNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Key Worker</span>
                <span className="font-medium text-text-primary">
                  {resident.keyWorker}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Move-in Date</span>
                <span className="font-medium text-text-primary">
                  {new Date(resident.moveInDate).toLocaleDateString("en-GB")}
                </span>
              </div>
            </div>
          </Card>

          <Card padding="sm">
            <h3 className="font-bold text-text-primary text-sm mb-2">
              Recent Tasks
            </h3>
            <div className="space-y-2">
              {resident.recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-text-secondary">{task.title}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      task.status === "completed"
                        ? "bg-success-light text-success"
                        : "bg-warning-light text-warning"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("residents");
  const [selectedResident, setSelectedResident] = useState<Resident | null>(
    null
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar title="Staff Dashboard" />

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Admin badge */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Shield size={16} className="text-primary" />
          <span className="font-semibold text-primary">Staff Access</span>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab("residents")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              activeTab === "residents"
                ? "bg-primary text-white shadow-md"
                : "bg-surface border border-border text-text-secondary hover:bg-primary-light"
            }`}
          >
            <Users size={18} />
            Residents
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              activeTab === "appointments"
                ? "bg-primary text-white shadow-md"
                : "bg-surface border border-border text-text-secondary hover:bg-primary-light"
            }`}
          >
            <CalendarPlus size={18} />
            Appointments
          </button>
        </div>

        {/* Tab content */}
        <div className="page-transition" key={activeTab}>
          {activeTab === "residents" && (
            <ResidentList
              residents={MOCK_RESIDENTS}
              onSelectResident={setSelectedResident}
            />
          )}
          {activeTab === "appointments" && (
            <AppointmentManager
              residents={MOCK_RESIDENTS}
              appointments={MOCK_APPOINTMENTS}
            />
          )}
        </div>
      </div>

      {/* Resident detail modal */}
      {selectedResident && (
        <ResidentDetail
          resident={selectedResident}
          onClose={() => setSelectedResident(null)}
        />
      )}

      <BottomNavigation />
    </div>
  );
}
