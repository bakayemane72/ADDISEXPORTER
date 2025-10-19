import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Get all imported data
    const imports = await prisma.dataImport.findMany({
      include: {
        rows: {
          take: 100, // Limit to prevent token overflow
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (imports.length === 0) {
      return NextResponse.json({
        response: "No data has been imported yet. Please upload an Excel file first to analyze your coffee export data.",
      });
    }

    // Parse data and create context
    const allData = imports.flatMap((imp) => {
      try {
        const columns = typeof imp.columns === 'string' ? JSON.parse(imp.columns) : imp.columns;
        return imp.rows.map((row) => {
          try {
            return typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          } catch {
            return {};
          }
        });
      } catch {
        return [];
      }
    });

    const firstImportColumns = (() => {
      try {
        const cols = typeof imports[0].columns === 'string' ? JSON.parse(imports[0].columns) : imports[0].columns;
        return Array.isArray(cols) ? cols.join(", ") : "N/A";
      } catch {
        return "N/A";
      }
    })();

    const dataContext = `
You have access to ${allData.length} rows of coffee export data with the following sample (first 10 rows):

${JSON.stringify(allData.slice(0, 10), null, 2)}

Available columns: ${firstImportColumns}

Total imports: ${imports.length}
Total rows: ${allData.length}
`;

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping analyze Ethiopian coffee export data. You have access to real imported data and should provide insights, answer questions, and help users understand their coffee inventory, quality metrics, shipments, and business analytics. Be concise, data-driven, and actionable.
          
${dataContext}`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0]?.message?.content || "I couldn't generate a response.";

    return NextResponse.json({
      response: aiResponse,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error.message || "Chat failed" },
      { status: 500 }
    );
  }
}
