import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const lots = await prisma.lot.findMany({
      include: {
        commercial: true,
        logistics: true,
        compliance: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(lots);
  } catch (error: any) {
    console.error("Error fetching lots:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch lots" },
      { status: 500 }
    );
  }
}
