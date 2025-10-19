"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DataCharts } from "@/components/visualizations/DataCharts";
import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [imports, setImports] = useState<any[]>([]);
  const [selectedImport, setSelectedImport] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/data");
      const data = await response.json();
      setImports(data);
      if (data.length > 0) {
        setSelectedImport(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-muted">Loading analytics...</div>
        </div>
      </AppShell>
    );
  }

  if (imports.length === 0) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-display text-text-primary mb-2">
              Analytics & Visualizations
            </h1>
            <p className="text-text-muted">Data insights and charts</p>
          </div>
          <div className="bg-bg-card rounded-card border border-border shadow-default p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-text-primary mb-2">No data to analyze</h3>
              <p className="text-sm text-text-muted">Import an Excel file to see visualizations and insights</p>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const currentImport = imports.find((imp) => imp.id === selectedImport);
  const columns = currentImport ? JSON.parse(currentImport.columns) : [];
  const data = currentImport?.rows.map((row: any) => row.data) || [];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display text-text-primary mb-2">
            Analytics & Visualizations
          </h1>
          <p className="text-text-muted">
            Interactive charts and data insights
          </p>
        </div>

        {/* Import Selector */}
        <div>
          <label className="text-sm text-text-muted mb-2 block">Select Dataset</label>
          <select
            value={selectedImport}
            onChange={(e) => setSelectedImport(e.target.value)}
            className="input-field max-w-md"
          >
            {imports.map((imp) => (
              <option key={imp.id} value={imp.id}>
                {imp.fileName} ({imp.rowCount} rows)
              </option>
            ))}
          </select>
        </div>

        {/* Charts */}
        <DataCharts data={data} columns={columns} />
      </div>
    </AppShell>
  );
}
