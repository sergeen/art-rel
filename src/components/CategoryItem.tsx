import React from 'react';
import './CategoryItem.css';

export interface CategoryItemProps {
  id: string;
  name: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  values?: string[];
  selectedValues?: Set<string>;
  onToggleValue?: (value: string) => void;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({
  name,
  isExpanded,
  onToggleExpand,
  values = [],
  selectedValues = new Set(),
  onToggleValue,
}) => {
  const hasSelectedValues = selectedValues.size > 0;
  const hasData = values.length > 0;

  return (
    <div
      className={`category-item ${hasSelectedValues ? 'filter-active' : ''} ${
        isExpanded ? 'expanded' : ''
      }`}
    >
      <button
        type="button"
        className="category-item-header"
        onClick={onToggleExpand}
        aria-expanded={isExpanded}
      >
        <span className="category-item-name">{name}</span>

        <span className={`category-caret ${isExpanded ? 'rotated' : ''}`}>
          <svg
            className="category-caret-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 8 10 12 14 8" />
          </svg>
        </span>
      </button>

      {isExpanded && (
        <div className="category-item-body">
          {hasData ? (
            <div className="category-pills">
              {values.map((val) => {
                const isSelected = selectedValues.has(val.toLowerCase().trim());
                return (
                  <button
                    key={val}
                    type="button"
                    className={`category-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => onToggleValue?.(val)}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="category-empty">
              Sin registros para este criterio
            </div>
          )}
        </div>
      )}
    </div>
  );
};
