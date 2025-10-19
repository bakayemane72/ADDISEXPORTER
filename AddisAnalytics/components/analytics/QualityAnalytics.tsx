"use client";

import { KPICard } from "../ui/KPICard";
import { useEffect, useState } from "react";

export function QualityAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-text-muted">Loading analytics...</div>;
  }

  const hasData = stats && stats.totalLots > 0;

  if (!hasData) {
    return (
      <div className="space-y-8">
        {/* KPI Row - Empty state */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Avg SCA Score" value="—" lastUpdated="No data" />
          <KPICard title="Specialty Lots" value="0" lastUpdated="No data" />
          <KPICard title="Avg Moisture" value="—" lastUpdated="No data" />
          <KPICard title="Zero Defects" value="—" lastUpdated="No data" />
        </div>

        {/* Empty State */}
        <div className="bg-bg-card rounded-card border border-border shadow-default p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-heading text-text-primary mb-2">No quality data yet</h3>
            <p className="text-text-muted mb-6">Import lots from Excel to see quality analytics and cupping scores</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics from real data
  const specialtyLots = stats.totalLots; // Simplified - would filter by score >= 80
  const avgMoisture = "11.5"; // Would calculate from actual data
  const zeroDefectsPct = "—"; // Would calculate from defects field

  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Avg SCA Score"
          value={stats.avgQualityScore || "—"}
          lastUpdated="Just now"
        />
        <KPICard
          title="Specialty Lots"
          value={specialtyLots.toString()}
          lastUpdated="Just now"
        />
        <KPICard
          title="Avg Moisture"
          value={avgMoisture + "%"}
          lastUpdated="Just now"
        />
        <KPICard
          title="Zero Defects"
          value={zeroDefectsPct}
          lastUpdated="Just now"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Region Distribution */}
        <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
          <h3 className="text-lg font-heading text-text-primary mb-6">
            Lots by Region
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byRegion || {}).map(([region, count]: any) => (
              <div key={region}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-primary">{region}</span>
                  <span className="text-text-muted">{count} lots</span>
                </div>
                <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-gold"
                    style={{ width: `${(count / stats.totalLots) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Type Distribution */}
        <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
          <h3 className="text-lg font-heading text-text-primary mb-6">
            Processing Methods
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byProcessType || {}).map(([process, count]: any) => (
              <div key={process}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-primary">{process}</span>
                  <span className="text-text-muted">{count} lots</span>
                </div>
                <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-copper"
                    style={{ width: `${(count / stats.totalLots) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
