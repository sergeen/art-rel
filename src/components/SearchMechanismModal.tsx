import React, { useEffect } from 'react';
import {
  SEARCH_STRATEGIES,
  type SearchConfig,
  type SearchMechanismId,
} from '../schema';
import './SearchMechanismModal.css';

export interface SearchMechanismModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SearchConfig;
  onChangeConfig: (newConfig: SearchConfig) => void;
}

export const SearchMechanismModal: React.FC<SearchMechanismModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  // Manejo de tecla Escape para cerrar
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectMechanism = (id: SearchMechanismId) => {
    onChangeConfig({
      ...config,
      mechanismId: id,
    });
  };

  const handleDistanceChange = (distance: number) => {
    const clamped = Math.max(1, Math.min(4, distance));
    onChangeConfig({
      ...config,
      levenshtein: {
        ...config.levenshtein,
        maxDistance: clamped,
      },
    });
  };

  return (
    <div
      className="search-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="search-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
      >
        {/* Cabecera del Modal */}
        <div className="search-modal-header">
          <div className="search-modal-title-group">
            <div className="search-modal-icon-badge">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <path d="M11 8v6M8 11h6" />
              </svg>
            </div>
            <div>
              <h2 id="search-modal-title" className="search-modal-title">
                Mecanismo de Búsqueda
              </h2>
              <p className="search-modal-subtitle">
                Selecciona cómo se exploran y exponen los criterios en la barra lateral
              </p>
            </div>
          </div>

          <button
            type="button"
            className="search-modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Lista de Mecanismos Disponibles */}
        <div className="search-modal-body">
          <div className="search-mechanisms-list">
            {SEARCH_STRATEGIES.map((strategy) => {
              const isSelected = config.mechanismId === strategy.id;

              return (
                <div
                  key={strategy.id}
                  className={`search-mechanism-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelectMechanism(strategy.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectMechanism(strategy.id);
                    }
                  }}
                >
                  <div className="search-mechanism-header">
                    <div className="search-mechanism-radio">
                      <span className={`radio-dot ${isSelected ? 'is-active' : ''}`} />
                    </div>
                    <div className="search-mechanism-info">
                      <div className="search-mechanism-name-row">
                        <span className="search-mechanism-name">{strategy.name}</span>
                        {strategy.id === 'levenshtein' && (
                          <span className="mechanism-badge badge-levenshtein">
                            Ajustable
                          </span>
                        )}
                        {strategy.id === 'contains' && (
                          <span className="mechanism-badge badge-default">
                            Predeterminado
                          </span>
                        )}
                        {strategy.id === 'exact' && (
                          <span className="mechanism-badge badge-strict">
                            Estricto
                          </span>
                        )}
                      </div>
                      <p className="search-mechanism-desc">{strategy.fullDescription}</p>
                    </div>
                  </div>

                  {/* Parámetros interactivos específicos (Levenshtein) */}
                  {strategy.id === 'levenshtein' && isSelected && (
                    <div
                      className="search-mechanism-config-box"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="config-box-header">
                        <span className="config-label">
                          Distancia máxima de edición
                        </span>
                        <span className="config-value-badge">
                          {config.levenshtein.maxDistance} {config.levenshtein.maxDistance === 1 ? 'cambio' : 'cambios'}
                        </span>
                      </div>

                      <div className="config-slider-row">
                        <span className="slider-limit-label">1</span>
                        <input
                          type="range"
                          min="1"
                          max="4"
                          step="1"
                          value={config.levenshtein.maxDistance}
                          onChange={(e) => handleDistanceChange(Number(e.target.value))}
                          className="levenshtein-slider"
                          aria-label="Distancia máxima de Levenshtein"
                        />
                        <span className="slider-limit-label">4</span>
                      </div>

                      <div className="config-explanation">
                        {config.levenshtein.maxDistance === 1 && (
                          <span><strong>Tolerancia baja (1):</strong> detecta un error de una sola letra (ej. "pape" o "papell" para "papel").</span>
                        )}
                        {config.levenshtein.maxDistance === 2 && (
                          <span><strong>Tolerancia equilibrada (2 - recomendada):</strong> tolera errores comunes de tipeo y variantes morfológicas.</span>
                        )}
                        {config.levenshtein.maxDistance === 3 && (
                          <span><strong>Tolerancia alta (3):</strong> amplía significativamente el rango de palabras similares.</span>
                        )}
                        {config.levenshtein.maxDistance >= 4 && (
                          <span><strong>Tolerancia máxima (4):</strong> resultados muy flexibles e inclusivos.</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="search-modal-footer">
          <div className="footer-hint">
            La arquitectura está desacoplada para admitir futuros mecanismos sin alterar el motor de renderizado.
          </div>
          <button
            type="button"
            className="search-modal-apply-btn"
            onClick={onClose}
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
