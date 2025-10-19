import { AppShell } from "@/components/layout/AppShell";
import { Plus, Upload, Filter } from "lucide-react";
import { LotsTable } from "@/components/tables/LotsTable";

export default function LotsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-text-primary mb-2">
              Lots
            </h1>
            <p className="text-text-muted">
              Manage your coffee inventory and quality data
            </p>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import Excel
            </button>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Lot
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <div className="flex gap-2">
            <span className="px-3 py-2 rounded-pill bg-accent-gold/10 text-accent-gold text-sm border border-accent-gold/30">
              2024 Harvest
            </span>
            <span className="px-3 py-2 rounded-pill bg-success/10 text-success text-sm border border-success/30">
              Specialty (87+)
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-bg-card rounded-card border border-border shadow-default">
          <LotsTable />
        </div>
      </div>
    </AppShell>
  );
}
