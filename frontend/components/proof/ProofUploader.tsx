"use client";

// ============================================================
// OwnMerit - Proof Upload Component
// Click task → camera/file upload → success state
// ============================================================

import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Task } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/constants";
import {
  Camera,
  Upload,
  CheckCircle2,
  X,
  Clock,
  Star,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

type ProofStage = "idle" | "capturing" | "uploading" | "success";

interface ProofUploaderProps {
  task: Task;
  onComplete?: (taskId: string, proofUrl: string) => void;
}

export function ProofUploader({ task, onComplete }: ProofUploaderProps) {
  const [stage, setStage] = useState<ProofStage>(
    task.status === "completed" ? "success" : "idle"
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    task.proofUrl || null
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const category = CATEGORY_CONFIG[task.category];

  const simulateUpload = useCallback(
    (file: File) => {
      // Create preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setStage("uploading");
      setUploadProgress(0);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTimeout(() => {
            setStage("success");
            onComplete?.(task.id, url);
          }, 300);
        }
        setUploadProgress(Math.min(progress, 100));
      }, 200);
    },
    [task.id, onComplete]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        simulateUpload(file);
      }
    },
    [simulateUpload]
  );

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setStage("idle");
    setPreviewUrl(null);
    setUploadProgress(0);
  };

  return (
    <Card className="overflow-hidden" padding="sm">
      {/* Task header */}
      <div className="p-4 flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <Star size={24} style={{ color: category.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-text-primary">{task.title}</h3>
          <p className="text-sm text-text-secondary mt-1">{task.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: `${category.color}15`,
                color: category.color,
              }}
            >
              {category.label}
            </span>
            {task.dueTime && (
              <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                <Clock size={12} /> {task.dueTime}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-bold text-accent">
              <Star size={12} /> +{task.meritPoints} pts
            </span>
          </div>
        </div>
      </div>

      {/* Proof area */}
      {task.requiresProof && (
        <div className="border-t border-border">
          {/* IDLE - Show capture/upload buttons */}
          {stage === "idle" && (
            <div className="p-4">
              <p className="text-sm font-medium text-text-secondary mb-3">
                Upload proof to earn your points:
              </p>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleCameraCapture}
                  aria-label="Take a photo as proof"
                >
                  <Camera size={20} className="mr-2" />
                  Take Photo
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={handleFileUpload}
                  aria-label="Upload a file as proof"
                >
                  <Upload size={20} className="mr-2" />
                  Upload
                </Button>
              </div>
              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
                aria-hidden="true"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileSelect}
                aria-hidden="true"
              />
            </div>
          )}

          {/* UPLOADING - Show progress */}
          {stage === "uploading" && (
            <div className="p-4">
              <div className="relative rounded-xl overflow-hidden bg-primary-light mb-3">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Proof preview"
                    className="w-full h-48 object-cover opacity-60"
                  />
                )}
                {!previewUrl && (
                  <div className="w-full h-48 flex items-center justify-center">
                    <ImageIcon size={48} className="text-primary/30" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="text-center text-white">
                    <Loader2
                      size={32}
                      className="animate-spin mx-auto mb-2"
                    />
                    <p className="font-semibold">Uploading...</p>
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-primary-light rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(uploadProgress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Upload progress"
                />
              </div>
              <p className="text-sm text-text-muted text-center mt-2">
                {Math.round(uploadProgress)}% complete
              </p>
            </div>
          )}

          {/* SUCCESS - Show confirmation */}
          {stage === "success" && (
            <div className="p-4 bg-success-light/50">
              <div className="scale-in">
                {previewUrl && (
                  <div className="relative rounded-xl overflow-hidden mb-3">
                    <img
                      src={previewUrl}
                      alt="Uploaded proof"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={handleReset}
                        className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        aria-label="Remove proof and try again"
                      >
                        <X size={16} className="text-text-secondary" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                    <CheckCircle2 size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-success text-lg">
                      Proof uploaded!
                    </p>
                    <p className="text-sm text-text-secondary">
                      +{task.meritPoints} merit points earned
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Non-proof task completion */}
      {!task.requiresProof && task.status !== "completed" && (
        <div className="border-t border-border p-4">
          <Button
            variant="success"
            size="lg"
            fullWidth
            onClick={() => {
              setStage("success");
              onComplete?.(task.id, "self-reported");
            }}
          >
            <CheckCircle2 size={20} className="mr-2" />
            Mark as Done (+{task.meritPoints} pts)
          </Button>
        </div>
      )}

      {/* Already completed non-proof task */}
      {!task.requiresProof && task.status === "completed" && (
        <div className="border-t border-border p-4 bg-success-light/50">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-success" />
            <p className="font-bold text-success">Completed</p>
          </div>
        </div>
      )}
    </Card>
  );
}
