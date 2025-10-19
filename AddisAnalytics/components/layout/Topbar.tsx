"use client";

import { Search, Bell, User, Globe, Upload } from "lucide-react";
import { useState } from "react";
import { ImportModal } from "@/components/modals/ImportModal";

export function Topbar() {
  const [locale, setLocale] = useState("en");
  const [showImportModal, setShowImportModal] = useState(false);

  return (
    <header className="h-12 bg-bg-surface border-b border-border flex items-center justify-between px-6">
      {/* Brand */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-text-primary">ADDIS Exports Analytics</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Import Button */}
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-input bg-accent-gold text-bg-base hover:bg-accent-copper transition-colors font-medium text-sm"
        >
          <Upload className="w-4 h-4" />
          Import Data
        </button>

        {/* Import Modal */}
        <ImportModal 
          isOpen={showImportModal} 
          onClose={() => setShowImportModal(false)} 
        />

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
