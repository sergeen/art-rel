import React from 'react';
import './CategoryItem.css';

export interface CategoryItemProps {
  id: string;
  name: string;
  description: string;
  isFilterActive: boolean;
  isExpanded: boolean;
  onToggleFilter: () => void;
  onToggleExpand: () => void;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({
  name,
  description,
  isFilterActive,
  isExpanded,
  onToggleFilter,
  onToggleExpand,
}) => {
  return (
    <div className={`category-item ${isFilterActive ? 'filter-active' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <div className="category-item-header">
        <span className="category-item-name" title={name}>
          {name}
        </span>

        <div className="category-item-actions">
          <button
            type="button"
            className={`category-action-btn filter-btn ${isFilterActive ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFilter();
            }}
            title={isFilterActive ? 'Desactivar filtro' : 'Activar filtro'}
            aria-label={`Filtrar por ${name}`}
            aria-pressed={isFilterActive}
          >
            {/* SVG Filter / Funnel Icon */}
            <svg
              className="category-icon"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="3 4 17 4 11 11 11 16 9 17 9 11 3 4" fill={isFilterActive ? 'currentColor' : 'none'} />
            </svg>
          </button>

          <button
            type="button"
            className={`category-action-btn expand-btn ${isExpanded ? 'rotated' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            title={isExpanded ? 'Ocultar descripción' : 'Mostrar descripción'}
            aria-label={`Ver descripción de ${name}`}
            aria-expanded={isExpanded}
          >
            {/* SVG Caret Down Icon */}
            <svg
              className="category-icon caret-icon"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 8 10 12 14 8" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="category-item-body">
          <p className="category-item-desc">{description}</p>
          <div className="category-item-status">
            <span className="category-status-dot" />
            <span>Sin datos vinculados aún</span>
          </div>
        </div>
      )}
    </div>
  );
};
