"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Save, ShieldCheck, Bell } from "lucide-react";

type Preferences = {
  organization: string;
  currency: string;
  timezone: string;
  notifications: boolean;
  complianceMode: boolean;
};

const DEFAULTS: Preferences = {
  organization: "Addis Coffee Collective",
  currency: "USD",
  timezone: "Africa/Addis_Ababa",
  notifications: true,
  complianceMode: true,
};

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULTS);
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Settings saved locally. Persist to your production database by wiring this form to the admin API.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-display text-text-primary">Control Centre</h1>
          <p className="text-text-muted max-w-3xl">
            Configure brand, compliance, and notification policies before rolling the analytics portal to exporters and buyers.
            Wire these controls to your production identity provider or admin API for persistence.
          </p>
          {status && (
            <div className="bg-success/10 border border-success/30 text-success text-sm rounded-card p-4">{status}</div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-bg-card rounded-card border border-border shadow-default p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-accent-gold" />
              <div>
                <h2 className="text-lg font-heading text-text-primary">Organisation profile</h2>
                <p className="text-xs text-text-muted">
                  Establish baseline metadata—future integrations can sync this with ERP or CRM systems.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-text-muted block mb-1">Organisation name</label>
                <input
                  type="text"
                  value={preferences.organization}
                  onChange={(event) => handleChange("organization", event.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-sm text-text-muted block mb-1">Reporting currency</label>
                <select
                  value={preferences.currency}
                  onChange={(event) => handleChange("currency", event.target.value)}
                  className="input-field w-full"
                >
                  <option value="USD">USD – US Dollar</option>
                  <option value="EUR">EUR – Euro</option>
                  <option value="ETB">ETB – Ethiopian Birr</option>
                  <option value="JPY">JPY – Japanese Yen</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-text-muted block mb-1">Timezone</label>
                <select
                  value={preferences.timezone}
                  onChange={(event) => handleChange("timezone", event.target.value)}
                  className="input-field w-full"
                >
                  <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
                  <option value="Europe/Hamburg">Europe/Hamburg</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-bg-card rounded-card border border-border shadow-default p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-accent-gold" />
              <div>
                <h2 className="text-lg font-heading text-text-primary">Notifications &amp; compliance</h2>
                <p className="text-xs text-text-muted">
                  Decide which alerts are surfaced to leadership and whether export-ready documents require dual approval.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between bg-bg-surface border border-border/60 rounded-card px-4 py-3 text-sm text-text-primary">
                <span>
                  Executive briefing emails
                  <span className="block text-xs text-text-muted">
                    Weekly portfolio snapshot including quality scores, shipment risk, and commercial signals.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(event) => handleChange("notifications", event.target.checked)}
                  className="w-5 h-5 accent-accent-gold"
                />
              </label>
              <label className="flex items-center justify-between bg-bg-surface border border-border/60 rounded-card px-4 py-3 text-sm text-text-primary">
                <span>
                  Compliance lockstep mode
                  <span className="block text-xs text-text-muted">
                    Require dual approval for edits to shipment milestones and restrict document downloads to encrypted channels.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={preferences.complianceMode}
                  onChange={(event) => handleChange("complianceMode", event.target.checked)}
                  className="w-5 h-5 accent-accent-gold"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save configuration
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
