"use client";

// ============================================================
// OwnMerit - Resident Onboarding Flow
// Multi-step, one-question-at-a-time form
// Trauma-informed, high accessibility
// ============================================================

import { useState, useRef, useEffect } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Input, TextArea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  ChevronRight,
  ChevronLeft,
  User,
  Users,
  Phone,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const sectionIcons: Record<string, React.ReactNode> = {
  resident: <User size={20} aria-hidden="true" />,
  nextOfKin: <Users size={20} aria-hidden="true" />,
  emergencyContact: <Phone size={20} aria-hidden="true" />,
};

export function OnboardingFlow() {
  const {
    currentStep,
    totalSteps,
    currentStepConfig,
    currentValue,
    sectionLabel,
    sectionProgress,
    isFirstStep,
    isLastStep,
    canProceed,
    setValue,
    next,
    back,
    submit,
  } = useOnboarding();

  const [isCompleted, setIsCompleted] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  // Focus input on step change
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      const data = submit();
      console.log("Onboarding complete:", data);
      setIsCompleted(true);
      return;
    }
    setDirection("forward");
    next();
  };

  const handleBack = () => {
    setDirection("backward");
    back();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canProceed) {
      e.preventDefault();
      handleNext();
    }
  };

  // Completion screen
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-md scale-in">
          <div className="w-24 h-24 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-success" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Welcome aboard!
          </h1>
          <p className="text-lg text-text-secondary mb-2">
            Your details have been saved successfully.
          </p>
          <p className="text-base text-text-muted mb-8">
            A member of staff will review your information shortly. In the
            meantime, explore your new home screen.
          </p>
          <Button
            size="xl"
            fullWidth
            onClick={() => (window.location.href = "/")}
          >
            <Sparkles size={20} className="mr-2" />
            Go to Home Screen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with progress */}
      <div className="bg-surface border-b border-border px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto">
          {/* Section indicator */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-primary">
              {sectionIcons[currentStepConfig.section]}
            </div>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              {sectionLabel}
            </span>
            <span className="text-sm text-text-muted ml-auto">
              {currentStep + 1} of {totalSteps}
            </span>
          </div>

          {/* Overall progress bar */}
          <ProgressBar
            value={currentStep + 1}
            max={totalSteps}
            size="sm"
            color="primary"
          />

          {/* Section progress */}
          <div className="mt-2">
            <ProgressBar
              value={sectionProgress}
              max={100}
              size="sm"
              color="secondary"
              label={`${sectionLabel} progress`}
            />
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8">
        <div
          className={`max-w-lg mx-auto w-full page-transition`}
          key={currentStep}
        >
          {/* The question */}
          <div className="mb-8">
            {currentStepConfig.type === "select" &&
            currentStepConfig.options ? (
              <Select
                ref={inputRef as React.Ref<HTMLSelectElement>}
                label={currentStepConfig.label}
                helpText={currentStepConfig.helpText}
                options={currentStepConfig.options}
                value={currentValue}
                onChange={(e) => setValue(e.target.value)}
                required={currentStepConfig.required}
                onKeyDown={handleKeyDown}
              />
            ) : currentStepConfig.type === "textarea" ? (
              <TextArea
                ref={inputRef as React.Ref<HTMLTextAreaElement>}
                label={currentStepConfig.label}
                helpText={currentStepConfig.helpText}
                value={currentValue}
                onChange={(e) => setValue(e.target.value)}
                placeholder={currentStepConfig.placeholder}
                required={currentStepConfig.required}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <Input
                ref={inputRef as React.Ref<HTMLInputElement>}
                label={currentStepConfig.label}
                helpText={currentStepConfig.helpText}
                type={currentStepConfig.type}
                value={currentValue}
                onChange={(e) => setValue(e.target.value)}
                placeholder={currentStepConfig.placeholder}
                required={currentStepConfig.required}
                onKeyDown={handleKeyDown}
              />
            )}
          </div>

          {/* Optional skip hint */}
          {!currentStepConfig.required && (
            <p className="text-center text-sm text-text-muted mb-6">
              This question is optional — press{" "}
              <span className="font-semibold">Next</span> to skip
            </p>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="bg-surface border-t border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {!isFirstStep && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              aria-label="Go to previous question"
            >
              <ChevronLeft size={20} className="mr-1" />
              Back
            </Button>
          )}
          <Button
            size="lg"
            fullWidth
            onClick={handleNext}
            disabled={!canProceed}
            aria-label={
              isLastStep ? "Complete onboarding" : "Go to next question"
            }
          >
            {isLastStep ? (
              <>
                <CheckCircle2 size={20} className="mr-2" />
                Complete
              </>
            ) : (
              <>
                Next
                <ChevronRight size={20} className="ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
