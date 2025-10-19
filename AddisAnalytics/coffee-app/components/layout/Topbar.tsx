"use client";

import { Search, Bell, User, Globe } from "lucide-react";
import { useState } from "react";

export function Topbar() {
  const [locale, setLocale] = useState("en");

  return (
    <header className="h-12 bg-bg-surface border-b border-border flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search lots, buyers, documents... (⌘K)"
            className="w-full bg-bg-card text-text-primary pl-10 pr-4 py-1.5 rounded-input text-sm border border-border focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Locale Switcher */}
        <button
          onClick={() => setLocale(locale === "en" ? "am" : "en")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-input hover:bg-bg-card transition-colors"
        >
          <Globe className="w-4 h-4 text-text-muted" />
          <span className="text-sm text-text-muted uppercase">{locale}</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-bg-card rounded-input transition-colors">
          <Bell className="w-5 h-5 text-text-muted" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-gold rounded-full"></span>
        </button>

        {/* User Menu */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-input hover:bg-bg-card transition-colors">
          <div className="w-6 h-6 bg-accent-copper rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-bg-base" />
          </div>
          <span className="text-sm text-text-primary">Admin</span>
        </button>
      </div>
    </header>
  );
}
