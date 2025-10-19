"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Plus } from "lucide-react";

interface DatasetProfile {
  rows: Array<{
    id: string;
    importId: string;
    data: Record<string, unknown>;
  }>;
  imports: Array<{
    id: string;
    fileName: string;
  }>;
}

interface Shipment {
  id: string;
  containerNo: string | null;
  vessel: string | null;
  portOfLoading: string | null;
  portOfDischarge: string | null;
  etd: string | null;
  eta: string | null;
  status: string;
}

export default function ShipmentsPage() {
  const [dataset, setDataset] = useState<DatasetProfile | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRow, setSelectedRow] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [datasetRes, shipmentsRes] = await Promise.all([
        fetch("/api/data"),
        fetch("/api/shipments"),
      ]);

      const datasetJson = await datasetRes.json();
      const shipmentsJson = await shipmentsRes.json();

      if (datasetJson.error) {
        setError(datasetJson.error);
      } else {
        setDataset(datasetJson);
      }

      if (shipmentsJson.error) {
        setError(shipmentsJson.error);
      } else {
        setShipments(shipmentsJson);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  const handleAddShipment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coffeeRowId: selectedRow,
          containerNo: formData.get("containerNo"),
          vessel: formData.get("vessel"),
          portOfLoading: formData.get("portOfLoading"),
          portOfDischarge: formData.get("portOfDischarge"),
          etd: formData.get("etd"),
          eta: formData.get("eta"),
          billOfLading: formData.get("billOfLading"),
          status: formData.get("status"),
          notes: formData.get("notes"),
        }),
      });

      if (response.ok) {
        setShowAddForm(false);
        setSelectedRow("");
        event.currentTarget.reset();
        fetchData();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create shipment");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create shipment");
    }
  };

  const rowOptions = useMemo(() => {
    if (!dataset) return [];
    return dataset.rows.map((row) => {
      const firstEntry = Object.entries(row.data)[0];
      const importLabel = dataset.imports.find((imp) => imp.id === row.importId)?.fileName || "Dataset";
      const label = firstEntry ? `${firstEntry[1]} (${firstEntry[0]})` : row.id;
      return {
        id: row.id,
        label,
        importLabel,
      };
    });
  }, [dataset]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-muted">Loading shipments…</div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="space-y-4">
          <h1 className="text-3xl font-display text-text-primary">Shipments</h1>
          <div className="bg-bg-card border border-border rounded-card p-6 text-error">{error}</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display text-text-primary mb-2">Shipments</h1>
            <p className="text-text-muted">
              {shipments.length > 0
                ? `Managing ${shipments.length} shipment${shipments.length !== 1 ? "s" : ""}`
                : "Track your export containers and milestones"}
            </p>
          </div>
          <button onClick={() => setShowAddForm((prev) => !prev)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Shipment
          </button>
        </div>

        {showAddForm && (
          <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
            <h3 className="text-lg font-heading text-text-primary mb-4">Add new shipment</h3>
            <form onSubmit={handleAddShipment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-muted block mb-1">Link to dataset row</label>
                  <select
                    value={selectedRow}
                    onChange={(event) => setSelectedRow(event.target.value)}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select coffee lot</option>
                    {rowOptions.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.label} — {row.importLabel}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-text-muted block mb-1">Container number</label>
                  <input name="containerNo" type="text" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-sm text-text-muted block mb-1">Vessel</label>
                  <input name="vessel" type="text" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-sm text-text-muted block mb-1">Port of loading</label>
                  <input name="portOfLoading" type="text" className="input-field w-full" placeholder="e.g., Djibouti" />
                </div>
                <div>
                  <label className="text-sm text-text-muted block mb-1">Port of discharge</label>
                  <input name="portOfDischarge" type="text" className="input-field w-full" placeholder="e.g., Hamburg" />
                </div>
                <div>
                  <label className="text-sm text-text-muted block mb-1">ETD</label>
                  <input name="etd" type="date" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-sm text-text-muted block mb-1">ETA</label>
                  <input name="eta" type="date" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-sm text-text-muted block mb-1">Bill of lading</label>
                  <input name="billOfLading" type="text" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-sm text-text-muted block mb-1">Status</label>
                  <select name="status" className="input-field w-full">
                    <option value="PREPARING">PREPARING</option>
                    <option value="IN_TRANSIT">IN_TRANSIT</option>
                    <option value="ARRIVED">ARRIVED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-text-muted block mb-1">Notes</label>
                  <textarea name="notes" className="input-field w-full" rows={2}></textarea>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Shipment
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-bg-card rounded-card border border-border shadow-default">
          {shipments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚢</div>
              <h3 className="text-lg font-heading text-text-primary mb-2">No shipments yet</h3>
              <p className="text-sm text-text-muted">Add shipment records to monitor logistics milestones.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-bg-surface/40">
                    <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Container</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Vessel</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Route</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">ETD</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">ETA</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((shipment) => (
                    <tr key={shipment.id} className="border-b border-border/50 hover:bg-bg-surface transition-colors">
                      <td className="py-4 px-6 text-sm text-text-primary font-medium">{shipment.containerNo || "—"}</td>
                      <td className="py-4 px-6 text-sm text-text-primary">{shipment.vessel || "—"}</td>
                      <td className="py-4 px-6 text-sm text-text-muted">
                        {shipment.portOfLoading || "—"} → {shipment.portOfDischarge || "—"}
                      </td>
                      <td className="py-4 px-6 text-sm text-text-muted">
                        {shipment.etd ? new Date(shipment.etd).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-4 px-6 text-sm text-text-muted">
                        {shipment.eta ? new Date(shipment.eta).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-pill bg-accent-gold/10 text-accent-gold text-xs border border-accent-gold/40">
                          {shipment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
