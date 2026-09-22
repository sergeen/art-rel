import React, { useState, useRef, useEffect } from 'react';
import type { SavedCriteriaPreset } from '../schema';
import {
  serializeCategoryFilters,
  deserializeCategoryFilters,
} from '../schema';
import { READING_CATEGORIES } from '../schema';
import './CriteriaModal.css';

export interface CriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCriteria: Record<string, Set<string>>;
  presets: SavedCriteriaPreset[];
  onApplyCriteria: (criteria: Record<string, Set<string>>, presetName?: string) => void;
  onSavePreset: (preset: SavedCriteriaPreset) => void;
  onDeletePreset: (id: string) => void;
}

export const CriteriaModal: React.FC<CriteriaModalProps> = ({
  isOpen,
  onClose,
  currentCriteria,
  presets,
  onApplyCriteria,
  onSavePreset,
  onDeletePreset,
}) => {
  const [newPresetName, setNewPresetName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputNameRef = useRef<HTMLInputElement>(null);

  // Cantidad total de criterios seleccionados actualmente
  const activeValuesList = React.useMemo(() => {
    const list: { categoryId: string; categoryName: string; value: string }[] = [];
    for (const [catId, set] of Object.entries(currentCriteria)) {
      if (!set || set.size === 0) continue;
      const catMeta = READING_CATEGORIES.find((c) => c.id === catId);
      const categoryName = catMeta ? catMeta.name : catId;
      for (const val of set) {
        list.push({ categoryId: catId, categoryName, value: val });
      }
    }
    return list;
  }, [currentCriteria]);

  const hasActiveCriteria = activeValuesList.length > 0;

  // Manejo de la tecla Escape para cerrar
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

  // Limpiar mensajes y enfocar input al abrir
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setTimeout(() => {
        inputNameRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Helper para descargar archivos JSON en el navegador
  const downloadJson = (filename: string, data: unknown) => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccessMessage(`Archivo "${link.download}" exportado correctamente.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setErrorMessage('Error al generar la descarga del archivo JSON.');
      console.error(err);
    }
  };

  // Guardar estado actual como preset
  const handleSaveCurrent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = newPresetName.trim();
    if (!trimmedName) {
      setErrorMessage('Por favor, ingresa un nombre para el criterio.');
      return;
    }

    if (!hasActiveCriteria) {
      setErrorMessage('No hay criterios activos seleccionados para guardar.');
      return;
    }

    const serialized = serializeCategoryFilters(currentCriteria);

    const newPreset: SavedCriteriaPreset = {
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: trimmedName,
      createdAt: new Date().toISOString(),
      criteria: serialized,
    };

    onSavePreset(newPreset);
    setNewPresetName('');
    setErrorMessage(null);
    setSuccessMessage(`Criterio "${trimmedName}" guardado localmente.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Exportar el estado actual como JSON
  const handleExportCurrent = () => {
    if (!hasActiveCriteria) {
      setErrorMessage('No hay criterios activos actualmente para exportar.');
      return;
    }

    const serialized = serializeCategoryFilters(currentCriteria);
    const dateStr = new Date().toISOString().slice(0, 10);
    const exportPayload = {
      name: newPresetName.trim() || `Criterios_${dateStr}`,
      createdAt: new Date().toISOString(),
      criteria: serialized,
    };

    downloadJson(`criterios_art_rel_${dateStr}.json`, exportPayload);
  };

  // Exportar un preset guardado específico
  const handleExportPreset = (preset: SavedCriteriaPreset) => {
    const safeName = preset.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9áéíóúñ_-]+/gi, '_');
    downloadJson(`criterio_${safeName}.json`, preset);
  };

  // Cargar archivo JSON local desde el disco
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const deserialized = deserializeCategoryFilters(parsed);

        const totalItems = Object.values(deserialized).reduce((acc, s) => acc + s.size, 0);
        if (totalItems === 0) {
          setErrorMessage('El archivo JSON no contiene criterios de lectura reconocibles.');
          return;
        }

        // Determinar nombre del criterio desde el JSON o nombre de archivo
        const importedName =
          (typeof parsed === 'object' && parsed !== null && 'name' in parsed && typeof parsed.name === 'string')
            ? parsed.name
            : file.name.replace(/\.[^/.]+$/, '');

        // Aplicar inmediatamente al grafo
        onApplyCriteria(deserialized, importedName);

        // Además, guardarlo en la lista de presets locales
        const newPreset: SavedCriteriaPreset = {
          id: `preset_imp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          name: importedName,
          createdAt: new Date().toISOString(),
          criteria: serializeCategoryFilters(deserialized),
        };
        onSavePreset(newPreset);

        setErrorMessage(null);
        setSuccessMessage(`"${importedName}" cargado y aplicado al grafo (${totalItems} términos).`);
        setTimeout(() => setSuccessMessage(null), 4000);
      } catch (err) {
        console.error('Error al procesar archivo JSON:', err);
        setErrorMessage('El archivo no tiene un formato JSON válido.');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      setErrorMessage('Error al leer el archivo local.');
    };

    reader.readAsText(file);
  };

  return (
    <div className="criteria-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="criteria-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado del Modal */}
        <div className="criteria-modal-header">
          <div className="criteria-modal-title-group">
            <svg
              className="criteria-modal-header-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <h2 className="criteria-modal-title">Gestión de Criterios</h2>
            <span className="criteria-modal-badge">{presets.length} guardados</span>
          </div>

          <button
            type="button"
            className="criteria-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Feedback visual de errores o éxitos */}
        {errorMessage && (
          <div className="criteria-modal-alert alert-error">
            <span>⚠️ {errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage(null)} className="alert-dismiss">
              ✕
            </button>
          </div>
        )}
        {successMessage && (
          <div className="criteria-modal-alert alert-success">
            <span>✓ {successMessage}</span>
            <button type="button" onClick={() => setSuccessMessage(null)} className="alert-dismiss">
              ✕
            </button>
          </div>
        )}

        {/* Barra superior de Importación / Exportación directa */}
        <div className="criteria-modal-io-bar">
          <button
            type="button"
            className="btn-io-action btn-export-current"
            onClick={handleExportCurrent}
            disabled={!hasActiveCriteria}
            title={hasActiveCriteria ? 'Exportar estado actual como archivo JSON descargable' : 'Selecciona criterios primero para exportar'}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Exportar actual JSON</span>
          </button>

          <button
            type="button"
            className="btn-io-action btn-import-json"
            onClick={() => fileInputRef.current?.click()}
            title="Cargar archivo JSON de criterios desde tu computadora"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Cargar JSON local</span>
          </button>

          {/* Input invisible para selección de archivo */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            style={{ display: 'none' }}
          />
        </div>

        {/* Sección: Guardar estado actual */}
        <div className="criteria-modal-section save-section">
          <div className="criteria-section-label">
            <span>Guardar selección actual</span>
            {hasActiveCriteria ? (
              <span className="criteria-active-summary">
                {activeValuesList.length} {activeValuesList.length === 1 ? 'criterio activo' : 'criterios activos'}
              </span>
            ) : (
              <span className="criteria-active-summary text-dimmed">Sin criterios activos</span>
            )}
          </div>

          {hasActiveCriteria && (
            <div className="criteria-pills-preview">
              {activeValuesList.slice(0, 8).map((item, idx) => (
                <span key={`${item.categoryId}-${item.value}-${idx}`} className="criteria-preview-tag">
                  <strong>{item.categoryName}:</strong> {item.value}
                </span>
              ))}
              {activeValuesList.length > 8 && (
                <span className="criteria-preview-tag-more">
                  +{activeValuesList.length - 8} más
                </span>
              )}
            </div>
          )}

          <form className="criteria-save-form" onSubmit={handleSaveCurrent}>
            <input
              ref={inputNameRef}
              type="text"
              className="criteria-input-name"
              placeholder={hasActiveCriteria ? 'Nombre del criterio (ej. Papel y Memoria)...' : 'Selecciona criterios en la barra primero...'}
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              disabled={!hasActiveCriteria}
            />
            <button
              type="submit"
              className="criteria-btn-save"
              disabled={!hasActiveCriteria || !newPresetName.trim()}
            >
              Guardar
            </button>
          </form>
        </div>

        {/* Sección: Lista de Criterios Guardados */}
        <div className="criteria-modal-section list-section">
          <div className="criteria-section-label">
            <span>Criterios Guardados</span>
          </div>

          <div className="criteria-presets-list">
            {presets.length === 0 ? (
              <div className="criteria-empty-state">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.4, margin: '0 auto 8px auto', display: 'block' }}
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <p className="criteria-empty-title">No hay criterios guardados aún</p>
                <p className="criteria-empty-desc">
                  Selecciona filtros en la barra lateral y guárdalos aquí o carga un archivo JSON.
                </p>
              </div>
            ) : (
              presets.map((preset) => {
                const totalTerms = Object.values(preset.criteria).reduce(
                  (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
                  0
                );

                const dateDisplay = preset.createdAt
                  ? new Date(preset.createdAt).toLocaleDateString(undefined, {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <div key={preset.id} className="criteria-preset-card">
                    <div className="preset-info">
                      <div className="preset-header-line">
                        <span className="preset-name" title={preset.name}>
                          {preset.name}
                        </span>
                        {dateDisplay && <span className="preset-date">{dateDisplay}</span>}
                      </div>

                      {/* Etiquetas de categorías del preset */}
                      <div className="preset-tags">
                        {Object.entries(preset.criteria).map(([catId, vals]) => {
                          if (!Array.isArray(vals) || vals.length === 0) return null;
                          const catMeta = READING_CATEGORIES.find((c) => c.id === catId);
                          const catName = catMeta ? catMeta.name : catId;
                          return (
                            <span key={catId} className="preset-cat-tag">
                              {catName} <span className="tag-count">({vals.length})</span>
                            </span>
                          );
                        })}
                        <span className="preset-total-terms">{totalTerms} términos</span>
                      </div>
                    </div>

                    <div className="preset-actions">
                      <button
                        type="button"
                        className="preset-btn-apply"
                        onClick={() => {
                          const deserialized = deserializeCategoryFilters(preset.criteria);
                          onApplyCriteria(deserialized, preset.name);
                          setSuccessMessage(`Criterio "${preset.name}" aplicado.`);
                          setTimeout(() => setSuccessMessage(null), 2500);
                        }}
                        title="Aplicar este criterio al grafo"
                      >
                        Aplicar
                      </button>

                      <button
                        type="button"
                        className="preset-icon-btn export-icon-btn"
                        onClick={() => handleExportPreset(preset)}
                        title="Exportar este criterio como archivo JSON"
                        aria-label="Exportar criterio JSON"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        className="preset-icon-btn delete-icon-btn"
                        onClick={() => {
                          if (window.confirm(`¿Eliminar el criterio "${preset.name}"?`)) {
                            onDeletePreset(preset.id);
                          }
                        }}
                        title="Eliminar de guardados locales"
                        aria-label="Eliminar criterio"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
