"use client";

const mockLots = [
  { id: "1", lotCode: "LOT-2024-001", region: "Yirgacheffe", quality: 88.5, qty: 320, status: "READY" },
  { id: "2", lotCode: "LOT-2024-002", region: "Sidamo", quality: 86.2, qty: 280, status: "IN_TRANSIT" },
  { id: "3", lotCode: "LOT-2024-003", region: "Guji", quality: 89.1, qty: 450, status: "SAMPLE" },
  { id: "4", lotCode: "LOT-2024-004", region: "Limu", quality: 85.8, qty: 190, status: "READY" },
  { id: "5", lotCode: "LOT-2024-005", region: "Harrar", quality: 87.3, qty: 340, status: "MILLED" },
];

const statusConfig = {
  READY: { label: "Ready", class: "status-ready" },
  IN_TRANSIT: { label: "In Transit", class: "status-in-transit" },
  SAMPLE: { label: "Sample", class: "status-sample" },
  MILLED: { label: "Milled", class: "status-pill bg-accent-copper/20 text-accent-copper border-accent-copper/30" },
};

export function RecentLotsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="enterprise-table">
        <thead>
          <tr>
            <th>Lot Code</th>
            <th>Region</th>
            <th>Quality Score</th>
            <th className="text-right">Quantity (bags)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mockLots.map((lot) => (
            <tr key={lot.id} className="cursor-pointer">
              <td className="font-medium text-accent-gold">{lot.lotCode}</td>
              <td>{lot.region}</td>
              <td>
                <span className={`font-medium ${lot.quality >= 87 ? "text-success" : "text-text-primary"}`}>
                  {lot.quality}
                </span>
              </td>
              <td className="text-right">{lot.qty.toLocaleString()}</td>
              <td>
                <span className={`status-pill ${statusConfig[lot.status as keyof typeof statusConfig].class}`}>
                  {statusConfig[lot.status as keyof typeof statusConfig].label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
