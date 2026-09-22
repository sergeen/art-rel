import React, { useState } from 'react';
import './Tabs.css';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
}

export interface TabPaneHeaderProps {
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const TabPaneHeader: React.FC<TabPaneHeaderProps> = ({
  description,
  actions,
  className = '',
}) => {
  if (!description && !actions) return null;

  return (
    <div className={`tab-pane-header ${className}`}>
      {description && <div className="tab-pane-description">{description}</div>}
      {actions && <div className="tab-pane-actions">{actions}</div>}
    </div>
  );
};

export interface TabsProps {
  tabs: TabItem[];
  activeTab?: string;
  defaultActiveTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  tabListClassName?: string;
  paneClassName?: string;
  ariaLabel?: string;
  headerPrefix?: React.ReactNode;
  headerSuffix?: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab: controlledActiveTab,
  defaultActiveTab,
  onChange,
  className = '',
  tabListClassName = '',
  paneClassName = '',
  ariaLabel = 'Pestañas de navegación',
  headerPrefix,
  headerSuffix,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<string>(() => {
    return defaultActiveTab || (tabs.length > 0 ? tabs[0].id : '');
  });

  const isControlled = controlledActiveTab !== undefined;
  const currentActiveId = isControlled ? controlledActiveTab : internalActiveTab;

  const activeTabItem = tabs.find((t) => t.id === currentActiveId) || tabs[0];

  const handleSelectTab = (tabId: string) => {
    if (!isControlled) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
  };

  return (
    <div className={`tabs-container ${className}`}>
      {/* Barra de navegación de pestañas */}
      <div className={`tabs-nav-bar ${tabListClassName}`}>
        {headerPrefix && <div className="tabs-nav-prefix">{headerPrefix}</div>}

        <div className="tabs-list" role="tablist" aria-label={ariaLabel}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabItem?.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                disabled={tab.disabled}
                className={`tab-trigger ${isActive ? 'is-active' : ''} ${
                  tab.disabled ? 'is-disabled' : ''
                }`}
                onClick={() => handleSelectTab(tab.id)}
              >
                {tab.icon && <span className="tab-trigger-icon">{tab.icon}</span>}
                <span className="tab-trigger-label">{tab.label}</span>
                {tab.badge && <span className="tab-trigger-badge">{tab.badge}</span>}
              </button>
            );
          })}
        </div>

        {headerSuffix && <div className="tabs-nav-suffix">{headerSuffix}</div>}
      </div>

      {/* Contenido de la pestaña activa */}
      {activeTabItem && (
        <div
          id={`tabpanel-${activeTabItem.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTabItem.id}`}
          className={`tab-panel ${paneClassName}`}
        >
          <TabPaneHeader
            description={activeTabItem.description}
            actions={activeTabItem.actions}
          />
          <div className="tab-panel-body">{activeTabItem.children}</div>
        </div>
      )}
    </div>
  );
};
