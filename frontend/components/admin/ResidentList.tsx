"use client";

// ============================================================
// OwnMerit - Admin Resident List with Traffic Light Status
// ============================================================

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Resident, TrafficLightStatus } from "@/lib/types";
import {
  Search,
  Filter,
  User,
  ChevronRight,
  Star,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface ResidentListProps {
  residents: Resident[];
  onSelectResident?: (resident: Resident) => void;
}

const trafficLightConfig: Record<
  TrafficLightStatus,
  { label: string; color: string; bgColor: string; description: string }
> = {
  green: {
    label: "On Track",
    color: "#70B080",
    bgColor: "#E8F3EA",
    description: "Completing tasks regularly",
  },
  amber: {
    label: "Needs Support",
    color: "#E0B060",
    bgColor: "#FDF5E3",
    description: "Missing some tasks",
  },
  red: {
    label: "At Risk",
    color: "#E07070",
    bgColor: "#FDE8E8",
    description: "Significant task gaps",
  },
};

function TrafficLightIndicator({
  status,
  size = "md",
}: {
  status: TrafficLightStatus;
  size?: "sm" | "md";
}) {
  const config = trafficLightConfig[status];
  const sizeClass = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <div className="flex items-center gap-2" title={config.description}>
      <div
        className={`${sizeClass} rounded-full shadow-sm`}
        style={{ backgroundColor: config.color }}
        aria-label={`Status: ${config.label}`}
      />
      {size === "md" && (
        <span
          className="text-xs font-bold"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}

function ResidentCard({
  resident,
  onClick,
}: {
  resident: Resident;
  onClick?: () => void;
}) {
  const config = trafficLightConfig[resident.trafficLight];

  return (
    <Card hover onClick={onClick} padding="md">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-lg"
          style={{ backgroundColor: config.color }}
        >
          {resident.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-text-primary truncate">
              {resident.name}
            </h3>
            <TrafficLightIndicator status={resident.trafficLight} />
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
            <span>Room {resident.roomNumber}</span>
            <span className="text-text-muted">|</span>
            <span className="flex items-center gap-1">
              <Star size={12} className="text-accent" />
              {resident.meritPoints} pts
            </span>
          </div>

          {/* Task completion bar */}
          <div className="mt-2">
            <ProgressBar
              value={resident.taskCompletion}
              size="sm"
              color={
                resident.trafficLight === "green"
                  ? "success"
                  : resident.trafficLight === "amber"
                  ? "accent"
                  : "primary"
              }
              label={`${resident.taskCompletion}% tasks completed`}
            />
          </div>
        </div>

        <ChevronRight size={20} className="text-text-muted shrink-0" />
      </div>
    </Card>
  );
}

export function ResidentList({
  residents,
  onSelectResident,
}: ResidentListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    TrafficLightStatus | "all"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "points" | "completion">(
    "name"
  );

  const filteredResidents = useMemo(() => {
    let result = [...residents];

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.roomNumber.includes(q) ||
          r.keyWorker.toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      result = result.filter((r) => r.trafficLight === filterStatus);
    }

    // Sort
    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "points":
        result.sort((a, b) => b.meritPoints - a.meritPoints);
        break;
      case "completion":
        result.sort((a, b) => a.taskCompletion - b.taskCompletion);
        break;
    }

    return result;
  }, [residents, searchQuery, filterStatus, sortBy]);

  // Summary stats
  const stats = useMemo(() => {
    const green = residents.filter((r) => r.trafficLight === "green").length;
    const amber = residents.filter((r) => r.trafficLight === "amber").length;
    const red = residents.filter((r) => r.trafficLight === "red").length;
    return { green, amber, red, total: residents.length };
  }, [residents]);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() =>
            setFilterStatus(filterStatus === "green" ? "all" : "green")
          }
          className={`p-3 rounded-xl text-center transition-all cursor-pointer ${
            filterStatus === "green"
              ? "ring-2 ring-[#70B080] bg-[#E8F3EA]"
              : "bg-surface border border-border"
          }`}
        >
          <div
            className="w-3 h-3 rounded-full mx-auto mb-1"
            style={{ backgroundColor: "#70B080" }}
          />
          <p className="text-xl font-bold text-text-primary">{stats.green}</p>
          <p className="text-[10px] text-text-muted">On Track</p>
        </button>
        <button
          onClick={() =>
            setFilterStatus(filterStatus === "amber" ? "all" : "amber")
          }
          className={`p-3 rounded-xl text-center transition-all cursor-pointer ${
            filterStatus === "amber"
              ? "ring-2 ring-[#E0B060] bg-[#FDF5E3]"
              : "bg-surface border border-border"
          }`}
        >
          <div
            className="w-3 h-3 rounded-full mx-auto mb-1"
            style={{ backgroundColor: "#E0B060" }}
          />
          <p className="text-xl font-bold text-text-primary">{stats.amber}</p>
          <p className="text-[10px] text-text-muted">Needs Support</p>
        </button>
        <button
          onClick={() =>
            setFilterStatus(filterStatus === "red" ? "all" : "red")
          }
          className={`p-3 rounded-xl text-center transition-all cursor-pointer ${
            filterStatus === "red"
              ? "ring-2 ring-[#E07070] bg-[#FDE8E8]"
              : "bg-surface border border-border"
          }`}
        >
          <div
            className="w-3 h-3 rounded-full mx-auto mb-1"
            style={{ backgroundColor: "#E07070" }}
          />
          <p className="text-xl font-bold text-text-primary">{stats.red}</p>
          <p className="text-[10px] text-text-muted">At Risk</p>
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="search"
          placeholder="Search residents, room, or key worker..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-surface border-2 border-border rounded-xl text-base text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary-light focus:outline-none transition-all"
          aria-label="Search residents"
        />
      </div>

      {/* Sort controls */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: "name" as const, label: "Name" },
          { key: "completion" as const, label: "Needs Help First" },
          { key: "points" as const, label: "Most Points" },
        ].map((sort) => (
          <button
            key={sort.key}
            onClick={() => setSortBy(sort.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              sortBy === sort.key
                ? "bg-primary text-white"
                : "bg-surface border border-border text-text-secondary hover:bg-primary-light"
            }`}
          >
            {sort.label}
          </button>
        ))}
        {filterStatus !== "all" && (
          <button
            onClick={() => setFilterStatus("all")}
            className="px-4 py-2 rounded-full text-sm font-medium text-danger bg-danger-light hover:bg-danger/10 whitespace-nowrap transition-colors cursor-pointer"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Resident list */}
      <div className="space-y-3" role="list" aria-label="Residents">
        {filteredResidents.length === 0 ? (
          <div className="text-center py-12">
            <User size={48} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">
              No residents found
            </p>
            <p className="text-sm text-text-muted mt-1">
              Try a different search or filter
            </p>
          </div>
        ) : (
          filteredResidents.map((resident) => (
            <div key={resident.id} role="listitem">
              <ResidentCard
                resident={resident}
                onClick={() => onSelectResident?.(resident)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
