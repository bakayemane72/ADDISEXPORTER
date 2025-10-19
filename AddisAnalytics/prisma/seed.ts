import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create organization
  const org = await prisma.org.upsert({
    where: { id: "org-1" },
    update: {},
    create: {
      id: "org-1",
      name: "Addis Coffee Exporters",
      locale: "en",
      currency: "USD",
    },
  });

  // Create users
  const owner = await prisma.user.upsert({
    where: { email: "admin@addiscoffee.com" },
    update: {},
    create: {
      email: "admin@addiscoffee.com",
      name: "Admin User",
      role: "OWNER",
      orgId: org.id,
    },
  });

  // Sample data arrays
  const regions = ["Yirgacheffe", "Sidamo", "Guji", "Harrar", "Limu"];
  const zones = {
    Yirgacheffe: ["Gedeo", "Kochere", "Wenago"],
    Sidamo: ["Bensa", "Nensebo", "Dale"],
    Guji: ["Uraga", "Shakiso", "Hambela"],
    Harrar: ["West Hararghe", "East Hararghe"],
    Limu: ["Goma", "Limu Kosa"],
  };
  const buyers = ["Blue Bottle", "Counter Culture", "Intelligentsia", "Stumptown", "Square Mile", "Onyx", null];
  const processes = ["WASHED", "NATURAL", "HONEY", "EXPERIMENTAL"];

  // Create 30+ lots
  for (let year of [2023, 2024]) {
    for (let i = 1; i <= 18; i++) {
      const region = regions[Math.floor(Math.random() * regions.length)];
      const zoneArray = zones[region as keyof typeof zones];
      const zone = zoneArray[Math.floor(Math.random() * zoneArray.length)];
      const processType = processes[Math.floor(Math.random() * processes.length)];
      
      // Generate quality scores
      const baseScore = 83 + Math.random() * 7; // 83-90
      const aroma = 7 + Math.random() * 3;
      const acidity = 7 + Math.random() * 3;
      const body = 7 + Math.random() * 3;
      const aftertaste = 7 + Math.random() * 3;
      const uniformity = 8 + Math.random() * 2;
      const overall = 7.5 + Math.random() * 2.5;

      const lot = await prisma.lot.create({
        data: {
          lotCode: `LOT-${year}-${String(i).padStart(3, "0")}`,
          harvestYear: year,
          region,
          zone,
          woreda: `Woreda ${i}`,
          kebele: `Kebele ${i}`,
          farmNames: `Farm ${i} Cooperative`,
          altitudeM: 1800 + Math.floor(Math.random() * 500),
          variety: Math.random() > 0.3 ? "Heirloom" : "Improved",
          processType,
          moisturePct: 10 + Math.random() * 2,
          screenSize: Math.random() > 0.5 ? "15+" : "14+",
          defects: Math.floor(Math.random() * 5),
          aromaScore: parseFloat(aroma.toFixed(2)),
          acidityScore: parseFloat(acidity.toFixed(2)),
          bodyScore: parseFloat(body.toFixed(2)),
          aftertasteScore: parseFloat(aftertaste.toFixed(2)),
          uniformityScore: parseFloat(uniformity.toFixed(2)),
          overallScore: parseFloat(overall.toFixed(2)),
          certifications: JSON.stringify(
            Math.random() > 0.5 ? ["Organic", "Fair Trade"] : ["Organic"]
          ),
          photos: JSON.stringify([]),
          notes: `Premium ${region} coffee from ${year} harvest`,
          orgId: org.id,
        },
      });

      // Create commercial data
      const farmgatePrice = 150 + Math.random() * 100;
      const fobPrice = 3.5 + Math.random() * 2.5;
      
      await prisma.commercial.create({
        data: {
          lotId: lot.id,
          farmgateETBPerKg: parseFloat(farmgatePrice.toFixed(2)),
          fobUSDPerLb: parseFloat(fobPrice.toFixed(2)),
          costProcessing: 15 + Math.random() * 10,
          costMilling: 20 + Math.random() * 10,
          costTransport: 10 + Math.random() * 10,
          salePriceUSDPerLb: Math.random() > 0.3 ? parseFloat((fobPrice * 1.15).toFixed(2)) : null,
          contractedQtyBags: 200 + Math.floor(Math.random() * 300),
          shippedQtyBags: Math.random() > 0.5 ? 150 + Math.floor(Math.random() * 200) : 0,
          buyerName: buyers[Math.floor(Math.random() * buyers.length)],
          incoterms: Math.random() > 0.5 ? "FOB" : "CIF",
        },
      });

      // Create logistics data
      const statuses = ["SAMPLE", "MILLED", "READY", "IN_TRANSIT", "LANDED"];
      await prisma.logistics.create({
        data: {
          lotId: lot.id,
          mill: `Mill ${Math.floor(Math.random() * 5) + 1}`,
          warehouse: `Warehouse ${Math.floor(Math.random() * 3) + 1}`,
          bagType: "Jute + GrainPro",
          sealIds: JSON.stringify([`SEAL-${i}-001`, `SEAL-${i}-002`]),
          containerNo: Math.random() > 0.5 ? `CONT-${year}-${i}` : null,
          status: statuses[Math.floor(Math.random() * statuses.length)],
        },
      });

      // Create compliance data
      await prisma.compliance.create({
        data: {
          lotId: lot.id,
          icoMarks: `ICO-ETH-${year}-${i}`,
          phytoNo: `PHYTO-${year}-${String(i).padStart(4, "0")}`,
        },
      });

      console.log(`Created lot: ${lot.lotCode}`);
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
