import { NextResponse } from "next/server";
import { prisma, isSchemaOutOfSyncError } from "@/lib/prisma";
import { parseDataImports, createEmptyDatasetProfile } from "@/lib/data";

export async function GET() {
  try {
    const imports = await prisma.dataImport.findMany({
      include: {
        rows: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const dataset = parseDataImports(imports);

    return NextResponse.json(dataset);
  } catch (error: unknown) {
    if (isSchemaOutOfSyncError(error)) {
      console.warn("Database schema not initialised yet; returning empty dataset profile.");
      return NextResponse.json(createEmptyDatasetProfile());
    }

    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
