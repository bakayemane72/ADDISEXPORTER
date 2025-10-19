"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
}

interface SegmentedTabsProps {
  tabs: Tab[];
  defaultTab: string;
  onChange?: (tabId: string) => void;
}

export function SegmentedTabs({ tabs, defaultTab, onChange }: SegmentedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className="segmented-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={`segmented-tab ${activeTab === tab.id ? "segmented-tab-active" : ""}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
