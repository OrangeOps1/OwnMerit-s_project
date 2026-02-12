// ============================================================
// OwnMerit - Constants & Configuration
// ============================================================

import type { OnboardingStep, MeritMilestone } from "./types";

// ---- Color Palette (Calm & Trustworthy) ----
export const COLORS = {
  primary: "#4A7C8F",
  primaryLight: "#E8F0F3",
  primaryDark: "#365B6A",
  secondary: "#6B9E76",
  secondaryLight: "#E8F3EA",
  accent: "#D4A853",
  accentLight: "#FDF5E3",
  background: "#F7F8FA",
  surface: "#FFFFFF",
  textPrimary: "#2C3E50",
  textSecondary: "#6B7C8D",
  textMuted: "#95A5B6",
  border: "#E2E8F0",
  success: "#6B9E76",
  warning: "#D4A853",
  danger: "#C75C5C",
  dangerLight: "#FDE8E8",
  trafficGreen: "#70B080",
  trafficAmber: "#E0B060",
  trafficRed: "#E07070",
} as const;

// ---- Merit System Config ----
export const MERIT_CONFIG = {
  voucherThreshold: 100,
  voucherValue: 10,
  maxDailyPoints: 50,
  streakBonus: 5,
};

// ---- Merit Milestones ----
export const MILESTONES: MeritMilestone[] = [
  {
    id: "m1",
    label: "Getting Started",
    pointsRequired: 10,
    reward: "Welcome badge",
    icon: "star",
    achieved: false,
  },
  {
    id: "m2",
    label: "Building Routine",
    pointsRequired: 25,
    reward: "Extra activity time",
    icon: "calendar",
    achieved: false,
  },
  {
    id: "m3",
    label: "Making Progress",
    pointsRequired: 50,
    reward: "Choice of meal",
    icon: "trending-up",
    achieved: false,
  },
  {
    id: "m4",
    label: "Staying Strong",
    pointsRequired: 75,
    reward: "Phone credit top-up",
    icon: "shield",
    achieved: false,
  },
  {
    id: "m5",
    label: "E-Voucher Earned!",
    pointsRequired: 100,
    reward: "£10 E-Voucher",
    icon: "gift",
    achieved: false,
  },
];

// ---- Onboarding Steps (One-Question-at-a-Time) ----
export const ONBOARDING_STEPS: OnboardingStep[] = [
  // Section 1: Resident Details
  {
    id: "r-firstName",
    section: "resident",
    field: "firstName",
    label: "What is your first name?",
    helpText: "This is the name staff will use to greet you.",
    type: "text",
    placeholder: "e.g. James",
    required: true,
  },
  {
    id: "r-lastName",
    section: "resident",
    field: "lastName",
    label: "What is your last name?",
    type: "text",
    placeholder: "e.g. Smith",
    required: true,
  },
  {
    id: "r-dateOfBirth",
    section: "resident",
    field: "dateOfBirth",
    label: "What is your date of birth?",
    helpText: "We need this for your records.",
    type: "date",
    required: true,
  },
  {
    id: "r-phone",
    section: "resident",
    field: "phone",
    label: "What is your phone number?",
    helpText: "We'll use this to send you reminders.",
    type: "tel",
    placeholder: "e.g. 07700 900000",
    required: false,
  },
  {
    id: "r-email",
    section: "resident",
    field: "email",
    label: "What is your email address?",
    helpText: "Optional - for receiving updates.",
    type: "email",
    placeholder: "e.g. james@email.com",
    required: false,
  },
  {
    id: "r-roomNumber",
    section: "resident",
    field: "roomNumber",
    label: "What room have you been assigned?",
    helpText: "Check with staff if you're not sure.",
    type: "text",
    placeholder: "e.g. Room 12",
    required: true,
  },
  {
    id: "r-dietaryNeeds",
    section: "resident",
    field: "dietaryNeeds",
    label: "Do you have any dietary needs?",
    helpText: "Allergies, vegetarian, halal, etc.",
    type: "textarea",
    placeholder: "Leave blank if none",
    required: false,
  },
  {
    id: "r-accessibilityNeeds",
    section: "resident",
    field: "accessibilityNeeds",
    label: "Do you have any accessibility needs?",
    helpText:
      "Anything that helps us support you better - mobility, vision, hearing, etc.",
    type: "textarea",
    placeholder: "Leave blank if none",
    required: false,
  },

  // Section 2: Next of Kin
  {
    id: "nok-name",
    section: "nextOfKin",
    field: "name",
    label: "Who is your next of kin?",
    helpText: "The person we should contact about your welfare.",
    type: "text",
    placeholder: "Full name",
    required: true,
  },
  {
    id: "nok-relationship",
    section: "nextOfKin",
    field: "relationship",
    label: "What is their relationship to you?",
    type: "select",
    required: true,
    options: [
      { value: "parent", label: "Parent" },
      { value: "sibling", label: "Brother / Sister" },
      { value: "partner", label: "Partner" },
      { value: "child", label: "Son / Daughter" },
      { value: "friend", label: "Friend" },
      { value: "social-worker", label: "Social Worker" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "nok-phone",
    section: "nextOfKin",
    field: "phone",
    label: "What is their phone number?",
    type: "tel",
    placeholder: "e.g. 07700 900000",
    required: true,
  },
  {
    id: "nok-email",
    section: "nextOfKin",
    field: "email",
    label: "What is their email address?",
    helpText: "Optional",
    type: "email",
    placeholder: "e.g. relative@email.com",
    required: false,
  },

  // Section 3: Emergency Contact
  {
    id: "ec-name",
    section: "emergencyContact",
    field: "name",
    label: "Who should we contact in an emergency?",
    helpText: "This can be the same as your next of kin.",
    type: "text",
    placeholder: "Full name",
    required: true,
  },
  {
    id: "ec-relationship",
    section: "emergencyContact",
    field: "relationship",
    label: "What is their relationship to you?",
    type: "select",
    required: true,
    options: [
      { value: "parent", label: "Parent" },
      { value: "sibling", label: "Brother / Sister" },
      { value: "partner", label: "Partner" },
      { value: "child", label: "Son / Daughter" },
      { value: "friend", label: "Friend" },
      { value: "social-worker", label: "Social Worker" },
      { value: "keyworker", label: "Key Worker" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "ec-phone",
    section: "emergencyContact",
    field: "phone",
    label: "What is their phone number?",
    type: "tel",
    placeholder: "e.g. 07700 900000",
    required: true,
  },
  {
    id: "ec-alternatePhone",
    section: "emergencyContact",
    field: "alternatePhone",
    label: "Is there a backup number we can try?",
    helpText: "Optional - a second number just in case.",
    type: "tel",
    placeholder: "e.g. 07700 900001",
    required: false,
  },
];

// ---- Category Icons & Labels ----
export const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  hygiene: { label: "Hygiene", icon: "droplets", color: "#4A7C8F" },
  appointment: { label: "Appointment", icon: "calendar-clock", color: "#8B5CF6" },
  chore: { label: "Chore", icon: "home", color: "#D4A853" },
  education: { label: "Education", icon: "book-open", color: "#6B9E76" },
  social: { label: "Social", icon: "users", color: "#E0896B" },
  health: { label: "Health", icon: "heart-pulse", color: "#C75C5C" },
};
