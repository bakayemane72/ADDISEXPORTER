"use client";

interface LotsTableProps {
  lots: any[];
}

export function LotsTable({ lots }: LotsTableProps) {
  if (!lots || lots.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-text-primary mb-2">No lots yet</h3>
        <p className="text-sm text-text-muted mb-6">Import from Excel or create your first lot to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-bg-surface/50">
            <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Lot Code</th>
            <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Region</th>
            <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Farm</th>
            <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Process</th>
            <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Altitude (m)</th>
            <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Quality</th>
            <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Moisture %</th>
            <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Year</th>
          </tr>
        </thead>
        <tbody>
          {lots.map((lot) => (
            <tr key={lot.id} className="border-b border-border/50 hover:bg-bg-surface transition-colors">
              <td className="py-4 px-6 text-sm text-text-primary font-medium">{lot.lotCode}</td>
              <td className="py-4 px-6 text-sm text-text-primary">{lot.region}</td>
              <td className="py-4 px-6 text-sm text-text-muted">{lot.farmNames}</td>
              <td className="py-4 px-6 text-sm">
                <span className="px-2 py-1 rounded-pill bg-accent-gold/10 text-accent-gold text-xs border border-accent-gold/30">
                  {lot.processType}
                </span>
              </td>
              <td className="py-4 px-6 text-sm text-text-muted">{lot.altitudeM.toLocaleString()}</td>
              <td className="py-4 px-6 text-sm">
                {lot.overallScore ? (
                  <span className="text-accent-gold font-medium">{lot.overallScore.toFixed(1)}</span>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </td>
              <td className="py-4 px-6 text-sm text-text-muted">{lot.moisturePct.toFixed(1)}%</td>
              <td className="py-4 px-6 text-sm text-text-muted">{lot.harvestYear}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
