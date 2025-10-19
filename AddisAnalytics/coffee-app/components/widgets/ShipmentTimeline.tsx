"use client";

const mockEvents = [
  { id: "1", label: "Container loaded", lot: "LOT-2024-001", timestamp: "2 hours ago", status: "completed" },
  { id: "2", label: "Customs cleared", lot: "LOT-2024-002", timestamp: "5 hours ago", status: "completed" },
  { id: "3", label: "In transit to port", lot: "LOT-2024-003", timestamp: "1 day ago", status: "active" },
  { id: "4", label: "Quality inspection", lot: "LOT-2024-004", timestamp: "2 days ago", status: "pending" },
];

export function ShipmentTimeline() {
  return (
    <div className="space-y-4">
      {mockEvents.map((event, idx) => (
        <div key={event.id} className="flex gap-4">
          {/* Timeline indicator */}
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${
              event.status === "completed" ? "bg-success" :
              event.status === "active" ? "bg-accent-gold" :
              "bg-text-muted"
            }`} />
            {idx < mockEvents.length - 1 && (
              <div className="w-px flex-1 bg-border my-1" />
            )}
          </div>
          
          {/* Event content */}
          <div className="flex-1 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-text-primary">{event.label}</div>
                <div className="text-sm text-text-muted mt-1">
                  {event.lot} · {event.timestamp}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-pill ${
                event.status === "completed" ? "bg-success/20 text-success" :
                event.status === "active" ? "bg-accent-gold/20 text-accent-gold" :
                "bg-text-muted/20 text-text-muted"
              }`}>
                {event.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
