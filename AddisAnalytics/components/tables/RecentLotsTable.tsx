"use client";

interface Lot {
  id: string;
  lotCode: string;
  region: string;
  processType: string;
  overallScore?: number;
  harvestYear: number;
}

interface RecentLotsTableProps {
  lots: Lot[];
}

export function RecentLotsTable({ lots }: RecentLotsTableProps) {
  if (!lots || lots.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">☕</div>
        <h3 className="text-lg font-medium text-text-primary mb-2">No lots yet</h3>
        <p className="text-sm text-text-muted">Import from Excel or create your first in under a minute</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Lot Code</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Region</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Process</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Quality</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Year</th>
          </tr>
        </thead>
        <tbody>
          {lots.map((lot) => (
            <tr key={lot.id} className="border-b border-border/50 hover:bg-bg-surface transition-colors">
              <td className="py-3 px-4 text-sm text-text-primary font-medium">{lot.lotCode}</td>
              <td className="py-3 px-4 text-sm text-text-primary">{lot.region}</td>
              <td className="py-3 px-4 text-sm text-text-muted">{lot.processType}</td>
              <td className="py-3 px-4 text-sm">
                {lot.overallScore ? (
                  <span className="text-accent-gold font-medium">{lot.overallScore.toFixed(1)}</span>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </td>
              <td className="py-3 px-4 text-sm text-text-muted">{lot.harvestYear}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
