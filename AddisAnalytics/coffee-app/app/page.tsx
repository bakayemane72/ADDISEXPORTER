import { AppShell } from "@/components/layout/AppShell";
import { KPICard } from "@/components/ui/KPICard";
import { RecentLotsTable } from "@/components/tables/RecentLotsTable";
import { ShipmentTimeline } from "@/components/widgets/ShipmentTimeline";

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display text-text-primary mb-2">
            Overview
          </h1>
          <p className="text-text-muted">
            Enterprise coffee export analytics at a glance
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Lots"
            value="127"
            delta="+12%"
            sparklineData={[45, 52, 61, 73, 85, 98, 110, 127]}
            lastUpdated="2 hours ago"
          />
          <KPICard
            title="Active Shipments"
            value="24"
            delta="+5"
            sparklineData={[15, 18, 19, 22, 20, 23, 24, 24]}
            lastUpdated="30 min ago"
          />
          <KPICard
            title="Avg Quality Score"
            value="86.5"
            delta="+2.1"
            sparklineData={[84.2, 84.8, 85.1, 85.6, 86.0, 86.2, 86.3, 86.5]}
            lastUpdated="1 hour ago"
          />
          <KPICard
            title="Revenue (USD)"
            value="$2.4M"
            delta="+18%"
            sparklineData={[1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.35, 2.4]}
            lastUpdated="4 hours ago"
          />
        </div>

        {/* Recent Lots Table */}
        <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-heading text-text-primary">
              Recent Lots
            </h2>
            <button className="btn-secondary">View All</button>
          </div>
          <RecentLotsTable />
        </div>

        {/* Shipment Timeline */}
        <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
          <h2 className="text-xl font-heading text-text-primary mb-6">
            Shipment Timeline
          </h2>
          <ShipmentTimeline />
        </div>
      </div>
    </AppShell>
  );
}
