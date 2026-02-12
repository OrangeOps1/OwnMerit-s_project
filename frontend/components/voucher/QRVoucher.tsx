"use client";

// ============================================================
// OwnMerit - QR Voucher System
// Renders QR code when merit threshold is hit
// Includes instructional overlay
// ============================================================

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Voucher } from "@/lib/types";
import { COLORS, MERIT_CONFIG } from "@/lib/constants";
import {
  Gift,
  HelpCircle,
  X,
  ShoppingBag,
  Smartphone,
  CheckCircle2,
  Star,
  Lock,
  Clock,
} from "lucide-react";

interface QRVoucherProps {
  voucher: Voucher | null;
  currentPoints: number;
  threshold?: number;
}

function InstructionOverlay({ onClose }: { onClose: () => void }) {
  const steps = [
    {
      icon: <Smartphone size={28} className="text-primary" />,
      title: "Show this QR code",
      description:
        "Open this screen and show the QR code at the till when you're ready to pay.",
    },
    {
      icon: <ShoppingBag size={28} className="text-secondary" />,
      title: "The cashier will scan it",
      description:
        "The cashier will scan your code to apply the discount to your purchase.",
    },
    {
      icon: <CheckCircle2 size={28} className="text-success" />,
      title: "That's it!",
      description:
        "The voucher value will be taken off your total. You can use it all at once.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className="relative bg-surface rounded-t-3xl sm:rounded-3xl w-full max-w-md mx-auto p-6 pb-8 scale-in"
        role="dialog"
        aria-modal="true"
        aria-label="How to use your voucher"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">
            How to use your voucher
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-primary-light transition-colors touch-target"
            aria-label="Close instructions"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="space-y-5">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center shrink-0">
                {step.icon}
              </div>
              <div>
                <p className="font-bold text-text-primary">
                  <span className="text-primary mr-2">{index + 1}.</span>
                  {step.title}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-accent-light rounded-xl">
          <p className="text-sm text-text-secondary">
            <strong className="text-accent">Tip:</strong> Make sure your screen
            brightness is turned up so the QR code is easy to scan.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-6"
          onClick={onClose}
        >
          Got it!
        </Button>
      </div>
    </div>
  );
}

export function QRVoucher({
  voucher,
  currentPoints,
  threshold = MERIT_CONFIG.voucherThreshold,
}: QRVoucherProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const hasReachedThreshold = currentPoints >= threshold;
  const isRedeemed = voucher?.status === "redeemed";
  const isExpired = voucher?.status === "expired";
  const isAvailable = voucher?.status === "available" && hasReachedThreshold;

  // Not yet earned
  if (!hasReachedThreshold || !voucher) {
    const pointsNeeded = threshold - currentPoints;
    const progressPercent = Math.min((currentPoints / threshold) * 100, 100);

    return (
      <Card className="text-center">
        <div className="w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock size={36} className="text-primary/50" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">
          E-Voucher Locked
        </h2>
        <p className="text-text-secondary mb-4">
          Earn{" "}
          <span className="font-bold text-accent">{pointsNeeded} more points</span>{" "}
          to unlock your E-Voucher!
        </p>

        {/* Progress ring */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={COLORS.border}
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={COLORS.primary}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercent / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">
                {Math.round(progressPercent)}%
              </p>
              <p className="text-xs text-text-muted">complete</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-text-muted">
          Keep completing tasks to earn merit points!
        </p>
      </Card>
    );
  }

  return (
    <>
      {/* Active voucher */}
      <Card
        className={`text-center ${
          isRedeemed
            ? "bg-secondary-light/30"
            : isExpired
            ? "opacity-60"
            : ""
        }`}
      >
        {/* Status badge */}
        {isRedeemed && (
          <div className="inline-flex items-center gap-1.5 bg-success-light text-success text-sm font-bold px-4 py-1.5 rounded-full mb-4">
            <CheckCircle2 size={16} />
            Redeemed
          </div>
        )}
        {isExpired && (
          <div className="inline-flex items-center gap-1.5 bg-danger-light text-danger text-sm font-bold px-4 py-1.5 rounded-full mb-4">
            <Clock size={16} />
            Expired
          </div>
        )}

        {/* Voucher header */}
        <div className="mb-4">
          <div className="w-16 h-16 bg-accent-light rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Gift size={32} className="text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">
            £{voucher.value} E-Voucher
          </h2>
          <p className="text-text-secondary mt-1">
            {voucher.retailer}
          </p>
        </div>

        {/* QR Code */}
        {isAvailable && (
          <div className="bg-white p-6 rounded-2xl inline-block mb-4 shadow-sm border border-border">
            <QRCodeSVG
              value={voucher.code}
              size={200}
              level="H"
              includeMargin={false}
              bgColor="#FFFFFF"
              fgColor={COLORS.textPrimary}
            />
          </div>
        )}

        {/* Voucher code */}
        <p className="font-mono text-sm text-text-muted tracking-wider mb-4">
          {voucher.code}
        </p>

        {/* Expiry */}
        <p className="text-sm text-text-secondary mb-4">
          {isExpired
            ? "This voucher has expired"
            : isRedeemed
            ? `Redeemed on ${new Date(voucher.redeemedAt!).toLocaleDateString("en-GB")}`
            : `Valid until ${new Date(voucher.expiresAt).toLocaleDateString("en-GB")}`}
        </p>

        {/* Help button */}
        {isAvailable && (
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => setShowInstructions(true)}
          >
            <HelpCircle size={20} className="mr-2" />
            How to use this voucher
          </Button>
        )}

        {/* Points earned badge */}
        <div className="mt-4 inline-flex items-center gap-1 text-accent font-bold text-sm">
          <Star size={16} />
          Earned with {threshold} merit points
        </div>
      </Card>

      {/* Instructions overlay */}
      {showInstructions && (
        <InstructionOverlay onClose={() => setShowInstructions(false)} />
      )}
    </>
  );
}
