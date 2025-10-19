import { Shipment } from "@prisma/client";
import { DatasetProfile, ParsedRow, extractColumnValues, normaliseName } from "./data";

export interface FrequencyDatum {
  name: string;
  count: number;
}

export interface NumericSummary {
  column: string;
  average: number | null;
  total: number | null;
  minimum: number | null;
  maximum: number | null;
}

export interface TimelineDatum {
  label: string;
  value: number;
  monthKey: string;
}

export interface DashboardSummary {
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
    topRegions: FrequencyDatum[];
    topVarieties: FrequencyDatum[];
    topProcesses: FrequencyDatum[];
  };
  timeline: {
    rowsPerMonth: TimelineDatum[];
  };
  recentImports: Array<{
    id: string;
    fileName: string;
    rowCount: number;
    columnCount: number;
    createdAt: string;
    columns: string[];
  }>;
  sampleRows: Array<{
    id: string;
    data: Record<string, unknown>;
  }>;
  dataset: DatasetProfile;
}

const COLUMN_KEYWORDS = {
  region: ["region", "origin", "zone", "district", "country"],
  variety: ["variety", "cultivar", "bean"],
  process: ["process", "method", "processing"],
  quality: ["score", "quality", "cupping", "grading"],
  volume: ["volume", "quantity", "bags", "weight", "kg", "tons", "mt", "quintal"],
  value: ["price", "value", "amount", "usd", "revenue", "fob"],
  date: ["date", "shipped", "etd", "eta", "harvest", "created"],
};

export function findColumnByKeywords(profile: DatasetProfile, keywords: string[]) {
  const lowerKeywords = keywords.map((keyword) => keyword.toLowerCase());
  for (const column of profile.columns) {
    const normalized = normaliseName(column);
    if (lowerKeywords.some((keyword) => normalized.includes(keyword))) {
      return column;
    }
  }
  return undefined;
}

export function findNumericColumnByKeywords(profile: DatasetProfile, keywords: string[]) {
  const candidate = findColumnByKeywords(profile, keywords);
  if (candidate && profile.numericColumns.includes(candidate)) {
    return candidate;
  }
  const fallback = profile.numericColumns.find((column) =>
    keywords.some((keyword) => normaliseName(column).includes(keyword))
  );
  return fallback;
}

function computeCoverage(profile: DatasetProfile) {
  const totalCells = profile.rows.length * profile.columns.length;
  if (totalCells === 0) return 0;
  let filled = 0;

  for (const row of profile.rows) {
    for (const column of profile.columns) {
      const value = row.data[column];
      if (value !== null && value !== undefined && value !== "") {
        filled += 1;
      }
    }
  }

  return Math.round((filled / totalCells) * 100);
}

function summariseNumericColumn(rows: ParsedRow[], column: string): NumericSummary {
  const values = extractColumnValues(rows, column)
    .map((value) => (typeof value === "number" ? value : Number(value)))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return {
      column,
      average: null,
      total: null,
      minimum: null,
      maximum: null,
    };
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  const average = total / values.length;
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  return {
    column,
    average,
    total,
    minimum,
    maximum,
  };
}

export function buildFrequency(rows: ParsedRow[], column: string, limit = 6): FrequencyDatum[] {
  const values = extractColumnValues(rows, column)
    .map((value) => String(value))
    .filter(Boolean);

  const counts = new Map<string, number>();

  for (const value of values) {
    const key = value.trim() || "Unspecified";
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function buildTimeline(rows: ParsedRow[], preferredDateColumn?: string): TimelineDatum[] {
  const timelineMap = new Map<string, number>();

  for (const row of rows) {
    let dateValue: Date | null = null;

    if (preferredDateColumn) {
      const raw = row.data[preferredDateColumn];
      if (typeof raw === "string" || raw instanceof Date) {
        const parsed = new Date(raw);
        if (!Number.isNaN(parsed.getTime())) {
          dateValue = parsed;
        }
      }
    }

    if (!dateValue) {
      const fallback = new Date(row.createdAt);
      if (!Number.isNaN(fallback.getTime())) {
        dateValue = fallback;
      }
    }

    if (!dateValue) continue;

    const monthKey = `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(2, "0")}`;
    timelineMap.set(monthKey, (timelineMap.get(monthKey) || 0) + 1);
  }

  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  });

  return Array.from(timelineMap.entries())
    .map(([monthKey, value]) => {
      const [year, month] = monthKey.split("-").map(Number);
      const date = new Date(year, month - 1, 1);
      return {
        label: formatter.format(date),
        value,
        monthKey,
      };
    })
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    .slice(-12);
}

export function createDashboard(profile: DatasetProfile, shipments: Shipment[]): DashboardSummary {
  const qualityColumn = findNumericColumnByKeywords(profile, COLUMN_KEYWORDS.quality);
  const volumeColumn = findNumericColumnByKeywords(profile, COLUMN_KEYWORDS.volume);
  const valueColumn = findNumericColumnByKeywords(profile, COLUMN_KEYWORDS.value);
  const regionColumn = findColumnByKeywords(profile, COLUMN_KEYWORDS.region);
  const varietyColumn = findColumnByKeywords(profile, COLUMN_KEYWORDS.variety);
  const processColumn = findColumnByKeywords(profile, COLUMN_KEYWORDS.process);
  const dateColumn = profile.dateColumns.find((column) =>
    COLUMN_KEYWORDS.date.some((keyword) => normaliseName(column).includes(keyword))
  );

  const qualitySummary = qualityColumn ? summariseNumericColumn(profile.rows, qualityColumn) : null;
  const volumeSummary = volumeColumn ? summariseNumericColumn(profile.rows, volumeColumn) : null;
  const valueSummary = valueColumn ? summariseNumericColumn(profile.rows, valueColumn) : null;

  const shipmentsByStatus = shipments.reduce<Record<string, number>>((acc, shipment) => {
    const status = shipment.status || "UNKNOWN";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const shipmentsInProgress = Object.entries(shipmentsByStatus)
    .filter(([status]) => status !== "DELIVERED" && status !== "ARRIVED")
    .reduce((sum, [, count]) => sum + count, 0);

  return {
    summary: {
      totalImports: profile.imports.length,
      totalRows: profile.rows.length,
      columnCount: profile.columns.length,
      numericColumnCount: profile.numericColumns.length,
      categoricalColumnCount: profile.categoricalColumns.length,
      lastImportAt: profile.imports[0]?.createdAt ?? null,
      dataCoveragePct: computeCoverage(profile),
    },
    metrics: {
      averageQualityScore: qualitySummary?.average ?? null,
      totalVolume: volumeSummary?.total ?? null,
      totalContractValue: valueSummary?.total ?? null,
      shipmentsInProgress,
      shipmentsByStatus,
    },
    segments: {
      topRegions: regionColumn ? buildFrequency(profile.rows, regionColumn) : [],
      topVarieties: varietyColumn ? buildFrequency(profile.rows, varietyColumn) : [],
      topProcesses: processColumn ? buildFrequency(profile.rows, processColumn) : [],
    },
    timeline: {
      rowsPerMonth: buildTimeline(profile.rows, dateColumn),
    },
    recentImports: profile.imports.slice(0, 5).map((imp) => ({
      id: imp.id,
      fileName: imp.fileName,
      rowCount: imp.rowCount,
      columnCount: imp.columns.length,
      createdAt: imp.createdAt,
      columns: imp.columns,
    })),
    sampleRows: profile.rows.slice(0, 10).map((row) => ({
      id: row.id,
      data: row.data,
    })),
    dataset: profile,
  };
}

export function formatNumber(value: number | null | undefined, options: Intl.NumberFormatOptions = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    ...options,
  });

  return formatter.format(value);
}
