import { DataImport, DataRow } from "@prisma/client";

export interface ParsedRow {
  id: string;
  importId: string;
  createdAt: string;
  data: Record<string, unknown>;
}

export interface ParsedImport {
  id: string;
  orgId: string;
  fileName: string;
  fileType: string;
  rowCount: number;
  columns: string[];
  createdAt: string;
  updatedAt: string;
  rows: ParsedRow[];
}

export type ColumnType = "numeric" | "categorical" | "date";

export interface ColumnProfile {
  type: ColumnType;
  uniqueValues: number;
  sampleValues: string[];
}

export interface DatasetProfile {
  imports: ParsedImport[];
  rows: ParsedRow[];
  columns: string[];
  numericColumns: string[];
  categoricalColumns: string[];
  dateColumns: string[];
  columnProfiles: Record<string, ColumnProfile>;
}

export function createEmptyDatasetProfile(): DatasetProfile {
  return {
    imports: [],
    rows: [],
    columns: [],
    numericColumns: [],
    categoricalColumns: [],
    dateColumns: [],
    columnProfiles: {},
  };
}

export const EMPTY_DATASET_PROFILE: DatasetProfile = createEmptyDatasetProfile();

type RawImport = DataImport & { rows: DataRow[] };

type ColumnAccumulator = {
  numeric: number;
  date: number;
  text: number;
  samples: string[];
  unique: Set<string>;
};

const NUMBER_PATTERN = /^[-+]?\d+(?:[.,]\d+)?$/;

function looksLikeNumber(value: string) {
  const normalized = value.replace(/[,\s]/g, "");
  return NUMBER_PATTERN.test(normalized);
}

function toNumber(value: string) {
  const normalized = value.replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function looksLikeDate(value: string) {
  if (value.length < 4) return false;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return false;
  const year = new Date(parsed).getFullYear();
  return year > 1900 && year < 2100;
}

function toISODate(value: string) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
}

function normaliseColumns(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((col) => String(col));
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((col) => String(col));
      }
    } catch {
      return raw.split(",").map((col) => col.trim()).filter(Boolean);
    }
  }

  return [];
}

export function parseDataImports(imports: RawImport[]): DatasetProfile {
  const parsedImports: ParsedImport[] = [];
  const rows: ParsedRow[] = [];
  const columnAccumulators = new Map<string, ColumnAccumulator>();
  const allColumns = new Set<string>();

  for (const imp of imports) {
    const columns = normaliseColumns(imp.columns);
    const parsedImport: ParsedImport = {
      id: imp.id,
      orgId: imp.orgId,
      fileName: imp.fileName,
      fileType: imp.fileType,
      rowCount: imp.rowCount,
      columns,
      createdAt: imp.createdAt.toISOString(),
      updatedAt: imp.updatedAt.toISOString(),
      rows: [],
    };

    for (const col of columns) {
      allColumns.add(col);
      if (!columnAccumulators.has(col)) {
        columnAccumulators.set(col, {
          numeric: 0,
          date: 0,
          text: 0,
          samples: [],
          unique: new Set<string>(),
        });
      }
    }

    for (const row of imp.rows) {
      let parsedData: Record<string, unknown> = {};
      if (typeof row.data === "string") {
        try {
          const json = JSON.parse(row.data);
          if (json && typeof json === "object") {
            parsedData = json as Record<string, unknown>;
          }
        } catch {
          parsedData = {};
        }
      } else if (row.data && typeof row.data === "object") {
        parsedData = row.data as Record<string, unknown>;
      }

      const normalizedRow: Record<string, unknown> = {};

      for (const [key, rawValue] of Object.entries(parsedData)) {
        if (!columnAccumulators.has(key)) {
          columnAccumulators.set(key, {
            numeric: 0,
            date: 0,
            text: 0,
            samples: [],
            unique: new Set<string>(),
          });
          allColumns.add(key);
        }

        const accumulator = columnAccumulators.get(key)!;
        let valueToStore: unknown = rawValue;
        let sample = "";

        if (rawValue === null || rawValue === undefined || rawValue === "") {
          accumulator.text += 1;
          sample = "";
          valueToStore = null;
        } else if (typeof rawValue === "number") {
          accumulator.numeric += 1;
          valueToStore = rawValue;
          sample = rawValue.toString();
        } else if (typeof rawValue === "string") {
          const trimmed = rawValue.trim();
          sample = trimmed;

          if (trimmed === "") {
            accumulator.text += 1;
            valueToStore = null;
          } else if (looksLikeNumber(trimmed)) {
            const numericValue = toNumber(trimmed);
            if (numericValue !== null) {
              accumulator.numeric += 1;
              valueToStore = numericValue;
            } else {
              accumulator.text += 1;
              valueToStore = trimmed;
            }
          } else if (looksLikeDate(trimmed)) {
            const iso = toISODate(trimmed);
            if (iso) {
              accumulator.date += 1;
              valueToStore = iso;
              sample = iso;
            } else {
              accumulator.text += 1;
              valueToStore = trimmed;
            }
          } else {
            accumulator.text += 1;
            valueToStore = trimmed;
          }
        } else if (typeof rawValue === "boolean") {
          accumulator.text += 1;
          valueToStore = rawValue;
          sample = rawValue ? "true" : "false";
        } else {
          accumulator.text += 1;
          valueToStore = rawValue;
          sample = JSON.stringify(rawValue);
        }

        if (sample !== "") {
          accumulator.unique.add(sample);
          if (accumulator.samples.length < 8) {
            accumulator.samples.push(sample);
          }
        }

        normalizedRow[key] = valueToStore;
      }

      const parsedRow: ParsedRow = {
        id: row.id,
        importId: imp.id,
        createdAt: row.createdAt.toISOString(),
        data: normalizedRow,
      };

      parsedImport.rows.push(parsedRow);
      rows.push(parsedRow);
    }

    parsedImports.push(parsedImport);
  }

  const columnProfiles: Record<string, ColumnProfile> = {};
  const numericColumns: string[] = [];
  const dateColumns: string[] = [];
  const categoricalColumns: string[] = [];

  for (const column of allColumns) {
    const accumulator = columnAccumulators.get(column);
    if (!accumulator) continue;

    const totalObservations = accumulator.numeric + accumulator.date + accumulator.text;
    let type: ColumnType = "categorical";

    const numericRatio = totalObservations ? accumulator.numeric / totalObservations : 0;
    const dateRatio = totalObservations ? accumulator.date / totalObservations : 0;

    if (numericRatio >= 0.45 && accumulator.numeric >= accumulator.text) {
      type = "numeric";
      numericColumns.push(column);
    } else if (dateRatio >= 0.35) {
      type = "date";
      dateColumns.push(column);
    } else {
      type = "categorical";
      categoricalColumns.push(column);
    }

    columnProfiles[column] = {
      type,
      uniqueValues: accumulator.unique.size,
      sampleValues: accumulator.samples,
    };
  }

  const sortedColumns = Array.from(allColumns);

  return {
    imports: parsedImports.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    rows,
    columns: sortedColumns,
    numericColumns,
    categoricalColumns,
    dateColumns,
    columnProfiles,
  };
}

export function extractColumnValues(rows: ParsedRow[], column: string) {
  return rows
    .map((row) => row.data[column])
    .filter((value) => value !== null && value !== undefined && value !== "");
}

export function normaliseName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
