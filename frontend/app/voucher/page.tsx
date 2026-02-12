"use client";

// ============================================================
// OwnMerit - QR Voucher Page
// ============================================================

import { useState } from "react";
import { BottomNavigation, TopBar } from "@/components/ui/Navigation";
import { QRVoucher } from "@/components/voucher/QRVoucher";
import { Card } from "@/components/ui/Card";
import { MOCK_VOUCHERS, MOCK_MERIT_PROGRESS } from "@/lib/mockData";
import type { Voucher } from "@/lib/types";
import { Gift, History, ChevronRight } from "lucide-react";

export default function VoucherPage() {
  const [currentPoints] = useState(MOCK_MERIT_PROGRESS.currentPoints);

  // Show active voucher or most recent
  const activeVoucher =
    MOCK_VOUCHERS.find((v) => v.status === "available") || null;

  const pastVouchers = MOCK_VOUCHERS.filter(
    (v) => v.status !== "available"
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar title="Rewards" />

      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {/* Active voucher / locked state */}
        <QRVoucher
          voucher={activeVoucher}
          currentPoints={currentPoints}
        />

        {/* Past vouchers */}
        {pastVouchers.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
              <History size={18} className="text-text-secondary" />
              Past Vouchers
            </h2>
            <div className="space-y-2">
              {pastVouchers.map((voucher) => (
                <Card key={voucher.id} padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                      <Gift size={18} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary text-sm">
                        £{voucher.value} - {voucher.retailer}
                      </p>
                      <p className="text-xs text-text-muted">
                        {voucher.status === "redeemed"
                          ? `Used on ${new Date(voucher.redeemedAt!).toLocaleDateString("en-GB")}`
                          : `Expired ${new Date(voucher.expiresAt).toLocaleDateString("en-GB")}`}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        voucher.status === "redeemed"
                          ? "bg-success-light text-success"
                          : "bg-danger-light text-danger"
                      }`}
                    >
                      {voucher.status === "redeemed" ? "Used" : "Expired"}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
