import { DashboardSummary, buildFrequency, findColumnByKeywords, findNumericColumnByKeywords, formatNumber } from "./analytics";
import { DatasetProfile, normaliseName } from "./data";

function normaliseMessage(message: string) {
  return message.toLowerCase();
}

function findColumnFromMessage(dataset: DatasetProfile, message: string) {
  const stripped = message.replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  for (const column of dataset.columns) {
    const normalised = normaliseName(column);
    if (!normalised) continue;
    const withoutSpaces = normalised.replace(/\s+/g, "");
    if (stripped.includes(normalised) || stripped.includes(withoutSpaces)) {
      return column;
    }
  }
  return undefined;
}

function formatFrequencySummary(dataset: DatasetProfile, column: string) {
  const top = buildFrequency(dataset.rows, column, 5);
  if (top.length === 0) {
    return `No populated values detected for ${column}.`;
  }

  const lines = top.map((item) => `• ${item.name} — ${item.count.toLocaleString()} records`);
  return [`Top signals for ${column}:`, ...lines].join("\n");
}

function summariseNumeric(dataset: DatasetProfile, column: string) {
  const values = dataset.rows
    .map((row) => row.data[column])
    .filter((value): value is number => typeof value === "number");

  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  const average = total / values.length;
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  return { average, total, minimum, maximum };
}

export function generateAgentResponse(message: string, dashboard: DashboardSummary) {
  const dataset = dashboard.dataset;

  if (dataset.rows.length === 0) {
    return "I don't have any imported data yet. Upload a spreadsheet or CSV so I can analyse your coffee exports.";
  }

  const text = normaliseMessage(message);
  const responseSections: string[] = [];

  const shipmentsInProgress = dashboard.metrics.shipmentsInProgress;
  const deliveredCount = dashboard.metrics.shipmentsByStatus["DELIVERED"] || 0;

  const mentionShipments = /shipment|logistic|in transit|container|vessel/.test(text);
  if (mentionShipments) {
    const statusLines = Object.entries(dashboard.metrics.shipmentsByStatus)
      .map(([status, count]) => `• ${status.replace(/_/g, " ")}: ${count}`)
      .join("\n");

    responseSections.push(
      [
        `Here's where logistics stand:`,
        `• Active / preparing shipments: ${shipmentsInProgress}`,
        `• Delivered shipments: ${deliveredCount}`,
        statusLines ? `• Status breakdown:\n${statusLines}` : undefined,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  const averageIntent = /average|mean|score|quality/.test(text);
  if (averageIntent) {
    const qualityColumn = findNumericColumnByKeywords(dataset, ["score", "quality", "cupping"]);
    if (qualityColumn) {
      const summary = summariseNumeric(dataset, qualityColumn);
      responseSections.push(
        [
          `Quality insights for ${qualityColumn}:`,
          `• Average score: ${formatNumber(summary?.average)}`,
          `• Best lot: ${formatNumber(summary?.maximum)}`,
          `• Lowest score: ${formatNumber(summary?.minimum)}`,
        ].join("\n")
      );
    } else {
      responseSections.push(
        "I could not detect a quality metric column. Try asking about a specific numeric field from your dataset."
      );
    }
  }

  const totalIntent = /total|sum|revenue|volume|usd|bags|value|ton/.test(text);
  if (totalIntent) {
    const volumeColumn = findNumericColumnByKeywords(dataset, ["volume", "bags", "quantity", "weight", "kg", "mt"]);
    const valueColumn = findNumericColumnByKeywords(dataset, ["value", "usd", "price", "revenue", "amount", "fob"]);
    const lines: string[] = [];

    if (volumeColumn) {
      const volumeSummary = summariseNumeric(dataset, volumeColumn);
      lines.push(`• Total recorded volume (${volumeColumn}): ${formatNumber(volumeSummary?.total)}`);
    }
    if (valueColumn) {
      const valueSummary = summariseNumeric(dataset, valueColumn);
      lines.push(
        `• Contract value (${valueColumn}): ${formatNumber(valueSummary?.total, { style: "currency", currency: "USD" })}`
      );
    }
    if (lines.length > 0) {
      responseSections.push(["Commercial summary:", ...lines].join("\n"));
    }
  }

  const topIntent = /top|best|leading|breakdown|by region|region|process|variety/.test(text);
  if (topIntent) {
    const regionColumn = findColumnByKeywords(dataset, ["region", "origin", "zone"]);
    if (regionColumn) {
      responseSections.push(formatFrequencySummary(dataset, regionColumn));
    }
    const processColumn = findColumnByKeywords(dataset, ["process", "method"]);
    if (processColumn) {
      responseSections.push(formatFrequencySummary(dataset, processColumn));
    }
    const varietyColumn = findColumnByKeywords(dataset, ["variety", "cultivar"]);
    if (varietyColumn) {
      responseSections.push(formatFrequencySummary(dataset, varietyColumn));
    }
  }

  const timelineIntent = /trend|timeline|month|time|recent/.test(text);
  if (timelineIntent && dashboard.timeline.rowsPerMonth.length > 0) {
    const latest = dashboard.timeline.rowsPerMonth.slice(-3);
    const trendLines = latest.map((point) => `• ${point.label}: ${point.value.toLocaleString()} records`);
    responseSections.push([
      "Recent data volume trend:",
      ...trendLines,
    ].join("\n"));
  }

  if (responseSections.length === 0) {
    const matchedColumn = findColumnFromMessage(dataset, text);
    if (matchedColumn) {
      responseSections.push(formatFrequencySummary(dataset, matchedColumn));
    } else {
      responseSections.push(
        [
          `Here's an executive snapshot:`,
          `• ${dashboard.summary.totalRows.toLocaleString()} records across ${dashboard.summary.columnCount} fields`,
          `• Data completeness: ${dashboard.summary.dataCoveragePct}%`,
          `• Active shipments: ${shipmentsInProgress}`,
          dashboard.metrics.averageQualityScore
            ? `• Average quality score: ${formatNumber(dashboard.metrics.averageQualityScore)}`
            : undefined,
          dashboard.metrics.totalContractValue
            ? `• Contract value captured: ${formatNumber(dashboard.metrics.totalContractValue, { style: "currency", currency: "USD" })}`
            : undefined,
          dashboard.timeline.rowsPerMonth.length
            ? `• Latest activity: ${dashboard.timeline.rowsPerMonth.slice(-1)[0].label}`
            : undefined,
          "Ask me about specific fields (e.g. region, process, FOB price) or request comparisons to dig deeper.",
        ]
          .filter(Boolean)
          .join("\n")
      );
    }
  }

  return responseSections.join("\n\n");
}
