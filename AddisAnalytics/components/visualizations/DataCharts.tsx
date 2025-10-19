"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DataChartsProps {
  data: any[];
  columns: string[];
}

export function DataCharts({ data, columns }: DataChartsProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>("");

  useEffect(() => {
    if (data.length > 0 && columns.length > 0) {
      setSelectedColumn(columns[0]);
      prepareChartData(columns[0]);
    }
  }, [data, columns]);

  const prepareChartData = (column: string) => {
    // Count occurrences of each value in the selected column
    const counts: { [key: string]: number } = {};
    
    data.forEach((row) => {
      const value = String(row[column] || "N/A");
      counts[value] = (counts[value] || 0) + 1;
    });

    const formatted = Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }));

    setChartData(formatted);
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">📊</div>
        <p className="text-text-muted">No data to visualize. Import a file first.</p>
      </div>
    );
  }

  const COLORS = ["#D9A441", "#B86A3C", "#6366F1", "#8B5CF6", "#10B981", "#F59E0B"];

  return (
    <div className="space-y-6">
      {/* Column Selector */}
      <div>
        <label className="text-sm text-text-muted mb-2 block">Select Column to Visualize</label>
        <select
          value={selectedColumn}
          onChange={(e) => {
            setSelectedColumn(e.target.value);
            prepareChartData(e.target.value);
          }}
          className="input-field max-w-xs"
        >
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
          <h3 className="text-lg font-heading text-text-primary mb-6">
            Distribution by {selectedColumn}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
              <XAxis dataKey="name" stroke="#A0AEC0" />
              <YAxis stroke="#A0AEC0" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A202C",
                  border: "1px solid #2D3748",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#D9A441" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
          <h3 className="text-lg font-heading text-text-primary mb-6">
            Breakdown by {selectedColumn}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => entry.name}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A202C",
                  border: "1px solid #2D3748",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Summary */}
      <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
        <h3 className="text-lg font-heading text-text-primary mb-4">Data Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-text-muted">Total Rows</p>
            <p className="text-2xl font-semibold text-text-primary">{data.length}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Total Columns</p>
            <p className="text-2xl font-semibold text-text-primary">{columns.length}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Unique Values</p>
            <p className="text-2xl font-semibold text-text-primary">{chartData.length}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Selected Column</p>
            <p className="text-2xl font-semibold text-accent-gold truncate">{selectedColumn}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
