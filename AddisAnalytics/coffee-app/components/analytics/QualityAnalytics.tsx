"use client";

import { KPICard } from "../ui/KPICard";

export function QualityAnalytics() {
  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Avg SCA Score"
          value="87.2"
          delta="+1.8"
          sparklineData={[85.2, 85.6, 86.1, 86.5, 86.9, 87.0, 87.1, 87.2]}
          lastUpdated="1 hour ago"
        />
        <KPICard
          title="Specialty Lots"
          value="42"
          delta="+12"
          sparklineData={[28, 30, 32, 35, 37, 39, 41, 42]}
          lastUpdated="2 hours ago"
        />
        <KPICard
          title="Avg Moisture"
          value="11.2%"
          delta="-0.3"
          sparklineData={[11.8, 11.6, 11.5, 11.4, 11.3, 11.3, 11.2, 11.2]}
          lastUpdated="30 min ago"
        />
        <KPICard
          title="Zero Defects"
          value="68%"
          delta="+5%"
          sparklineData={[58, 60, 62, 63, 65, 66, 67, 68]}
          lastUpdated="1 hour ago"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cupping Score Distribution */}
        <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
          <h3 className="text-lg font-heading text-text-primary mb-6">
            Cupping Score Distribution
          </h3>
          <div className="h-64 flex items-center justify-center text-text-muted">
            {/* Placeholder for Recharts chart */}
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>Quality distribution chart</p>
              <p className="text-sm mt-1">Peak at 87-89 points</p>
            </div>
          </div>
        </div>

        {/* Regional Quality Breakdown */}
        <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
          <h3 className="text-lg font-heading text-text-primary mb-6">
            Quality by Region
          </h3>
          <div className="space-y-4">
            {[
              { region: "Yirgacheffe", score: 89.2, color: "bg-success" },
              { region: "Guji", score: 88.1, color: "bg-accent-gold" },
              { region: "Sidamo", score: 86.8, color: "bg-accent-copper" },
              { region: "Harrar", score: 85.9, color: "bg-text-muted" },
              { region: "Limu", score: 85.2, color: "bg-text-muted" },
            ].map((item) => (
              <div key={item.region} className="flex items-center gap-4">
                <div className="w-32 text-text-muted text-sm">{item.region}</div>
                <div className="flex-1 h-8 bg-bg-surface rounded-input overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${(item.score / 100) * 100}%` }}
                  />
                </div>
                <div className="w-12 text-right font-semibold text-text-primary">
                  {item.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Moisture vs Quality */}
      <div className="bg-bg-card rounded-card border border-border shadow-default p-6">
        <h3 className="text-lg font-heading text-text-primary mb-6">
          Moisture Content vs Quality Score
        </h3>
        <div className="h-80 flex items-center justify-center text-text-muted">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p>Scatter plot: Moisture vs SCA Score</p>
            <p className="text-sm mt-1">Optimal range: 10.5-11.5% moisture</p>
          </div>
        </div>
      </div>
    </div>
  );
}
