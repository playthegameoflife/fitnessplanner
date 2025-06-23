
import React from 'react';
import { TabKey } from '../types';

interface TabButtonProps {
  label: string;
  IconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  isActive: boolean;
  onClick: () => void;
  hasContent: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ label, IconComponent, isActive, onClick, hasContent }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center justify-center space-x-2 px-3 py-3 sm:px-4 sm:py-3 text-sm font-medium rounded-t-lg
      focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-150 ease-in-out
      group w-full sm:w-auto
      ${isActive 
        ? 'bg-emerald-600 text-white shadow-md'
        : 'text-slate-300 hover:bg-slate-700 hover:text-emerald-300'}
    `}
  >
    <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-300'}`} />
    <span className="hidden sm:inline">{label}</span>
    {hasContent && !isActive && <span className="ml-1 w-2 h-2 bg-green-500 rounded-full"></span>}
  </button>
);

interface TabsProps {
  activeTab: TabKey;
  onTabChange: (tabKey: TabKey) => void;
  tabsConfig: Array<{ key: TabKey; label: string; IconComponent: React.FC<React.SVGProps<SVGSVGElement>>; hasContentCheck?: () => boolean }>;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, tabsConfig }) => {
  return (
    <div className="mb-6 border-b border-slate-700">
      <nav className="-mb-px flex flex-wrap sm:flex-nowrap" aria-label="Tabs">
        {tabsConfig.map((tab) => (
          <TabButton
            key={tab.key}
            label={tab.label}
            IconComponent={tab.IconComponent}
            isActive={activeTab === tab.key}
            onClick={() => onTabChange(tab.key)}
            hasContent={tab.hasContentCheck ? tab.hasContentCheck() : false}
          />
        ))}
      </nav>
    </div>
  );
};
