import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileType = file.name.split(".").pop()?.toLowerCase();
    let data: any[] = [];

    if (fileType === "json") {
      const content = buffer.toString("utf-8");
      data = JSON.parse(content);
    } else if (fileType === "csv" || fileType === "txt") {
      const content = buffer.toString("utf-8");
      const lines = content.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        return NextResponse.json(
          { error: "CSV file is empty" },
          { status: 400 }
        );
      }

      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        data.push(row);
      }
    } else if (fileType === "xlsx" || fileType === "xls") {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
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

    if (data.length > 2000) {
      return NextResponse.json(
        { error: `File too large (${data.length} rows). Please limit to 2000 rows or contact support for bulk upload.` },
        { status: 400 }
      );
    }

    const columns = Object.keys(data[0]);

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

    const dataImport = await prisma.dataImport.create({
      data: {
        orgId: org.id,
        fileName: file.name,
        fileType: fileType || "unknown",
        rowCount: data.length,
        columns: JSON.stringify(columns),
      },
    });

    const BATCH_SIZE = 50;
    let savedCount = 0;

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);

      for (const row of batch) {
        await prisma.dataRow.create({
          data: {
            importId: dataImport.id,
            data: JSON.stringify(row),
          },
        });
        savedCount += 1;
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
