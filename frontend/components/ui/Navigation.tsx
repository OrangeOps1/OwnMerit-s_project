"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardCheck,
  TrendingUp,
  Gift,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/proof", label: "Tasks", icon: ClipboardCheck },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/voucher", label: "Rewards", icon: Gift },
  { href: "/admin", label: "Staff", icon: Settings },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border shadow-lg"
      role="navigation"
      aria-label="Main navigation"
    >
      <ul className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex flex-col items-center justify-center
                  py-3 px-4
                  min-h-[64px] min-w-[64px]
                  transition-colors duration-200
                  touch-target
                  ${
                    isActive
                      ? "text-primary"
                      : "text-text-muted hover:text-text-secondary"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
                <span
                  className={`text-xs mt-1 font-medium ${
                    isActive ? "font-bold" : ""
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function TopBar({
  title,
  showBack = false,
  onBack,
}: {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-primary-light transition-colors touch-target"
            aria-label="Go back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-bold text-text-primary">{title}</h1>
      </div>
    </header>
  );
}
