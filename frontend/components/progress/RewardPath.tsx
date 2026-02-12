"use client";

// ============================================================
// OwnMerit - Reward Path / Progress Visualization
// Shows progress toward E-Voucher using Recharts + custom SVG
// ============================================================

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { MeritProgress } from "@/lib/types";
import { MERIT_CONFIG, COLORS } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import {
  Star,
  Gift,
  TrendingUp,
  Trophy,
  CheckCircle2,
  Lock,
  Zap,
} from "lucide-react";

interface RewardPathProps {
  progress: MeritProgress;
}

// Custom milestone node for the path
function MilestoneNode({
  milestone,
  index,
  total,
  currentPoints,
}: {
  milestone: MeritProgress["milestones"][0];
  index: number;
  total: number;
  currentPoints: number;
}) {
  const isAchieved = milestone.achieved;
  const isCurrent =
    !isAchieved &&
    (index === 0 ||
      currentPoints >= (index > 0 ? milestone.pointsRequired * 0.5 : 0));
  const isNext =
    !isAchieved &&
    index > 0 &&
    currentPoints < milestone.pointsRequired;

  const iconMap: Record<string, React.ReactNode> = {
    star: <Star size={18} />,
    calendar: <Zap size={18} />,
    "trending-up": <TrendingUp size={18} />,
    shield: <Trophy size={18} />,
    gift: <Gift size={18} />,
  };

  return (
    <div className="flex flex-col items-center relative">
      {/* Connector line */}
      {index < total - 1 && (
        <div
          className={`absolute top-6 left-1/2 w-full h-1 ${
            isAchieved ? "bg-success" : "bg-border"
          }`}
          style={{ transform: "translateX(50%)" }}
        />
      )}

      {/* Node */}
      <div
        className={`
          relative z-10 w-12 h-12 rounded-full flex items-center justify-center
          border-3 transition-all duration-500
          ${
            isAchieved
              ? "bg-success border-success text-white shadow-md"
              : isCurrent
              ? "bg-accent-light border-accent text-accent pulse-gentle"
              : "bg-background border-border text-text-muted"
          }
        `}
      >
        {isAchieved ? (
          <CheckCircle2 size={20} />
        ) : isNext ? (
          <Lock size={16} />
        ) : (
          iconMap[milestone.icon] || <Star size={18} />
        )}
      </div>

      {/* Label */}
      <div className="mt-2 text-center max-w-[80px]">
        <p
          className={`text-xs font-bold ${
            isAchieved ? "text-success" : "text-text-secondary"
          }`}
        >
          {milestone.pointsRequired}pts
        </p>
        <p className="text-[10px] text-text-muted leading-tight mt-0.5">
          {milestone.label}
        </p>
      </div>
    </div>
  );
}

// Custom tooltip for chart
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3 shadow-lg">
      <p className="text-sm font-bold text-text-primary">{label}</p>
      <p className="text-sm text-primary font-semibold">
        {payload[0].value} points earned
      </p>
    </div>
  );
}

export function RewardPath({ progress }: RewardPathProps) {
  const percentage = useMemo(
    () =>
      Math.min(
        (progress.currentPoints / MERIT_CONFIG.voucherThreshold) * 100,
        100
      ),
    [progress.currentPoints]
  );

  const hasReachedGoal =
    progress.currentPoints >= MERIT_CONFIG.voucherThreshold;

  return (
    <div className="space-y-6">
      {/* Points summary card */}
      <Card className="bg-gradient-to-br from-primary to-primary-dark text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80 font-medium">Your Merit Points</p>
            <p className="text-4xl font-bold mt-1">
              {progress.currentPoints}
            </p>
            <p className="text-sm opacity-70 mt-1">
              {hasReachedGoal
                ? "E-Voucher unlocked!"
                : `${MERIT_CONFIG.voucherThreshold - progress.currentPoints} points to E-Voucher`}
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            {hasReachedGoal ? (
              <Gift size={32} className="text-white" />
            ) : (
              <TrendingUp size={32} className="text-white" />
            )}
          </div>
        </div>

        {/* Progress bar to voucher */}
        <div className="mt-5">
          <div className="flex justify-between text-xs opacity-70 mb-1.5">
            <span>0</span>
            <span>{MERIT_CONFIG.voucherThreshold} pts (E-Voucher)</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${percentage}%`,
                background: hasReachedGoal
                  ? "#FFD700"
                  : "linear-gradient(90deg, #6B9E76, #D4A853)",
              }}
            />
          </div>
        </div>
      </Card>

      {/* Milestone path */}
      <Card>
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <Trophy size={20} className="text-accent" />
          Your Reward Path
        </h2>
        <div className="flex justify-between items-start overflow-x-auto pb-2">
          {progress.milestones.map((milestone, index) => (
            <MilestoneNode
              key={milestone.id}
              milestone={milestone}
              index={index}
              total={progress.milestones.length}
              currentPoints={progress.currentPoints}
            />
          ))}
        </div>
      </Card>

      {/* Weekly activity chart */}
      <Card>
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          This Week&apos;s Activity
        </h2>
        <div className="h-56 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={progress.weeklyHistory}>
              <defs>
                <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={COLORS.border}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: COLORS.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: COLORS.textMuted }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={MERIT_CONFIG.maxDailyPoints}
                stroke={COLORS.accent}
                strokeDasharray="5 5"
                label={{
                  value: "Daily max",
                  position: "right",
                  fontSize: 10,
                  fill: COLORS.textMuted,
                }}
              />
              <Area
                type="monotone"
                dataKey="points"
                stroke={COLORS.primary}
                strokeWidth={3}
                fill="url(#pointsGradient)"
                dot={{
                  r: 5,
                  fill: COLORS.surface,
                  stroke: COLORS.primary,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 7,
                  fill: COLORS.primary,
                  stroke: COLORS.surface,
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly summary */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-sm text-text-muted">This week</p>
            <p className="text-xl font-bold text-text-primary">
              {progress.weeklyHistory.reduce((sum, d) => sum + d.points, 0)}{" "}
              <span className="text-sm font-normal text-text-muted">
                points
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Best day</p>
            <p className="text-xl font-bold text-accent">
              {Math.max(...progress.weeklyHistory.map((d) => d.points))}{" "}
              <span className="text-sm font-normal text-text-muted">
                points
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Total earned</p>
            <p className="text-xl font-bold text-secondary">
              {progress.totalEarned}{" "}
              <span className="text-sm font-normal text-text-muted">
                all time
              </span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
