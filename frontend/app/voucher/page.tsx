"use client";

// ============================================================
// OwnMerit - QR Voucher Page
// ============================================================

import { useEffect, useState } from "react";
import { BottomNavigation, TopBar } from "@/components/ui/Navigation";
import { QRVoucher } from "@/components/voucher/QRVoucher";
import { Card } from "@/components/ui/Card";
import { MOCK_VOUCHERS, MOCK_MERIT_PROGRESS } from "@/lib/mockData";
import type { Voucher } from "@/lib/types";
import { Gift, History } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getApiBaseUrl, getAuthHeader } from "@/lib/auth";

export default function VoucherPage() {
  const [currentPoints] = useState(MOCK_MERIT_PROGRESS.currentPoints);
  const { auth, checking } = useRequireAuth();
  const [points, setPoints] = useState(currentPoints);
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(
    MOCK_VOUCHERS.find((v) => v.status === "available") || null
  );
  const [pastVouchers, setPastVouchers] = useState<Voucher[]>(
    MOCK_VOUCHERS.filter((v) => v.status !== "available")
  );

  useEffect(() => {
    if (checking) {
      return;
    }
    const load = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/progress/me`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as {
          approved_submissions: number;
          pending_submissions: number;
        };
        setPoints(data.approved_submissions * 10 + data.pending_submissions * 2);

        const rewardsResponse = await fetch(`${getApiBaseUrl()}/rewards/me`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });
        if (rewardsResponse.ok) {
          const rewardsData = (await rewardsResponse.json()) as {
            items: Array<{
              reward_id: string;
              voucher_code: string;
              status: string;
              assigned_at: string;
              expires_at?: string;
              value?: number;
              currency?: string;
              retailer?: string;
            }>;
          };

          const mapped = rewardsData.items.map<Voucher>((reward) => {
            const status =
              reward.status === "assigned"
                ? "available"
                : reward.status === "redeemed"
                ? "redeemed"
                : "expired";
            return {
              id: reward.reward_id,
              code: reward.voucher_code,
              value: reward.value ?? 10,
              currency: reward.currency ?? "GBP",
              expiresAt:
                reward.expires_at ||
                new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
              status,
              retailer: reward.retailer ?? "Tesco",
            };
          });

          const available = mapped.find((voucher) => voucher.status === "available") || null;
          const past = mapped.filter((voucher) => voucher.status !== "available");
          setActiveVoucher(available);
          setPastVouchers(past);
        }
      } catch {
        // Keep mock points fallback.
      }
    };
    void load();
  }, [checking]);

  if (checking || !auth) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="max-w-lg mx-auto">
          <Card>
            <p className="text-text-secondary">Checking session...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar title="Rewards" />

      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {/* Active voucher / locked state */}
        <QRVoucher
          voucher={activeVoucher}
          currentPoints={points}
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
