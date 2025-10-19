"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FileText, Download, RefreshCw } from "lucide-react";

type ImportRecord = {
  id: string;
  fileName: string;
  fileType: string;
  rowCount: number;
  columns: string[];
  createdAt: string;
  updatedAt: string;
};

type DatasetProfile = {
  imports: ImportRecord[];
  rows: Array<{ id: string; importId: string }>;
};

function formatTimestamp(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function DocumentsPage() {
  const [dataset, setDataset] = useState<DatasetProfile | null>(null);
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
      }
    } catch (err: any) {
      setError(err.message || "Failed to load document registry");
    } finally {
      setLoading(false);
    }
  };

  const totalColumns = useMemo(() => {
    if (!dataset) return 0;
    const unique = new Set<string>();
    for (const imp of dataset.imports) {
      imp.columns.forEach((column) => unique.add(column));
    }
    return unique.size;
  }, [dataset]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-muted flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Syncing document catalogue…
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="space-y-4">
          <h1 className="text-3xl font-display text-text-primary">Document Control</h1>
          <div className="bg-bg-card border border-border rounded-card p-6 text-error">{error}</div>
        </div>
      </AppShell>
    );
  }

  const imports = dataset?.imports ?? [];

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-display text-text-primary">Document Control</h1>
          <p className="text-text-muted max-w-3xl">
            Every uploaded spreadsheet becomes a controlled digital asset. Review lineage, sample the schema, and download a JSON snapshot for audit or BI pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-bg-card rounded-card border border-border shadow-default p-5">
            <p className="text-xs text-text-muted uppercase">Imports tracked</p>
            <p className="text-3xl font-display text-text-primary">{imports.length}</p>
          </div>
          <div className="bg-bg-card rounded-card border border-border shadow-default p-5">
            <p className="text-xs text-text-muted uppercase">Rows catalogued</p>
            <p className="text-3xl font-display text-text-primary">{dataset?.rows.length.toLocaleString() ?? "0"}</p>
          </div>
          <div className="bg-bg-card rounded-card border border-border shadow-default p-5">
            <p className="text-xs text-text-muted uppercase">Distinct fields</p>
            <p className="text-3xl font-display text-text-primary">{totalColumns}</p>
          </div>
        </div>

        {imports.length === 0 ? (
          <div className="bg-bg-card rounded-card border border-border shadow-default p-12 text-center">
            <div className="text-6xl mb-4">🗂️</div>
            <h3 className="text-xl font-heading text-text-primary mb-2">No source documents yet</h3>
            <p className="text-sm text-text-muted">
              Upload Excel, CSV, or JSON exports from the overview page to build your audit-ready document registry.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {imports.map((imp) => (
              <div key={imp.id} className="bg-bg-card rounded-card border border-border shadow-default p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-gold/10 flex items-center justify-center text-accent-gold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-heading text-text-primary">{imp.fileName}</h2>
                      <p className="text-sm text-text-muted">
                        {imp.fileType.toUpperCase()} • {imp.rowCount.toLocaleString()} rows • {imp.columns.length} fields
                      </p>
                      <p className="text-xs text-text-muted mt-2">
                        Ingested {formatTimestamp(imp.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const payload = JSON.stringify(
                        {
                          id: imp.id,
                          fileName: imp.fileName,
                          fileType: imp.fileType,
                          rowCount: imp.rowCount,
                          columns: imp.columns,
                          createdAt: imp.createdAt,
                          updatedAt: imp.updatedAt,
                        },
                        null,
                        2,
                      );
                      const blob = new Blob([payload], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const anchor = document.createElement("a");
                      anchor.href = url;
                      anchor.download = `${imp.fileName.replace(/\.[^.]+$/, "") || "dataset"}-metadata.json`;
                      anchor.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="btn-secondary flex items-center gap-2 text-xs self-start"
                  >
                    <Download className="w-4 h-4" />
                    Download metadata
                  </button>
                </div>
                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-xs text-text-muted uppercase mb-2">Sample columns</p>
                  <div className="flex flex-wrap gap-2 text-xs text-text-muted">
                    {imp.columns.slice(0, 10).map((column) => (
                      <span key={column} className="px-3 py-1 rounded-pill bg-bg-surface border border-border/60">
                        {column}
                      </span>
                    ))}
                    {imp.columns.length > 10 && (
                      <span className="px-3 py-1 rounded-pill bg-bg-surface border border-border/60">
                        +{imp.columns.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
