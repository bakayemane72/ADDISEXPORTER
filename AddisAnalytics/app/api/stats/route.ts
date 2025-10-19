import { NextResponse } from "next/server";
import { prisma, isSchemaOutOfSyncError } from "@/lib/prisma";
import { parseDataImports, createEmptyDatasetProfile } from "@/lib/data";
import { createDashboard } from "@/lib/analytics";

export async function GET() {
  try {
    const [imports, shipments] = await Promise.all([
      prisma.dataImport.findMany({
        include: {
          rows: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.shipment.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const dataset = parseDataImports(imports);
    const dashboard = createDashboard(dataset, shipments);

    return NextResponse.json(dashboard);
  } catch (error: unknown) {
    if (isSchemaOutOfSyncError(error)) {
      console.warn("Database schema not initialised yet; returning empty dashboard summary.");
      const emptyDataset = createEmptyDatasetProfile();
      return NextResponse.json(createDashboard(emptyDataset, []));
    }

    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
