import { NextResponse } from "next/server";
import { prisma, isSchemaOutOfSyncError } from "@/lib/prisma";

export async function GET() {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        coffeeRow: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(shipments);
  } catch (error: unknown) {
    if (isSchemaOutOfSyncError(error)) {
      console.warn("Database schema not initialised yet; returning empty shipment list.");
      return NextResponse.json([]);
    }

    console.error("Error fetching shipments:", error);
    return NextResponse.json({ error: "Failed to fetch shipments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      coffeeRowId,
      containerNo,
      vessel,
      portOfLoading,
      portOfDischarge,
      etd,
      eta,
      billOfLading,
      status,
      notes,
    } = body;

    if (!coffeeRowId) {
      return NextResponse.json(
        { error: "Coffee row ID is required" },
        { status: 400 }
      );
    }

    let org = await prisma.org.findFirst();
    if (!org) {
      org = await prisma.org.create({
        data: {
          name: "ADDIS Coffee Exporters",
          locale: "en",
          currency: "USD",
        },
      });
    }

    const shipment = await prisma.shipment.create({
      data: {
        orgId: org.id,
        coffeeRowId,
        containerNo,
        vessel,
        portOfLoading,
        portOfDischarge,
        etd: etd ? new Date(etd) : null,
        eta: eta ? new Date(eta) : null,
        billOfLading,
        status: status || "PREPARING",
        notes,
      },
    });

    return NextResponse.json(shipment);
  } catch (error: unknown) {
    if (isSchemaOutOfSyncError(error)) {
      console.warn("Database schema not initialised yet; rejecting shipment creation.");
      return NextResponse.json(
        {
          error:
            "Database is not initialised. Run `npx prisma db push` to create the schema before adding shipments.",
        },
        { status: 503 }
      );
    }

    console.error("Error creating shipment:", error);
    return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 });
  }
}
