"use client";

import { AppShell } from "@/components/layout/AppShell";
import { KPICard } from "@/components/ui/KPICard";
import { AIChat } from "@/components/chat/AIChat";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [imports, setImports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/data");
      const data = await response.json();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setImports(data);
      } else {
        setImports([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setImports([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-muted">Loading...</div>
        </div>
      </AppShell>
    );
  }

  const totalRows = Array.isArray(imports) ? imports.reduce((sum, imp) => sum + imp.rowCount, 0) : 0;
  const hasData = totalRows > 0;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display text-text-primary mb-2">
            Overview
          </h1>
          <p className="text-text-muted">
            Enterprise coffee export analytics with AI assistance
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Imports"
            value={hasData ? imports.length.toString() : "0"}
            lastUpdated={hasData ? "Just now" : "No data"}
          />
          <KPICard
            title="Total Rows"
            value={hasData ? totalRows.toString() : "0"}
            lastUpdated={hasData ? "Just now" : "No data"}
          />
          <KPICard
            title="Files Uploaded"
            value={hasData ? imports.length.toString() : "0"}
            lastUpdated={hasData ? "Just now" : "No data"}
          />
          <KPICard
            title="AI Insights"
            value="Active"
            lastUpdated={hasData ? "Ready" : "Awaiting data"}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Imports */}
          <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
            <h2 className="text-xl font-heading text-text-primary mb-6">
              Recent Imports
            </h2>
            {!hasData ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">📊</div>
                <p className="text-text-muted">No imports yet</p>
                <p className="text-sm text-text-muted mt-1">Upload an Excel file to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {imports.slice(0, 5).map((imp) => {
                  let columnCount = 0;
                  try {
                    const cols = typeof imp.columns === 'string' ? JSON.parse(imp.columns) : imp.columns;
                    columnCount = Array.isArray(cols) ? cols.length : 0;
                  } catch (e) {
                    columnCount = 0;
                  }
                  return (
                    <div key={imp.id} className="flex items-center justify-between p-3 bg-bg-surface rounded-card">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{imp.fileName}</p>
                        <p className="text-xs text-text-muted">{imp.rowCount} rows • {columnCount} columns</p>
                      </div>
                      <span className="px-2 py-1 rounded-pill bg-success/10 text-success text-xs border border-success/30">
                        Imported
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Chat */}
          <div className="h-[500px]">
            <AIChat />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
