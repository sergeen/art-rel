import React, { useState } from 'react';
import './CategoryItem.css';

export interface CategoryValueCount {
  value: string;
  count: number;
}

export interface CategoryArtistRow {
  artistName: string;
  values: string[];
}

export interface CategoryItemProps {
  id: string;
  name: string;
  description: string;
  isFilterActive: boolean;
  isExpanded: boolean;
  onToggleFilter: () => void;
  onToggleExpand: () => void;
  valuesWithCount?: CategoryValueCount[];
  artistRows?: CategoryArtistRow[];
  selectedValues?: Set<string>;
  onToggleValue?: (value: string) => void;
  onClearValues?: () => void;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({
  name,
  description,
  isFilterActive,
  isExpanded,
  onToggleFilter,
  onToggleExpand,
  valuesWithCount = [],
  artistRows = [],
  selectedValues = new Set(),
  onToggleValue,
  onClearValues,
}) => {
  const [viewMode, setViewMode] = useState<'values' | 'artists'>('values');
  const hasData = valuesWithCount.length > 0;
  const hasSelectedValues = selectedValues.size > 0;

  return (
    <div
      className={`category-item ${isFilterActive || hasSelectedValues ? 'filter-active' : ''} ${
        isExpanded ? 'expanded' : ''
      }`}
    >
      <div className="category-item-header">
        <div className="category-item-title-wrap">
          <span className="category-item-name" title={name}>
            {name}
          </span>
          {hasData && (
            <span className="category-item-badge" title={`${valuesWithCount.length} términos registrados`}>
              {valuesWithCount.length}
            </span>
          )}
        </div>

        <div className="category-item-actions">
          <button
            type="button"
            className={`category-action-btn filter-btn ${isFilterActive || hasSelectedValues ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFilter();
            }}
            title={
              isFilterActive
                ? 'Desactivar filtro de categoría'
                : 'Filtrar nodos que tienen esta categoría'
            }
            aria-label={`Filtrar por ${name}`}
            aria-pressed={isFilterActive || hasSelectedValues}
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
              <polygon
                points="3 4 17 4 11 11 11 16 9 17 9 11 3 4"
                fill={isFilterActive || hasSelectedValues ? 'currentColor' : 'none'}
              />
            </svg>
          </button>

          <button
            type="button"
            className={`category-action-btn expand-btn ${isExpanded ? 'rotated' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            title={isExpanded ? 'Ocultar datos y descripción' : 'Mostrar datos y descripción'}
            aria-label={`Ver descripción y tabla de ${name}`}
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

          {hasData ? (
            <div className="category-table-wrapper">
              {/* Barra de control de la tabla */}
              <div className="category-table-controls">
                <div className="category-table-tabs">
                  <button
                    type="button"
                    className={`cat-tab-btn ${viewMode === 'values' ? 'active' : ''}`}
                    onClick={() => setViewMode('values')}
                  >
                    Valores ({valuesWithCount.length})
                  </button>
                  <button
                    type="button"
                    className={`cat-tab-btn ${viewMode === 'artists' ? 'active' : ''}`}
                    onClick={() => setViewMode('artists')}
                  >
                    Artistas ({artistRows.length})
                  </button>
                </div>

                {hasSelectedValues && onClearValues && (
                  <button
                    type="button"
                    className="cat-clear-btn"
                    onClick={onClearValues}
                    title="Quitar filtros de esta categoría"
                  >
                    Limpiar ({selectedValues.size})
                  </button>
                )}
              </div>

              {/* Vista 1: Tabla de Valores y frecuencias */}
              {viewMode === 'values' && (
                <div className="category-table-scroll">
                  <table className="category-compact-table">
                    <thead>
                      <tr>
                        <th className="th-term">Término</th>
                        <th className="th-count">Cant.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {valuesWithCount.map(({ value, count }) => {
                        const isSelected = selectedValues.has(value.toLowerCase().trim());
                        return (
                          <tr
                            key={value}
                            className={`category-row-clickable ${isSelected ? 'row-selected' : ''}`}
                            onClick={() => onToggleValue?.(value)}
                            title={`Clic para filtrar por ${value}`}
                          >
                            <td className="td-term">
                              <span className={`custom-checkbox ${isSelected ? 'checked' : ''}`}>
                                {isSelected ? '✓' : ''}
                              </span>
                              <span className="term-name">{value}</span>
                            </td>
                            <td className="td-count">{count}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Vista 2: Tabla por Artista */}
              {viewMode === 'artists' && (
                <div className="category-table-scroll">
                  <table className="category-compact-table">
                    <thead>
                      <tr>
                        <th className="th-artist">Artista</th>
                        <th className="th-detail">Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {artistRows.map(({ artistName, values }) => (
                        <tr key={artistName} className="category-row-artist">
                          <td className="td-artist">{artistName}</td>
                          <td className="td-detail">
                            <div className="artist-value-tags">
                              {values.map((v) => (
                                <span
                                  key={v}
                                  className={`artist-mini-tag ${
                                    selectedValues.has(v.toLowerCase().trim()) ? 'active' : ''
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleValue?.(v);
                                  }}
                                  title={`Filtrar por ${v}`}
                                >
                                  {v}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="category-item-status">
              <span className="category-status-dot" />
              <span>Sin registros para esta categoría</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
