"use client";

// ============================================================
// OwnMerit - Admin Appointment CRUD Form
// Create recurring appointments/alarms for residents
// ============================================================

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, TextArea } from "@/components/ui/Input";
import type {
  Appointment,
  ReminderRecurrence,
  TaskCategory,
  Resident,
} from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/constants";
import {
  Plus,
  Edit3,
  Trash2,
  CalendarPlus,
  Clock,
  MapPin,
  Repeat,
  User,
  X,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface AppointmentFormProps {
  residents: Resident[];
  appointments: Appointment[];
  onSave?: (appointment: Omit<Appointment, "id" | "createdBy">) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, updates: Partial<Appointment>) => void;
}

const recurrenceOptions = [
  { value: "once", label: "One-time" },
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays (Mon-Fri)" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const categoryOptions = Object.entries(CATEGORY_CONFIG).map(
  ([key, config]) => ({
    value: key,
    label: config.label,
  })
);

interface FormData {
  residentId: string;
  residentName: string;
  title: string;
  description: string;
  date: string;
  time: string;
  recurrence: ReminderRecurrence;
  category: TaskCategory;
  location: string;
  notes: string;
}

const emptyForm: FormData = {
  residentId: "",
  residentName: "",
  title: "",
  description: "",
  date: "",
  time: "",
  recurrence: "once",
  category: "appointment",
  location: "",
  notes: "",
};

function AppointmentCard({
  appointment,
  onEdit,
  onDelete,
}: {
  appointment: Appointment;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const category = CATEGORY_CONFIG[appointment.category];

  return (
    <Card padding="sm" className="overflow-hidden">
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <CalendarPlus size={18} style={{ color: category.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-text-primary text-sm truncate">
                {appointment.title}
              </h4>
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 hover:bg-primary-light rounded-lg transition-colors"
                aria-label={expanded ? "Collapse" : "Expand"}
              >
                {expanded ? (
                  <ChevronUp size={16} className="text-text-muted" />
                ) : (
                  <ChevronDown size={16} className="text-text-muted" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
              <User size={12} />
              <span>{appointment.residentName}</span>
              <span className="text-text-muted">|</span>
              <Clock size={12} />
              <span>
                {new Date(appointment.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}{" "}
                at {appointment.time}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${category.color}15`,
                  color: category.color,
                }}
              >
                {category.label}
              </span>
              {appointment.recurrence !== "once" && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary flex items-center gap-1">
                  <Repeat size={10} />
                  {
                    recurrenceOptions.find(
                      (r) => r.value === appointment.recurrence
                    )?.label
                  }
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            {appointment.description && (
              <p className="text-sm text-text-secondary">
                {appointment.description}
              </p>
            )}
            {appointment.location && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <MapPin size={14} />
                <span>{appointment.location}</span>
              </div>
            )}
            {appointment.notes && (
              <p className="text-xs text-text-muted italic">
                Note: {appointment.notes}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit3 size={14} className="mr-1" />
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={onDelete}>
                <Trash2 size={14} className="mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export function AppointmentManager({
  residents,
  appointments: initialAppointments,
  onSave,
  onDelete,
  onEdit,
}: AppointmentFormProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "residentId"
        ? {
            residentName:
              residents.find((r) => r.id === value)?.name || "",
          }
        : {}),
    }));
  };

  const handleSubmit = () => {
    if (!formData.residentId || !formData.title || !formData.date || !formData.time) {
      return;
    }

    if (editingId) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === editingId ? { ...a, ...formData } : a
        )
      );
      onEdit?.(editingId, formData);
    } else {
      const newAppointment: Appointment = {
        id: `a-${Date.now()}`,
        ...formData,
        createdBy: "Staff",
      };
      setAppointments((prev) => [...prev, newAppointment]);
      onSave?.(formData);
    }

    setFormData(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (appointment: Appointment) => {
    setFormData({
      residentId: appointment.residentId,
      residentName: appointment.residentName,
      title: appointment.title,
      description: appointment.description,
      date: appointment.date,
      time: appointment.time,
      recurrence: appointment.recurrence,
      category: appointment.category,
      location: appointment.location || "",
      notes: appointment.notes || "",
    });
    setEditingId(appointment.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    onDelete?.(id);
  };

  const residentOptions = residents.map((r) => ({
    value: r.id,
    label: `${r.name} (Room ${r.roomNumber})`,
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <CalendarPlus size={20} className="text-primary" />
          Appointments & Alarms
        </h2>
        <Button
          variant={showForm ? "ghost" : "primary"}
          size="sm"
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingId(null);
              setFormData(emptyForm);
            }
          }}
        >
          {showForm ? (
            <>
              <X size={16} className="mr-1" /> Cancel
            </>
          ) : (
            <>
              <Plus size={16} className="mr-1" /> New
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="scale-in">
          <h3 className="font-bold text-text-primary mb-4">
            {editingId ? "Edit Appointment" : "New Appointment / Alarm"}
          </h3>
          <div className="space-y-4">
            <Select
              label="Resident"
              options={residentOptions}
              value={formData.residentId}
              onChange={(e) => handleFieldChange("residentId", e.target.value)}
              required
            />
            <Input
              label="Title"
              type="text"
              value={formData.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              placeholder="e.g. GP Check-up"
              required
            />
            <TextArea
              label="Description"
              value={formData.description}
              onChange={(e) =>
                handleFieldChange("description", e.target.value)
              }
              placeholder="Add details..."
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => handleFieldChange("date", e.target.value)}
                required
              />
              <Input
                label="Time"
                type="time"
                value={formData.time}
                onChange={(e) => handleFieldChange("time", e.target.value)}
                required
              />
            </div>
            <Select
              label="Repeat"
              options={recurrenceOptions}
              value={formData.recurrence}
              onChange={(e) =>
                handleFieldChange("recurrence", e.target.value)
              }
            />
            <Select
              label="Category"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => handleFieldChange("category", e.target.value)}
            />
            <Input
              label="Location"
              type="text"
              value={formData.location}
              onChange={(e) => handleFieldChange("location", e.target.value)}
              placeholder="e.g. Health Centre, Room 3"
            />
            <TextArea
              label="Staff Notes"
              value={formData.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              placeholder="Internal notes (not shown to resident)"
            />
            <Button
              size="lg"
              fullWidth
              onClick={handleSubmit}
              disabled={
                !formData.residentId ||
                !formData.title ||
                !formData.date ||
                !formData.time
              }
            >
              <Save size={18} className="mr-2" />
              {editingId ? "Update Appointment" : "Create Appointment"}
            </Button>
          </div>
        </Card>
      )}

      {/* Appointment list */}
      <div className="space-y-2">
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <CalendarPlus size={40} className="text-text-muted mx-auto mb-2" />
            <p className="text-text-secondary">No appointments yet</p>
            <p className="text-sm text-text-muted mt-1">
              Create one using the button above
            </p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onEdit={() => handleEdit(appointment)}
              onDelete={() => handleDelete(appointment.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
