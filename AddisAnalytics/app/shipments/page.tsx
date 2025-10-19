"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Plus, Ship } from "lucide-react";
import { useEffect, useState } from "react";

export default function ShipmentsPage() {
  const [imports, setImports] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRow, setSelectedRow] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [importsRes, shipmentsRes] = await Promise.all([
        fetch("/api/data"),
        fetch("/api/shipments"),
      ]);
      
      const importsData = await importsRes.json();
      const shipmentsData = await shipmentsRes.json();
      
      setImports(importsData);
      setShipments(shipmentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShipment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
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
        fetchData();
      }
    } catch (error) {
      console.error("Error adding shipment:", error);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-muted">Loading shipments...</div>
        </div>
      </AppShell>
    );
  }

  const allRows = imports.flatMap((imp) => 
    imp.rows.map((row: any) => ({
      id: row.id,
      data: row.data,
      import: imp,
    }))
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-text-primary mb-2">
              Shipments
            </h1>
            <p className="text-text-muted">
              {shipments.length > 0 ? `Managing ${shipments.length} shipment${shipments.length !== 1 ? 's' : ''}` : 'Track your coffee shipments and logistics'}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Shipment
          </button>
        </div>

        {/* Add Shipment Form */}
        {showAddForm && (
          <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
            <h3 className="text-lg font-heading text-text-primary mb-4">Add New Shipment</h3>
            <form onSubmit={handleAddShipment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-muted block mb-1">Select Coffee Row</label>
                  <select
                    value={selectedRow}
                    onChange={(e) => setSelectedRow(e.target.value)}
                    className="input-field w-full"
                    required
                  >
                    <option value="">-- Select Coffee --</option>
                    {allRows.map((row) => {
                      const firstColumn = Object.keys(row.data)[0];
                      const displayValue = row.data[firstColumn];
                      return (
                        <option key={row.id} value={row.id}>
                          {displayValue} (from {row.import.fileName})
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-text-muted block mb-1">Container Number</label>
                  <input name="containerNo" type="text" className="input-field w-full" />
                </div>

                <div>
                  <label className="text-sm text-text-muted block mb-1">Vessel Name</label>
                  <input name="vessel" type="text" className="input-field w-full" />
                </div>

                <div>
                  <label className="text-sm text-text-muted block mb-1">Port of Loading</label>
                  <input name="portOfLoading" type="text" className="input-field w-full" placeholder="e.g., Djibouti" />
                </div>

                <div>
                  <label className="text-sm text-text-muted block mb-1">Port of Discharge</label>
                  <input name="portOfDischarge" type="text" className="input-field w-full" placeholder="e.g., Hamburg" />
                </div>

                <div>
                  <label className="text-sm text-text-muted block mb-1">ETD (Departure Date)</label>
                  <input name="etd" type="date" className="input-field w-full" />
                </div>

                <div>
                  <label className="text-sm text-text-muted block mb-1">ETA (Arrival Date)</label>
                  <input name="eta" type="date" className="input-field w-full" />
                </div>

                <div>
                  <label className="text-sm text-text-muted block mb-1">Bill of Lading</label>
                  <input name="billOfLading" type="text" className="input-field w-full" />
                </div>

                <div>
                  <label className="text-sm text-text-muted block mb-1">Status</label>
                  <select name="status" className="input-field w-full">
                    <option>PREPARING</option>
                    <option>IN_TRANSIT</option>
                    <option>ARRIVED</option>
                    <option>DELIVERED</option>
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

        {/* Shipments Table */}
        <div className="bg-bg-card rounded-card border border-border shadow-default">
          {shipments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚢</div>
              <h3 className="text-lg font-medium text-text-primary mb-2">No shipments yet</h3>
              <p className="text-sm text-text-muted">Add shipment details for your coffee exports</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-bg-surface/50">
                    <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Container</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Vessel</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Route</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">ETD</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">ETA</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-text-muted uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((shipment: any) => (
                    <tr key={shipment.id} className="border-b border-border/50 hover:bg-bg-surface transition-colors">
                      <td className="py-4 px-6 text-sm text-text-primary font-medium">{shipment.containerNo || "—"}</td>
                      <td className="py-4 px-6 text-sm text-text-primary">{shipment.vessel || "—"}</td>
                      <td className="py-4 px-6 text-sm text-text-muted">
                        {shipment.portOfLoading} → {shipment.portOfDischarge}
                      </td>
                      <td className="py-4 px-6 text-sm text-text-muted">
                        {shipment.etd ? new Date(shipment.etd).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-4 px-6 text-sm text-text-muted">
                        {shipment.eta ? new Date(shipment.eta).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 rounded-pill bg-accent-gold/10 text-accent-gold text-xs border border-accent-gold/30">
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
