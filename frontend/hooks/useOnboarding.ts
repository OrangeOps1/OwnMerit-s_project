"use client";

// ============================================================
// OwnMerit - Onboarding State Management Hook
// ============================================================

import { useState, useCallback } from "react";
import type { OnboardingData } from "@/lib/types";
import { ONBOARDING_STEPS } from "@/lib/constants";

const INITIAL_DATA: OnboardingData = {
  resident: {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    address: "",
    roomNumber: "",
    moveInDate: "",
    keyWorker: "",
    dietaryNeeds: "",
    medicalNotes: "",
    accessibilityNeeds: "",
  },
  nextOfKin: {
    name: "",
    relationship: "",
    phone: "",
    email: "",
    address: "",
  },
  emergencyContact: {
    name: "",
    relationship: "",
    phone: "",
    alternatePhone: "",
  },
};

interface UseOnboardingReturn {
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;
  currentStepConfig: (typeof ONBOARDING_STEPS)[0];
  currentValue: string;
  sectionLabel: string;
  sectionProgress: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isCurrentRequired: boolean;
  canProceed: boolean;
  setValue: (value: string) => void;
  next: () => boolean;
  back: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
  submit: () => OnboardingData;
}

export function useOnboarding(): UseOnboardingReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);

  const totalSteps = ONBOARDING_STEPS.length;
  const currentStepConfig = ONBOARDING_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Get current value from data
  const section = currentStepConfig.section;
  const field = currentStepConfig.field;
  const currentValue =
    (data[section] as unknown as Record<string, string>)[field] || "";

  // Section progress
  const sectionSteps = ONBOARDING_STEPS.filter(
    (s) => s.section === section
  );
  const sectionIndex = sectionSteps.findIndex(
    (s) => s.id === currentStepConfig.id
  );
  const sectionProgress =
    sectionSteps.length > 0
      ? ((sectionIndex + 1) / sectionSteps.length) * 100
      : 0;

  const sectionLabels: Record<string, string> = {
    resident: "Your Details",
    nextOfKin: "Next of Kin",
    emergencyContact: "Emergency Contact",
  };
  const sectionLabel = sectionLabels[section] || "";

  const isCurrentRequired = currentStepConfig.required;
  const canProceed = !isCurrentRequired || currentValue.trim().length > 0;

  const setValue = useCallback(
    (value: string) => {
      setData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    },
    [section, field]
  );

  const next = useCallback((): boolean => {
    if (!canProceed) return false;
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    }
    return true;
  }, [canProceed, isLastStep]);

  const back = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  const reset = useCallback(() => {
    setCurrentStep(0);
    setData(INITIAL_DATA);
  }, []);

  const submit = useCallback((): OnboardingData => {
    return { ...data };
  }, [data]);

  return {
    currentStep,
    totalSteps,
    data,
    currentStepConfig,
    currentValue,
    sectionLabel,
    sectionProgress,
    isFirstStep,
    isLastStep,
    isCurrentRequired,
    canProceed,
    setValue,
    next,
    back,
    goToStep,
    reset,
    submit,
  };
}
