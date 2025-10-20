"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Coffee,
  Ship,
  BarChart3,
  FileText,
  Settings
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/" },
  { icon: Coffee, label: "Lots", href: "/lots" },
  { icon: Ship, label: "Shipments", href: "/shipments" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-20 bg-bg-surface border-r border-border flex flex-col items-center py-6 gap-8">
      {/* Logo */}
      <div className="w-10 h-10 bg-gradient-to-br from-accent-gold to-accent-copper rounded-xl flex items-center justify-center">
        <Image
          src="/addis-exporter-logo.svg"
          alt="Addis Exporter logo"
          width={28}
          height={28}
          className="h-7 w-7 object-contain"
          priority
        />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group relative w-12 h-12 flex items-center justify-center rounded-xl
                transition-all duration-200
                ${isActive 
                  ? "bg-accent-gold/10 text-accent-gold" 
                  : "text-text-muted hover:bg-bg-card hover:text-text-primary"
                }
              `}
              title={item.label}
            >
              {item.label === "Lots" ? (
                <Image
                  src="/addis-exporter-logo.svg"
                  alt="Addis Exporter logo"
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                  priority
                />
              ) : (
                Icon && <Icon className="w-5 h-5" />
              )}
              
              {/* Tooltip */}
              <span className="absolute left-full ml-4 px-3 py-2 bg-bg-card border border-border rounded-input text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
