import { AppShell } from "@/components/layout/AppShell";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display text-text-primary mb-2">
            Settings
          </h1>
          <p className="text-text-muted">
            Manage your organization, users, and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
            <h3 className="text-lg font-heading text-text-primary mb-4">Organization</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-muted">Organization Name</label>
                <input type="text" defaultValue="Addis Coffee Exporters" className="input-field w-full mt-1" />
              </div>
              <div>
                <label className="text-sm text-text-muted">Currency</label>
                <select className="input-field w-full mt-1">
                  <option>USD</option>
                  <option>ETB</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-text-muted">Language</label>
                <select className="input-field w-full mt-1">
                  <option>English</option>
                  <option>Amharic</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
            <h3 className="text-lg font-heading text-text-primary mb-4">Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-muted">Date Format</label>
                <select className="input-field w-full mt-1">
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-text-muted">Time Zone</label>
                <select className="input-field w-full mt-1">
                  <option>East Africa Time (EAT)</option>
                  <option>UTC</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
