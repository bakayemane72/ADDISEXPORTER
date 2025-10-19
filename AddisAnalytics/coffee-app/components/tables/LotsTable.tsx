"use client";

import { Pin, MoreVertical } from "lucide-react";

const mockLots = [
  { id: "1", lotCode: "LOT-2024-001", region: "Yirgacheffe", zone: "Gedeo", altitude: 2100, process: "Washed", quality: 88.5, qty: 320, buyer: "Blue Bottle", status: "READY" },
  { id: "2", lotCode: "LOT-2024-002", region: "Sidamo", zone: "Bensa", altitude: 1950, process: "Natural", quality: 86.2, qty: 280, buyer: "Counter Culture", status: "IN_TRANSIT" },
  { id: "3", lotCode: "LOT-2024-003", region: "Guji", zone: "Uraga", altitude: 2250, process: "Washed", quality: 89.1, qty: 450, buyer: "Intelligentsia", status: "SAMPLE" },
  { id: "4", lotCode: "LOT-2024-004", region: "Limu", zone: "Goma", altitude: 1800, process: "Washed", quality: 85.8, qty: 190, buyer: null, status: "READY" },
  { id: "5", lotCode: "LOT-2024-005", region: "Harrar", zone: "West Hararghe", altitude: 2050, process: "Natural", quality: 87.3, qty: 340, buyer: "Stumptown", status: "MILLED" },
  { id: "6", lotCode: "LOT-2024-006", region: "Yirgacheffe", zone: "Kochere", altitude: 2200, process: "Honey", quality: 90.2, qty: 280, buyer: "Square Mile", status: "SAMPLE" },
  { id: "7", lotCode: "LOT-2024-007", region: "Sidamo", zone: "Nensebo", altitude: 2100, process: "Natural", quality: 87.9, qty: 350, buyer: null, status: "READY" },
  { id: "8", lotCode: "LOT-2024-008", region: "Guji", zone: "Shakiso", altitude: 1980, process: "Washed", quality: 86.5, qty: 420, buyer: "Onyx", status: "IN_TRANSIT" },
];

const statusConfig = {
  READY: { label: "Ready to Ship", class: "status-ready" },
  IN_TRANSIT: { label: "In Transit", class: "status-in-transit" },
  SAMPLE: { label: "Sample Stage", class: "status-sample" },
  MILLED: { label: "Milled", class: "bg-accent-copper/20 text-accent-copper border-accent-copper/30" },
};

export function LotsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="enterprise-table">
        <thead>
          <tr>
            <th className="w-10">
              <Pin className="w-4 h-4 text-text-muted" />
            </th>
            <th>Lot Code</th>
            <th>Region</th>
            <th>Zone</th>
            <th>Altitude (m)</th>
            <th>Process</th>
            <th>SCA Score</th>
            <th className="text-right">Bags</th>
            <th>Buyer</th>
            <th>Status</th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {mockLots.map((lot) => (
            <tr key={lot.id} className="cursor-pointer">
              <td>
                <button className="text-text-muted hover:text-accent-gold">
                  <Pin className="w-4 h-4" />
                </button>
              </td>
              <td className="font-semibold text-accent-gold">{lot.lotCode}</td>
              <td>{lot.region}</td>
              <td className="text-text-muted">{lot.zone}</td>
              <td>{lot.altitude.toLocaleString()}</td>
              <td>
                <span className="px-2 py-1 rounded-pill bg-bg-surface text-text-primary text-xs border border-border">
                  {lot.process}
                </span>
              </td>
              <td>
                <span className={`font-semibold ${lot.quality >= 87 ? "text-success" : lot.quality >= 85 ? "text-accent-gold" : "text-text-primary"}`}>
                  {lot.quality}
                </span>
              </td>
              <td className="text-right font-medium">{lot.qty}</td>
              <td className="text-text-muted">{lot.buyer || "—"}</td>
              <td>
                <span className={`status-pill ${statusConfig[lot.status as keyof typeof statusConfig].class}`}>
                  {statusConfig[lot.status as keyof typeof statusConfig].label}
                </span>
              </td>
              <td>
                <button className="text-text-muted hover:text-text-primary">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
