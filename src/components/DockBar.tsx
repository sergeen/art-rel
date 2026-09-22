import React, { useState } from 'react';
import './DockBar.css';

export type DockPosition = 'left' | 'right' | 'top' | 'bottom';

export interface DockBarProps {
  position?: DockPosition;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const DockBar: React.FC<DockBarProps> = ({
  position = 'left',
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onToggleCollapse,
  title,
  subtitle,
  headerActions,
  children,
  className = '',
  ariaLabel = 'Barra de navegación',
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);

  const isControlled = controlledCollapsed !== undefined;
  const isCollapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    const nextState = !isCollapsed;
    if (!isControlled) {
      setInternalCollapsed(nextState);
    }
    if (onToggleCollapse) {
      onToggleCollapse(nextState);
    }
  };

  // Ícono de flecha/chevron adecuado según la posición y el estado colapsado/expandido
  const getToggleIcon = () => {
    switch (position) {
      case 'left':
        return isCollapsed ? (
          // Apunta a la derecha para expandir
          <polyline points="9 18 15 12 9 6" />
        ) : (
          // Apunta a la izquierda para colapsar
          <polyline points="15 18 9 12 15 6" />
        );
      case 'right':
        return isCollapsed ? (
          // Apunta a la izquierda para expandir
          <polyline points="15 18 9 12 15 6" />
        ) : (
          // Apunta a la derecha para colapsar
          <polyline points="9 18 15 12 9 6" />
        );
      case 'top':
        return isCollapsed ? (
          // Apunta abajo para expandir
          <polyline points="6 9 12 15 18 9" />
        ) : (
          // Apunta arriba para colapsar
          <polyline points="18 15 12 9 6 15" />
        );
      case 'bottom':
        return isCollapsed ? (
          // Apunta arriba para expandir
          <polyline points="18 15 12 9 6 15" />
        ) : (
          // Apunta abajo para colapsar
          <polyline points="6 9 12 15 18 9" />
        );
    }
  };

  const getToggleLabel = () => {
    if (isCollapsed) {
      return `Expandir barra ${position}`;
    }
    return `Colapsar barra ${position}`;
  };

  return (
    <aside
      className={`dock-bar dock-bar-${position} ${isCollapsed ? 'is-collapsed' : 'is-expanded'} ${className}`}
      aria-label={ariaLabel}
    >
      <div className="dock-bar-container">
        {(title || subtitle || headerActions) && (
          <div className="dock-bar-header">
            <div className="dock-bar-title-group">
              {title && <div className="dock-bar-title">{title}</div>}
              {subtitle && <div className="dock-bar-subtitle">{subtitle}</div>}
            </div>

            {headerActions && (
              <div className="dock-bar-header-actions">
                {headerActions}
              </div>
            )}
          </div>
        )}

        <div className="dock-bar-content">
          {children}
        </div>
      </div>

      {/* Pestaña / Botón sobresaliente para expandir cuando está colapsado (o alternar) */}
      <button
        type="button"
        className={`dock-bar-protruding-tab dock-tab-${position}`}
        onClick={handleToggle}
        title={getToggleLabel()}
        aria-label={getToggleLabel()}
      >
        <svg
          className="dock-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {getToggleIcon()}
        </svg>
      </button>
    </aside>
  );
};
