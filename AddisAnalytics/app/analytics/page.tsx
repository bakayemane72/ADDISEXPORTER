"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { DataCharts } from "@/components/visualizations/DataCharts";

interface DatasetProfile {
  imports: Array<{
    id: string;
    fileName: string;
    rowCount: number;
    columns: string[];
    createdAt: string;
  }>;
  rows: Array<{
    id: string;
    importId: string;
    createdAt: string;
    data: Record<string, unknown>;
  }>;
  columns: string[];
  numericColumns: string[];
  categoricalColumns: string[];
  dateColumns: string[];
  columnProfiles: Record<string, {
    type: "numeric" | "categorical" | "date";
    uniqueValues: number;
    sampleValues: string[];
  }>;
}

export default function AnalyticsPage() {
  const [dataset, setDataset] = useState<DatasetProfile | null>(null);
  const [selectedImport, setSelectedImport] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDataset();
  }, []);

  const fetchDataset = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/data");
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setDataset(data);
        setSelectedImport("all");
      }
    } catch (err: any) {
      setError(err.message || "Unable to load analytics dataset");
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (!dataset) return [];
    if (selectedImport === "all") return dataset.rows;
    return dataset.rows.filter((row) => row.importId === selectedImport);
  }, [dataset, selectedImport]);

  const activeImport = useMemo(() => {
    if (!dataset || selectedImport === "all") return null;
    return dataset.imports.find((imp) => imp.id === selectedImport) || null;
  }, [dataset, selectedImport]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-muted">Profiling datasets…</div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="space-y-4">
          <h1 className="text-3xl font-display text-text-primary">Analytics &amp; Visualizations</h1>
          <div className="bg-bg-card border border-border rounded-card p-6 text-error">{error}</div>
        </div>
      </AppShell>
    );
  }

  if (!dataset || dataset.rows.length === 0) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-display text-text-primary mb-2">Analytics &amp; Visualizations</h1>
            <p className="text-text-muted">Ingest structured data to unlock interactive dashboards.</p>
          </div>
          <div className="bg-bg-card rounded-card border border-border shadow-default p-12 text-center">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-xl font-heading text-text-primary mb-2">No rows detected</h3>
            <p className="text-sm text-text-muted">Upload an Excel, CSV, or JSON file from the overview page to begin exploring analytics.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-display text-text-primary">Analytics &amp; Visualizations</h1>
          <p className="text-text-muted max-w-3xl">
            Discover patterns, anomalies, and commercial opportunities across every upload. Select a dataset to pivot by region, process, quality score, or any field captured in your spreadsheets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="text-sm text-text-muted block mb-1">Dataset scope</label>
            <select
              value={selectedImport}
              onChange={(event) => setSelectedImport(event.target.value)}
              className="input-field w-full"
            >
              <option value="all">All imports ({dataset.rows.length.toLocaleString()} rows)</option>
              {dataset.imports.map((imp) => (
                <option key={imp.id} value={imp.id}>
                  {imp.fileName} — {imp.rowCount.toLocaleString()} rows
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-text-muted block mb-1">Columns detected</label>
            <div className="bg-bg-card border border-border rounded-card p-4 text-sm text-text-primary">
              <p><span className="text-text-muted">Total:</span> {dataset.columns.length}</p>
              <p><span className="text-text-muted">Numeric:</span> {dataset.numericColumns.length}</p>
              <p><span className="text-text-muted">Categorical:</span> {dataset.categoricalColumns.length}</p>
            </div>
          </div>
          <div>
            <label className="text-sm text-text-muted block mb-1">Sample fields</label>
            <div className="bg-bg-card border border-border rounded-card p-4 text-xs text-text-muted space-y-1 max-h-32 overflow-y-auto">
              {dataset.columns.slice(0, 12).map((column) => (
                <div key={column} className="truncate">{column}</div>
              ))}
            </div>
          </div>
        </div>

        {activeImport && (
          <div className="bg-bg-card border border-border rounded-card p-6 shadow-default">
            <h3 className="text-lg font-heading text-text-primary mb-2">Focused dataset</h3>
            <p className="text-sm text-text-muted mb-4">{activeImport.fileName} — {activeImport.rowCount.toLocaleString()} rows uploaded {new Date(activeImport.createdAt).toLocaleDateString()}</p>
            <div className="flex flex-wrap gap-2 text-xs text-text-muted">
              {activeImport.columns.slice(0, 8).map((col) => (
                <span key={col} className="px-3 py-1 rounded-pill bg-bg-surface border border-border/60">{col}</span>
              ))}
            </div>
          </div>
        )}

        <DataCharts dataset={dataset} selectedImportId={selectedImport} />

        <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
          <h3 className="text-lg font-heading text-text-primary mb-4">Data health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-text-muted mb-1">Rows in scope</p>
              <p className="text-2xl font-semibold text-text-primary">{filteredRows.length.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-text-muted mb-1">Distinct fields</p>
              <p className="text-2xl font-semibold text-text-primary">{dataset.columns.length}</p>
            </div>
            <div>
              <p className="text-text-muted mb-1">Date columns detected</p>
              <p className="text-2xl font-semibold text-text-primary">{dataset.dateColumns.length}</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
