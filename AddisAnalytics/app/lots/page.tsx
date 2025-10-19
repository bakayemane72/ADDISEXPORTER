"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

interface DatasetProfile {
  imports: Array<{
    id: string;
    fileName: string;
    rowCount: number;
    columns: string[];
  }>;
  rows: Array<{
    id: string;
    importId: string;
    data: Record<string, unknown>;
  }>;
  columns: string[];
}

export default function LotsPage() {
  const [dataset, setDataset] = useState<DatasetProfile | null>(null);
  const [selectedImport, setSelectedImport] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<number>(8);

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
      setError(err.message || "Failed to load dataset");
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => {
    if (!dataset) return [];
    return dataset.columns.slice(0, visibleColumns);
  }, [dataset, visibleColumns]);

  const filteredRows = useMemo(() => {
    if (!dataset) return [];
    if (selectedImport === "all") {
      return dataset.rows;
    }
    return dataset.rows.filter((row) => row.importId === selectedImport);
  }, [dataset, selectedImport]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-muted">Loading data…</div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="space-y-4">
          <h1 className="text-3xl font-display text-text-primary">Data Browser</h1>
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
            <h1 className="text-3xl font-display text-text-primary mb-2">Data Browser</h1>
            <p className="text-text-muted">Import a dataset to explore rows and metadata.</p>
          </div>
          <div className="bg-bg-card rounded-card border border-border shadow-default p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-heading text-text-primary mb-2">No records available</h3>
            <p className="text-sm text-text-muted">Upload from the Overview page and return here to inspect the raw rows.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-text-primary mb-2">Data Browser</h1>
            <p className="text-text-muted">
              Viewing {filteredRows.length.toLocaleString()} rows out of {dataset.rows.length.toLocaleString()} total
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={selectedImport}
              onChange={(event) => setSelectedImport(event.target.value)}
              className="input-field"
            >
              <option value="all">All imports</option>
              {dataset.imports.map((imp) => (
                <option key={imp.id} value={imp.id}>
                  {imp.fileName} ({imp.rowCount.toLocaleString()} rows)
                </option>
              ))}
            </select>
            <select
              value={visibleColumns}
              onChange={(event) => setVisibleColumns(Number(event.target.value))}
              className="input-field"
            >
              {[6, 8, 10, 12, dataset.columns.length].map((count) => (
                <option key={count} value={count}>
                  Show {count === dataset.columns.length ? "all" : count} columns
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-bg-card rounded-card border border-border shadow-default overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-surface/40">
                  {columns.map((col) => (
                    <th key={col} className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.slice(0, 200).map((row) => (
                  <tr key={row.id} className="border-b border-border/50 hover:bg-bg-surface transition-colors">
                    {columns.map((col) => {
                      const value = row.data[col];
                      const displayValue = value === null || value === undefined || value === "" ? "—" : String(value);
                      return (
                        <td key={col} className="py-3 px-6 text-sm text-text-primary whitespace-nowrap">
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRows.length > 200 && (
            <div className="text-xs text-text-muted p-3 border-t border-border/60 text-right">
              Showing first 200 rows. Refine your import selection to view more.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
