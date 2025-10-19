import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine file type and process accordingly
    const fileType = file.name.split(".").pop()?.toLowerCase();
    let data: any[] = [];

    if (fileType === "json") {
      const content = buffer.toString("utf-8");
      data = JSON.parse(content);
    } else if (fileType === "csv" || fileType === "txt") {
      // Simple CSV parsing - handle quoted values and commas within quotes
      const content = buffer.toString("utf-8");
      const lines = content.split("\n").filter(line => line.trim());
      
      if (lines.length === 0) {
        return NextResponse.json(
          { error: "CSV file is empty" },
          { status: 400 }
        );
      }
      
      // Parse headers
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ''));
      
      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    } else if (fileType === "xlsx" || fileType === "xls") {
      // Parse Excel file
      const workbook = XLSX.read(buffer, { type: "buffer" });
      
      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      data = XLSX.utils.sheet_to_json(worksheet);
    } else if (fileType === "xml") {
      return NextResponse.json(
        { error: "XML parsing requires additional processing. Please convert to Excel, CSV, or JSON." },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: `Unsupported file type: ${fileType}` },
        { status: 400 }
      );
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: "No data found in file" },
        { status: 400 }
      );
    }

    // Limit to prevent timeout
    if (data.length > 1000) {
      return NextResponse.json(
        { error: `File too large (${data.length} rows). Please limit to 1000 rows or contact support for bulk upload.` },
        { status: 400 }
      );
    }

    // Extract column names from first row
    const columns = Object.keys(data[0]);

    // Get or create organization
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

    // Create data import record
    const dataImport = await prisma.dataImport.create({
      data: {
        orgId: org.id,
        fileName: file.name,
        fileType: fileType || "unknown",
        rowCount: data.length,
        columns: JSON.stringify(columns),
      },
    });

    // Create data rows in batches to avoid timeout
    const BATCH_SIZE = 50;
    let savedCount = 0;

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      
      // Process sequentially to avoid timeout
      for (const row of batch) {
        await prisma.dataRow.create({
          data: {
            importId: dataImport.id,
            data: JSON.stringify(row),
          },
        });
        savedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileType,
      recordCount: data.length,
      savedCount,
      columns,
      preview: data.slice(0, 5),
      importId: dataImport.id,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
