import { AppShell } from "@/components/layout/AppShell";

export default function DocumentsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display text-text-primary mb-2">
            Documents
          </h1>
          <p className="text-text-muted">
            Manage export documents, certificates, and compliance files
          </p>
        </div>

        <div className="bg-bg-card rounded-card border border-border shadow-default p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-heading text-text-primary mb-2">No documents yet</h3>
            <p className="text-text-muted mb-6">Upload and manage your export documents, certificates, and compliance files</p>
            <button className="btn-primary">Upload Documents</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
