import { NextResponse } from "next/server";
import { prisma, isSchemaOutOfSyncError } from "@/lib/prisma";
import { parseDataImports, createEmptyDatasetProfile } from "@/lib/data";
import { createDashboard } from "@/lib/analytics";
import { generateAgentResponse } from "@/lib/agent";

export async function POST(request: Request) {
  let message = "";

  try {
    const payload = await request.json();
    if (!payload || typeof payload.message !== "string" || !payload.message.trim()) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    message = payload.message.trim();

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
    const response = generateAgentResponse(message, dashboard);

    return NextResponse.json({
      response,
    });
  } catch (error: unknown) {
    if (isSchemaOutOfSyncError(error)) {
      console.warn("Database schema not initialised yet; returning guidance response.");
      const emptyDashboard = createDashboard(createEmptyDatasetProfile(), []);
      const response = generateAgentResponse(message, emptyDashboard);
      return NextResponse.json({
        response,
        warning: "Database is not initialised. Run `npx prisma db push` and seed data to unlock analytics.",
      });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    console.error("Chat error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
