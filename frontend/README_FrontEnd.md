# OwnMerit - Life Management & Incentive App

A trauma-informed, accessibility-first application designed for prison leavers and people with learning disabilities. Built with a "calm & trustworthy" design philosophy to reduce cognitive load and build positive routines through incentive-based task completion.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** (icons)
- **Recharts** (progress visualisation)
- **qrcode.react** (QR voucher generation)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Application Routes

| Route | Description |
|-------|-------------|
| `/` | Home screen with greeting, merit points, reminder cards, and task preview |
| `/onboarding` | Multi-step, one-question-at-a-time resident onboarding form |
| `/proof` | Task list with proof upload (camera/file) and visual success states |
| `/progress` | Reward path visualisation with Recharts showing progress to E-Voucher |
| `/voucher` | QR code voucher system with "How to use" instructional overlay |
| `/admin` | Staff dashboard with traffic-light resident list and appointment CRUD |

## Features

### 1. Resident Onboarding Flow
- One-question-at-a-time multi-step form
- Collects: Resident Details, Next of Kin, Emergency Contacts
- Large inputs, clear labels, accessible focus management
- Section progress indicators and skip-able optional fields

### 2. Proof Component
- Task cards with category indicators and merit point values
- Camera capture and file upload support
- Simulated upload with progress bar
- Visual success state with points earned confirmation

### 3. Progress Visualisation (Reward Path)
- Points summary card with gradient design
- Milestone path showing progress nodes (achieved/current/locked)
- Weekly activity area chart built with Recharts
- Summary statistics (weekly total, best day, all-time)

### 4. QR Voucher System
- Locked state showing progress ring when threshold not yet met
- QR code rendering when merit threshold is reached
- "How to use this voucher" instructional overlay with step-by-step guide
- Past vouchers history (redeemed/expired)

### 5. Admin CRUD Dashboard
- Traffic-light status system (Green/Amber/Red) for all residents
- Search, filter by status, and sort residents
- Click-to-expand resident detail modal
- Full appointment CRUD (create, edit, delete) with recurrence options

### 6. Alarm/Reminder Logic
- `useReminders` hook with full CRUD operations
- Automatic categorisation: active, upcoming, overdue
- Priority-based actionable cards (urgent, high, medium, low)
- Dismiss and snooze (15-min) functionality
- Recurring reminder support (daily, weekdays, weekly, monthly)

## Design Philosophy

- **Trauma-informed**: Gentle interactions, no sudden changes, encouraging language
- **Low cognitive load**: One question at a time, clear visual hierarchy, minimal distractions
- **Accessibility-first**: 48px touch targets, visible focus rings, ARIA labels, skip-to-content link, semantic HTML
- **Calm & Trustworthy palette**: Muted blues (#4A7C8F), soft greens (#6B9E76), warm gold accents (#D4A853), and soft grays

## Project Structure

```
app/                    # Next.js App Router pages
  layout.tsx            # Root layout with skip-link and theme
  page.tsx              # Home screen
  onboarding/page.tsx   # Onboarding flow
  proof/page.tsx        # Task proof upload
  progress/page.tsx     # Reward path
  voucher/page.tsx      # QR voucher
  admin/page.tsx        # Staff dashboard

components/
  ui/                   # Shared UI primitives (Button, Input, Card, ProgressBar, Navigation)
  onboarding/           # OnboardingFlow component
  proof/                # ProofUploader component
  progress/             # RewardPath component (Recharts)
  voucher/              # QRVoucher + InstructionOverlay
  admin/                # ResidentList (traffic lights) + AppointmentForm (CRUD)
  reminders/            # ActionableCard + ReminderList

hooks/
  useReminders.ts       # Alarm/reminder logic with recurrence
  useOnboarding.ts      # Multi-step form state management
  useMeritPoints.ts     # Merit points tracking and milestones

lib/
  types.ts              # TypeScript type definitions
  constants.ts          # Colours, config, onboarding steps, categories
  mockData.ts           # Development mock data
```
