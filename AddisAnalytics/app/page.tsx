"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { KPICard } from "@/components/ui/KPICard";
import { AIChat } from "@/components/chat/AIChat";

interface DashboardSummary {
  summary: {
    totalImports: number;
    totalRows: number;
    columnCount: number;
    numericColumnCount: number;
    categoricalColumnCount: number;
    lastImportAt: string | null;
    dataCoveragePct: number;
  };
  metrics: {
    averageQualityScore: number | null;
    totalVolume: number | null;
    totalContractValue: number | null;
    shipmentsInProgress: number;
    shipmentsByStatus: Record<string, number>;
  };
  segments: {
    topRegions: Array<{ name: string; count: number }>;
    topVarieties: Array<{ name: string; count: number }>;
    topProcesses: Array<{ name: string; count: number }>;
  };
  timeline: {
    rowsPerMonth: Array<{ label: string; value: number }>;
  };
  recentImports: Array<{
    id: string;
    fileName: string;
    rowCount: number;
    columnCount: number;
    createdAt: string;
    columns: string[];
  }>;
  dataset: {
    columns: string[];
  };
}

function formatNumber(value: number | null | undefined, options: Intl.NumberFormatOptions = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export default function HomePage() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setDashboard(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const sparklineData = useMemo(() => {
    return dashboard?.timeline.rowsPerMonth.map((point) => point.value) ?? [];
  }, [dashboard]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-muted">Loading enterprise overview…</div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="space-y-4">
          <h1 className="text-3xl font-display text-text-primary">Overview</h1>
          <div className="bg-bg-card border border-border rounded-card p-6 text-error">{error}</div>
        </div>
      </AppShell>
    );
  }

  if (!dashboard) {
    return (
      <AppShell>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-display text-text-primary mb-2">Overview</h1>
            <p className="text-text-muted">Import your first dataset to unlock analytics, AI copilots, and reporting.</p>
          </div>
          <div className="bg-bg-card rounded-card border border-border shadow-default p-12 text-center">
            <div className="text-6xl mb-4">📥</div>
            <h3 className="text-xl font-heading text-text-primary mb-2">No data yet</h3>
            <p className="text-sm text-text-muted">Upload an Excel, CSV, or JSON file from the Upload dialog to get started.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const hasData = dashboard.summary.totalRows > 0;

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-display text-text-primary">Executive Overview</h1>
          <p className="text-text-muted max-w-2xl">
            Addis Enterprise Analytics unifies ingest, operational intelligence, and AI copilots into a single control tower. Below is your live performance snapshot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <KPICard
            title="Datasets"
            value={dashboard.summary.totalImports.toLocaleString()}
            lastUpdated={dashboard.summary.lastImportAt ? new Date(dashboard.summary.lastImportAt).toLocaleDateString() : "Awaiting upload"}
            sparklineData={sparklineData}
          />
          <KPICard
            title="Rows Processed"
            value={dashboard.summary.totalRows.toLocaleString()}
            lastUpdated={`Data coverage ${dashboard.summary.dataCoveragePct}%`}
            sparklineData={sparklineData}
          />
          <KPICard
            title="Active Shipments"
            value={dashboard.metrics.shipmentsInProgress.toLocaleString()}
            sparklineData={Object.values(dashboard.metrics.shipmentsByStatus)}
            lastUpdated={`Statuses: ${Object.keys(dashboard.metrics.shipmentsByStatus).length}`}
          />
          <KPICard
            title="Avg Quality Score"
            value={formatNumber(dashboard.metrics.averageQualityScore)}
            sparklineData={sparklineData}
            lastUpdated={`Columns profiled: ${dashboard.summary.columnCount}`}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-bg-card rounded-card border border-border shadow-default p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-heading text-text-primary">Recent Imports</h2>
                <p className="text-sm text-text-muted">Latest data packages and their coverage</p>
              </div>
              <button onClick={fetchDashboard} className="btn-secondary text-xs px-4 py-2">Refresh</button>
            </div>
            {!hasData ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📊</div>
                <p className="text-text-muted">No imports yet.</p>
                <p className="text-sm text-text-muted mt-1">Upload a dataset to populate analytics.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard.recentImports.map((imp) => (
                  <div key={imp.id} className="p-4 rounded-card bg-bg-surface border border-border/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-text-primary">{imp.fileName}</h3>
                      <p className="text-xs text-text-muted mt-1">
                        {imp.rowCount.toLocaleString()} rows • {imp.columnCount} fields
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-text-muted">
                      {imp.columns.slice(0, 4).map((col) => (
                        <span key={col} className="px-3 py-1 rounded-pill bg-bg-base border border-border/70">
                          {col}
                        </span>
                      ))}
                      {imp.columns.length > 4 && (
                        <span className="px-3 py-1 rounded-pill bg-bg-base border border-border/70">
                          +{imp.columns.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
            <h2 className="text-xl font-heading text-text-primary mb-6">Operational Signals</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-text-muted mb-1">Shipments by status</p>
                <div className="space-y-2">
                  {Object.entries(dashboard.metrics.shipmentsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="uppercase tracking-wide text-text-muted">{status.replace(/_/g, " ")}</span>
                      <span className="text-text-primary font-medium">{count.toLocaleString()}</span>
                    </div>
                  ))}
                  {Object.keys(dashboard.metrics.shipmentsByStatus).length === 0 && (
                    <p className="text-text-muted text-sm">No shipments logged yet.</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">Top regions</p>
                <div className="space-y-2">
                  {dashboard.segments.topRegions.length > 0 ? (
                    dashboard.segments.topRegions.map((region) => (
                      <div key={region.name} className="flex items-center justify-between text-sm">
                        <span className="text-text-primary">{region.name}</span>
                        <span className="text-text-muted">{region.count.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-muted text-sm">Region data not detected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
            <h2 className="text-xl font-heading text-text-primary mb-6">Monthly Activity</h2>
            {dashboard.timeline.rowsPerMonth.length === 0 ? (
              <p className="text-text-muted text-sm">We need a date column to chart activity. Try adding shipment or harvest dates to your uploads.</p>
            ) : (
              <div className="space-y-3">
                {dashboard.timeline.rowsPerMonth.map((point) => (
                  <div key={point.label} className="flex items-center justify-between text-sm">
                    <span className="text-text-primary">{point.label}</span>
                    <span className="text-text-muted">{point.value.toLocaleString()} rows</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-[520px]">
            <AIChat />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
