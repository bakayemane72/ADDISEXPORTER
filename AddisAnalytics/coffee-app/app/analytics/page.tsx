import { AppShell } from "@/components/layout/AppShell";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { QualityAnalytics } from "@/components/analytics/QualityAnalytics";

export default function AnalyticsPage() {
  const tabs = [
    { id: "quality", label: "Quality" },
    { id: "inventory", label: "Inventory" },
    { id: "commercial", label: "Commercial" },
    { id: "operations", label: "Operations" },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display text-text-primary mb-2">
            Analytics
          </h1>
          <p className="text-text-muted">
            Deep insights across quality, inventory, commercial, and operations
          </p>
        </div>

        {/* Tabs */}
        <SegmentedTabs tabs={tabs} defaultTab="quality" />

        {/* Analytics Content */}
        <div className="animate-fade-in">
          <QualityAnalytics />
        </div>
      </div>
    </AppShell>
  );
}
