"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

interface DataChartsProps {
  dataset: DatasetProfile;
  selectedImportId: string;
}

type ChartType = "bar" | "line" | "pie";
type Aggregation = "count" | "sum" | "average";

type AggregatedRow = {
  name: string;
  value: number;
  count: number;
  total: number;
};

const COLORS = ["#D9A441", "#2C7BE5", "#3DBE8B", "#B86A3C", "#8B5CF6", "#F59E0B", "#10B981", "#6366F1"];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

export function DataCharts({ dataset, selectedImportId }: DataChartsProps) {
  const [dimension, setDimension] = useState<string>("");
  const [metric, setMetric] = useState<string>("");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [aggregation, setAggregation] = useState<Aggregation>("count");

  const availableCategorical = dataset.categoricalColumns.length > 0 ? dataset.categoricalColumns : dataset.columns;
  const availableNumeric = dataset.numericColumns;

  useEffect(() => {
    if (!dimension && availableCategorical.length > 0) {
      setDimension(availableCategorical[0]);
    }
  }, [availableCategorical, dimension]);

  useEffect(() => {
    if (!metric && availableNumeric.length > 0) {
      setMetric(availableNumeric[0]);
    }
  }, [availableNumeric, metric]);

  const filteredRows = useMemo(() => {
    if (selectedImportId === "all") {
      return dataset.rows;
    }
    return dataset.rows.filter((row) => row.importId === selectedImportId);
  }, [dataset.rows, selectedImportId]);

  const aggregatedData = useMemo<AggregatedRow[]>(() => {
    if (!dimension) return [];

    const map = new Map<string, AggregatedRow>();

    for (const row of filteredRows) {
      const rawKey = row.data[dimension];
      const key = rawKey === null || rawKey === undefined || rawKey === "" ? "Unspecified" : String(rawKey);
      const numericValue = metric && typeof row.data[metric] === "number" ? (row.data[metric] as number) : null;

      if (!map.has(key)) {
        map.set(key, { name: key, value: 0, count: 0, total: 0 });
      }

      const entry = map.get(key)!;
      entry.count += 1;
      if (numericValue !== null) {
        entry.total += numericValue;
      }
    }

    const rows = Array.from(map.values()).map((entry) => {
      let value = entry.count;
      if (aggregation === "sum" && metric) {
        value = entry.total;
      } else if (aggregation === "average" && metric) {
        value = entry.count > 0 ? entry.total / entry.count : 0;
      }
      return { ...entry, value };
    });

    return rows.sort((a, b) => b.value - a.value).slice(0, 20);
  }, [aggregation, dimension, filteredRows, metric]);

  const insights = useMemo(() => {
    if (aggregatedData.length === 0) {
      return ["No rows matched the current filters. Try selecting a different dimension or import."];
    }

    const [top, second] = aggregatedData;
    const total = aggregatedData.reduce((sum, item) => sum + item.value, 0);
    const topShare = total > 0 ? (top.value / total) * 100 : 0;

    const list: string[] = [
      `${top.name} leads with ${formatNumber(top.value)} (${topShare.toFixed(1)}% of the total).`,
    ];

    if (second) {
      const delta = top.value - second.value;
      list.push(`Difference to #2 (${second.name}): ${formatNumber(Math.abs(delta))}.`);
    }

    if (filteredRows.length > 0 && aggregation === "count") {
      list.push(`${formatNumber(filteredRows.length)} records evaluated across ${dataset.columns.length} fields.`);
    }

    return list;
  }, [aggregatedData, aggregation, dataset.columns.length, filteredRows.length]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <label className="text-xs text-text-muted block mb-1">Dimension</label>
          <select
            value={dimension}
            onChange={(event) => setDimension(event.target.value)}
            className="input-field w-full"
          >
            {availableCategorical.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Metric</label>
          <select
            value={metric}
            onChange={(event) => setMetric(event.target.value)}
            className="input-field w-full"
            disabled={availableNumeric.length === 0}
          >
            {availableNumeric.length === 0 && <option value="">No numeric columns detected</option>}
            {availableNumeric.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Aggregation</label>
          <select
            value={aggregation}
            onChange={(event) => setAggregation(event.target.value as Aggregation)}
            className="input-field w-full"
            disabled={!metric}
          >
            <option value="count">Count</option>
            <option value="sum">Sum</option>
            <option value="average">Average</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["bar", "line", "pie"] as ChartType[]).map((type) => (
          <button
            key={type}
            onClick={() => setChartType(type)}
            className={`px-4 py-2 rounded-pill text-xs font-medium transition-all duration-200 border ${
              chartType === type ? "bg-accent-gold text-bg-base border-accent-gold" : "bg-bg-surface text-text-muted border-border"
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
        <h3 className="text-lg font-heading text-text-primary mb-4">
          {aggregation === "count" ? "Record count" : aggregation === "sum" ? `Sum of ${metric}` : `Average ${metric}`} by {dimension}
        </h3>
        {aggregatedData.length === 0 ? (
          <div className="text-center py-12 text-text-muted">No data to plot with the current selections.</div>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            {chartType === "bar" && (
              <BarChart data={aggregatedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D2733" />
                <XAxis dataKey="name" stroke="#98A3B1" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={80} />
                <YAxis stroke="#98A3B1" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0C1118",
                    border: "1px solid #25313F",
                    borderRadius: "12px",
                    color: "#F4F7FB",
                  }}
                  formatter={(value: any) => formatNumber(value as number)}
                />
                <Bar dataKey="value" fill="#D9A441" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
            {chartType === "line" && (
              <LineChart data={aggregatedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D2733" />
                <XAxis dataKey="name" stroke="#98A3B1" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={80} />
                <YAxis stroke="#98A3B1" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0C1118",
                    border: "1px solid #25313F",
                    borderRadius: "12px",
                    color: "#F4F7FB",
                  }}
                  formatter={(value: any) => formatNumber(value as number)}
                />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#2C7BE5" strokeWidth={2} dot={{ stroke: "#2C7BE5", strokeWidth: 2 }} />
              </LineChart>
            )}
            {chartType === "pie" && (
              <PieChart>
                <Pie data={aggregatedData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120}>
                  {aggregatedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0C1118",
                    border: "1px solid #25313F",
                    borderRadius: "12px",
                    color: "#F4F7FB",
                  }}
                  formatter={(value: any, name: string) => [formatNumber(value as number), name]}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
        <h3 className="text-lg font-heading text-text-primary mb-4">AI-ready insights</h3>
        <ul className="space-y-2 text-sm text-text-muted">
          {insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-accent-gold mt-1">●</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
