import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const lots = await prisma.lot.findMany({
      include: {
        commercial: true,
        logistics: true,
      },
    });

    // Calculate statistics
    const totalLots = lots.length;
    
    const activeShipments = lots.filter(
      lot => lot.logistics && lot.logistics.status !== 'DELIVERED'
    ).length;

    const avgQualityScore = lots.length > 0
      ? lots
          .filter(lot => lot.overallScore)
          .reduce((sum, lot) => sum + (lot.overallScore || 0), 0) / 
          lots.filter(lot => lot.overallScore).length
      : 0;

    const totalRevenue = lots
      .filter(lot => lot.commercial?.salePriceUSDPerLb && lot.commercial?.contractedQtyBags)
      .reduce((sum, lot) => {
        const pricePerLb = lot.commercial!.salePriceUSDPerLb!;
        const bags = lot.commercial!.contractedQtyBags;
        const kgPerBag = 60;
        const lbsPerKg = 2.20462;
        return sum + (pricePerLb * bags * kgPerBag * lbsPerKg);
      }, 0);

    // Group by region
    const byRegion = lots.reduce((acc: any, lot) => {
      if (!acc[lot.region]) {
        acc[lot.region] = 0;
      }
      acc[lot.region]++;
      return acc;
    }, {});

    // Group by process type
    const byProcessType = lots.reduce((acc: any, lot) => {
      if (!acc[lot.processType]) {
        acc[lot.processType] = 0;
      }
      acc[lot.processType]++;
      return acc;
    }, {});

    return NextResponse.json({
      totalLots,
      activeShipments,
      avgQualityScore: avgQualityScore.toFixed(1),
      totalRevenue: totalRevenue.toFixed(2),
      byRegion,
      byProcessType,
      recentLots: lots.slice(0, 5),
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
