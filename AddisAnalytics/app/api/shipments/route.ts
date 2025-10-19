import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        coffeeRow: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(shipments);
  } catch (error: any) {
    console.error("Error fetching shipments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch shipments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Get org
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
  } catch (error: any) {
    console.error("Error creating shipment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create shipment" },
      { status: 500 }
    );
  }
}
