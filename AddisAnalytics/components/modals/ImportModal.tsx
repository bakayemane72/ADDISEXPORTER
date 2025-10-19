"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setResult(data);
      
      // Reload the page after 2 seconds to show new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-bg-card rounded-card border border-border shadow-lg w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-heading text-text-primary">Import Data</h2>
            <p className="text-sm text-text-muted mt-1">
              Upload Excel, CSV, JSON, XML, or TXT files
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-surface rounded-input transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Drop Zone */}
          {!result && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-card p-12 text-center hover:border-accent-gold transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-primary mb-2">
                {file ? file.name : "Drop your file here or click to browse"}
              </p>
              <p className="text-sm text-text-muted">
                Supports .xlsx, .xls, .csv, .txt, .json, .xml
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.txt,.json,.xml"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
                className="hidden"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/30 rounded-card">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-error font-medium">Upload Failed</p>
                <p className="text-sm text-error/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/30 rounded-card">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-success font-medium">Import Successful!</p>
                  <p className="text-sm text-success/80 mt-1">
                    {result.savedCount} of {result.recordCount} lots saved to database
                  </p>
                  {result.errorCount > 0 && (
                    <p className="text-sm text-error mt-1">
                      {result.errorCount} records had errors
                    </p>
                  )}
                </div>
              </div>

              {/* Preview */}
              {result.preview && result.preview.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-2">Preview (First 5 rows)</h3>
                  <div className="bg-bg-surface rounded-card p-4 overflow-auto max-h-64">
                    <pre className="text-xs text-text-muted">
                      {JSON.stringify(result.preview, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          {result && (
            <button 
              onClick={() => onClose()} 
              className="btn-primary"
            >
              Done
            </button>
          )}
          {!result && (
            <>
              <button onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Upload & Save to Database"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
