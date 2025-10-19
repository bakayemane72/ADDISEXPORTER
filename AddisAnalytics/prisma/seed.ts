import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ImportRow = Record<string, string | number | undefined>;

type ImportDefinition = {
  fileName: string;
  fileType: "xlsx" | "csv" | "json";
  rows: ImportRow[];
};

const imports: ImportDefinition[] = [
  {
    fileName: "ethiopia-quality-2024.xlsx",
    fileType: "xlsx",
    rows: [
      {
        "Lot Code": "LOT-2024-001",
        Region: "Yirgacheffe",
        "Process": "Washed",
        "Grade": "Q1",
        "Score": 87.4,
        "Volume (bags)": 320,
        "FOB USD/lb": 3.85,
        "Harvest Date": "2024-01-15",
        "Shipment ETA": "2024-06-18",
      },
      {
        "Lot Code": "LOT-2024-002",
        Region: "Guji",
        "Process": "Natural",
        "Grade": "Q1",
        "Score": 88.2,
        "Volume (bags)": 280,
        "FOB USD/lb": 4.1,
        "Harvest Date": "2024-02-02",
        "Shipment ETA": "2024-07-05",
      },
      {
        "Lot Code": "LOT-2024-003",
        Region: "Sidamo",
        "Process": "Honey",
        "Grade": "Q2",
        "Score": 85.6,
        "Volume (bags)": 400,
        "FOB USD/lb": 3.45,
        "Harvest Date": "2024-02-20",
        "Shipment ETA": "2024-07-28",
      },
    ],
  },
  {
    fileName: "japan-contracts-q2.csv",
    fileType: "csv",
    rows: [
      {
        Buyer: "Blue Bottle",
        Region: "Guji",
        "Process": "Natural",
        "Contract Volume (bags)": 210,
        "FOB USD/lb": 4.05,
        "Shipment Window": "2024-08",
        "ICO Mark": "ICO-ETH-8842",
      },
      {
        Buyer: "% Arabica",
        Region: "Yirgacheffe",
        "Process": "Washed",
        "Contract Volume (bags)": 260,
        "FOB USD/lb": 3.95,
        "Shipment Window": "2024-09",
        "ICO Mark": "ICO-ETH-8843",
      },
      {
        Buyer: "Starbucks Reserve",
        Region: "Limu",
        "Process": "Honey",
        "Contract Volume (bags)": 180,
        "FOB USD/lb": 4.2,
        "Shipment Window": "2024-08",
        "ICO Mark": "ICO-ETH-8844",
      },
    ],
  },
  {
    fileName: "europe-logistics-status.json",
    fileType: "json",
    rows: [
      {
        Container: "MSCU8812345",
        Vessel: "MSC Adriatic",
        Status: "IN_TRANSIT",
        "Port of Loading": "Djibouti",
        "Port of Discharge": "Hamburg",
        "ETD": "2024-06-10",
        "ETA": "2024-07-12",
        "Associated Lot": "LOT-2024-001",
      },
      {
        Container: "MSCU7744112",
        Vessel: "Ever Gentle",
        Status: "PREPARING",
        "Port of Loading": "Djibouti",
        "Port of Discharge": "Antwerp",
        "ETD": "2024-07-02",
        "ETA": "2024-08-08",
        "Associated Lot": "LOT-2024-002",
      },
    ],
  },
];

async function main() {
  console.log("Seeding Addis Enterprise Analytics dataset...");

  await prisma.shipment.deleteMany();
  await prisma.dataRow.deleteMany();
  await prisma.dataImport.deleteMany();
  await prisma.user.deleteMany();
  await prisma.org.deleteMany();

  const org = await prisma.org.create({
    data: {
      name: "Addis Coffee Collective",
      locale: "en",
      currency: "USD",
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@addiscoffee.com",
      name: "Admin User",
      role: "OWNER",
      orgId: org.id,
    },
  });

  const createdRows: { id: string; lotCode?: string }[] = [];

  for (const definition of imports) {
    const dataImport = await prisma.dataImport.create({
      data: {
        orgId: org.id,
        fileName: definition.fileName,
        fileType: definition.fileType,
        rowCount: definition.rows.length,
        columns: JSON.stringify(Object.keys(definition.rows[0] || {})),
      },
    });

    for (const row of definition.rows) {
      const created = await prisma.dataRow.create({
        data: {
          importId: dataImport.id,
          data: JSON.stringify(row),
        },
      });

      const lotCodeValue = row["Lot Code"];

      createdRows.push({
        id: created.id,
        lotCode: typeof lotCodeValue === "string" ? lotCodeValue : undefined,
      });
    }
  }

  const shipmentsToCreate = [
    {
      containerNo: "MSCU8812345",
      vessel: "MSC Adriatic",
      portOfLoading: "Djibouti",
      portOfDischarge: "Hamburg",
      etd: new Date("2024-06-10"),
      eta: new Date("2024-07-12"),
      status: "IN_TRANSIT",
      lotCode: "LOT-2024-001",
    },
    {
      containerNo: "MSCU7744112",
      vessel: "Ever Gentle",
      portOfLoading: "Djibouti",
      portOfDischarge: "Antwerp",
      etd: new Date("2024-07-02"),
      eta: new Date("2024-08-08"),
      status: "PREPARING",
      lotCode: "LOT-2024-002",
    },
  ];

  for (const shipment of shipmentsToCreate) {
    const matchedRow = createdRows.find((row) => row.lotCode === shipment.lotCode) || createdRows[0];
    if (!matchedRow) continue;

    await prisma.shipment.create({
      data: {
        orgId: org.id,
        coffeeRowId: matchedRow.id,
        containerNo: shipment.containerNo,
        vessel: shipment.vessel,
        portOfLoading: shipment.portOfLoading,
        portOfDischarge: shipment.portOfDischarge,
        etd: shipment.etd,
        eta: shipment.eta,
        status: shipment.status,
      },
    });
  }

  console.log("Seeding completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
