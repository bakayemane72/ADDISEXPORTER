import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const imports = await prisma.dataImport.findMany({
      include: {
        rows: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse JSON data for each import
    const parsedImports = imports.map((imp) => ({
      ...imp,
      columns: JSON.parse(imp.columns),
      rows: imp.rows.map((row) => ({
        ...row,
        data: JSON.parse(row.data),
      })),
    }));

    return NextResponse.json(parsedImports);
  } catch (error: any) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch data" },
      { status: 500 }
    );
  }
}
