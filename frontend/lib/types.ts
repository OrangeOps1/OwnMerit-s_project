// ============================================================
// OwnMerit - Life Management & Incentive App
// Type Definitions
// ============================================================

// ---- Resident & Onboarding ----

export interface ResidentDetails {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  roomNumber: string;
  moveInDate: string;
  keyWorker: string;
  dietaryNeeds: string;
  medicalNotes: string;
  accessibilityNeeds: string;
}

export interface NextOfKin {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone: string;
}

export interface OnboardingData {
  resident: ResidentDetails;
  nextOfKin: NextOfKin;
  emergencyContact: EmergencyContact;
}

export interface OnboardingStep {
  id: string;
  section: "resident" | "nextOfKin" | "emergencyContact";
  field: string;
  label: string;
  helpText?: string;
  type: "text" | "email" | "tel" | "date" | "textarea" | "select";
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

// ---- Tasks & Proof ----

export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";
export type TaskCategory =
  | "hygiene"
  | "appointment"
  | "chore"
  | "education"
  | "social"
  | "health";

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  meritPoints: number;
  dueDate: string;
  dueTime?: string;
  requiresProof: boolean;
  proofUrl?: string;
  completedAt?: string;
}

// ---- Merit & Progress ----

export interface MeritMilestone {
  id: string;
  label: string;
  pointsRequired: number;
  reward: string;
  icon: string;
  achieved: boolean;
}

export interface MeritProgress {
  currentPoints: number;
  totalEarned: number;
  level: number;
  milestones: MeritMilestone[];
  weeklyHistory: { day: string; points: number }[];
}

// ---- Voucher ----

export interface Voucher {
  id: string;
  code: string;
  value: number;
  currency: string;
  expiresAt: string;
  redeemedAt?: string;
  status: "available" | "redeemed" | "expired";
  retailer: string;
}

// ---- Reminders & Alarms ----

export type ReminderPriority = "low" | "medium" | "high" | "urgent";
export type ReminderRecurrence =
  | "once"
  | "daily"
  | "weekdays"
  | "weekly"
  | "monthly";

export interface Reminder {
  id: string;
  title: string;
  description: string;
  time: string;
  date: string;
  priority: ReminderPriority;
  recurrence: ReminderRecurrence;
  category: TaskCategory;
  isActive: boolean;
  isDismissed: boolean;
  linkedTaskId?: string;
  residentId?: string;
}

// ---- Admin ----

export type TrafficLightStatus = "green" | "amber" | "red";

export interface Resident {
  id: string;
  name: string;
  roomNumber: string;
  moveInDate: string;
  keyWorker: string;
  meritPoints: number;
  taskCompletion: number; // percentage
  trafficLight: TrafficLightStatus;
  avatar?: string;
  recentTasks: Task[];
}

export interface Appointment {
  id: string;
  residentId: string;
  residentName: string;
  title: string;
  description: string;
  date: string;
  time: string;
  recurrence: ReminderRecurrence;
  category: TaskCategory;
  location?: string;
  notes?: string;
  createdBy: string;
}
