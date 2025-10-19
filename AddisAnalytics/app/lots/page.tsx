"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useEffect, useState } from "react";

export default function LotsPage() {
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
          <div className="text-text-muted">Loading data...</div>
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
              Data Browser
            </h1>
            <p className="text-text-muted">View all your imported data</p>
          </div>
          <div className="bg-bg-card rounded-card border border-border shadow-default p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-text-primary mb-2">No data yet</h3>
              <p className="text-sm text-text-muted">Import an Excel file to see your data here</p>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const currentImport = imports.find((imp) => imp.id === selectedImport);
  
  // Safely parse columns with error handling
  const columns = currentImport ? (() => {
    try {
      const parsed = typeof currentImport.columns === 'string' 
        ? JSON.parse(currentImport.columns) 
        : currentImport.columns;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Error parsing columns:", e);
      return [];
    }
  })() : [];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-text-primary mb-2">
              Data Browser
            </h1>
            <p className="text-text-muted">
              Viewing {currentImport?.rowCount || 0} rows from {currentImport?.fileName || ""}
            </p>
          </div>
        </div>

        {/* Import Selector */}
        <div>
          <label className="text-sm text-text-muted mb-2 block">Select Import</label>
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

        {/* Data Table */}
        <div className="bg-bg-card rounded-card border border-border shadow-default overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-surface/50">
                  {columns.map((col: string) => (
                    <th key={col} className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentImport?.rows.map((row: any) => {
                  // Safely parse row data
                  let rowData: any = {};
                  try {
                    rowData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
                  } catch (e) {
                    console.error("Error parsing row data:", e);
                  }
                  
                  return (
                    <tr key={row.id} className="border-b border-border/50 hover:bg-bg-surface transition-colors">
                      {columns.map((col: string) => (
                        <td key={col} className="py-4 px-6 text-sm text-text-primary whitespace-nowrap">
                          {rowData[col] || "—"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
