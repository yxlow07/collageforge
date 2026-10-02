'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './page.module.css';
import { PhotoItem, LayoutCell, CollageSettings, ToastMessage, DEFAULT_COLLAGE_SETTINGS } from '@/types/collage';
import { generateCollageLayout, shufflePhotosInCells } from '@/utils/layoutEngine';
import { useCollageHistory } from '@/hooks/useCollageHistory';
import { useColorPalette } from '@/hooks/useColorPalette';
import { Header } from '@/components/Header/Header';
import { Dropzone } from '@/components/Dropzone/Dropzone';
import { CanvasEditor } from '@/components/CanvasEditor/CanvasEditor';
import { SidebarControls } from '@/components/Sidebar/SidebarControls';
import { ExportModal } from '@/components/ExportModal/ExportModal';
import { Toast } from '@/components/Toast/Toast';
import { preloadImages } from '@/utils/imageLoader';

export default function CollageApp() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [cells, setCells] = useState<LayoutCell[]>([]);
  const [settings, setSettings] = useState<CollageSettings>(DEFAULT_COLLAGE_SETTINGS);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [photosMap, setPhotosMap] = useState<Map<string, HTMLImageElement>>(new Map());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const { canUndo, canRedo, pushState, undo, redo, resetHistory } = useCollageHistory(
    [],
    DEFAULT_COLLAGE_SETTINGS
  );

  const {
    suggestedColors,
    isExtracting: isExtractingColors,
    reExtract: handleReExtractColors,
  } = useColorPalette(photosMap, photos.length);


  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Ingest extracted photos
  const handlePhotosLoaded = (newPhotos: PhotoItem[], ignoredCount: number) => {
    if (newPhotos.length < 2) {
      addToast('A minimum of 2 photos is required to build a collage.', 'warning');
      return;
    }

    if (newPhotos.length > 100) {
      addToast(
        `Loaded ${newPhotos.length} photos. Large sets may require extra canvas memory.`,
        'warning'
      );
    } else {
      let msg = `Successfully loaded ${newPhotos.length} photos.`;
      if (ignoredCount > 0) {
        msg += ` (${ignoredCount} non-image files ignored)`;
      }
      addToast(msg, 'success');
    }

    setPhotos(newPhotos);
    preloadImages(newPhotos, (map) => setPhotosMap(map));

    const newCells = generateCollageLayout(
      newPhotos,
      settings.canvasWidth,
      settings.canvasHeight,
      settings.templateId
    );
    setCells(newCells);
    setSelectedCellId(null);
    resetHistory(newCells, settings);
  };

  // Re-roll layout (randomized variations of current template)
  const handleRerollLayout = useCallback(() => {
    if (photos.length === 0) return;
    const newCells = generateCollageLayout(
      photos,
      settings.canvasWidth,
      settings.canvasHeight,
      settings.templateId
    );
    setCells(newCells);
    pushState(newCells, settings);
    addToast('Regenerated dynamic layout', 'info');
  }, [photos, settings, pushState, addToast]);

  // Shuffle photos inside current grid
  const handleShufflePhotos = useCallback(() => {
    if (cells.length === 0 || photos.length === 0) return;
    const shuffled = shufflePhotosInCells(cells, photos);
    setCells(shuffled);
    pushState(shuffled, settings);
    addToast('Shuffled photos across cells', 'info');
  }, [cells, photos, settings, pushState, addToast]);

  // Swap two cells on drag-drop
  const handleSwapCells = (idA: string, idB: string) => {
    const idxA = cells.findIndex((c) => c.id === idA);
    const idxB = cells.findIndex((c) => c.id === idB);
    if (idxA === -1 || idxB === -1) return;

    const updated = [...cells];
    const tempPhoto = updated[idxA].photoId;
    updated[idxA] = {
      ...updated[idxA],
      photoId: updated[idxB].photoId,
      transform: { zoom: 1, offsetX: 0, offsetY: 0 },
    };
    updated[idxB] = {
      ...updated[idxB],
      photoId: tempPhoto,
      transform: { zoom: 1, offsetX: 0, offsetY: 0 },
    };

    setCells(updated);
    pushState(updated, settings);
    addToast('Swapped photo positions', 'info');
  };

  // Update pan/zoom
  const handleUpdateTransform = (
    cellId: string,
    transform: { zoom?: number; offsetX?: number; offsetY?: number }
  ) => {
    setCells((prev) =>
      prev.map((c) =>
        c.id === cellId ? { ...c, transform: { ...c.transform, ...transform } } : c
      )
    );
  };

  // Update global settings
  const handleUpdateSettings = (newSettings: Partial<CollageSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    const templateChanged =
      newSettings.templateId !== undefined && newSettings.templateId !== settings.templateId;
    const dimensionChanged =
      newSettings.canvasWidth !== undefined &&
      (newSettings.canvasWidth !== settings.canvasWidth ||
        newSettings.canvasHeight !== settings.canvasHeight);

    if (templateChanged || dimensionChanged) {
      const regenerated = generateCollageLayout(
        photos,
        updated.canvasWidth,
        updated.canvasHeight,
        updated.templateId
      );
      setCells(regenerated);
      pushState(regenerated, updated);
      if (templateChanged) {
        addToast(`Applied ${updated.templateId.replace('_', ' ')} template`, 'info');
      }
    } else {
      pushState(cells, updated);
    }
  };

  const handleUndoAction = useCallback(() => {
    const snapshot = undo();
    if (snapshot) {
      setCells(snapshot.cells);
      setSettings(snapshot.settings);
    }
  }, [undo]);

  const handleRedoAction = useCallback(() => {
    const snapshot = redo();
    if (snapshot) {
      setCells(snapshot.cells);
      setSettings(snapshot.settings);
    }
  }, [redo]);

  // Keyboard Shortcuts (Undo, Redo, Reroll, Shuffle, Export)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (mod && key === 'z') {
        e.preventDefault();
        e.shiftKey ? handleRedoAction() : handleUndoAction();
      } else if (mod && key === 'y') {
        e.preventDefault();
        handleRedoAction();
      } else if (mod && key === 'e' && photos.length > 0) {
        e.preventDefault();
        setIsExportOpen(true);
      } else if (!mod && key === 'r') {
        e.preventDefault();
        handleRerollLayout();
      } else if (!mod && key === 's') {
        e.preventDefault();
        handleShufflePhotos();
      } else if (key === 'escape') {
        setSelectedCellId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndoAction, handleRedoAction, handleRerollLayout, handleShufflePhotos, photos.length]);

  const selectedCell = cells.find((c) => c.id === selectedCellId) || null;

  return (
    <div className={styles.appContainer}>
      <Header
        photoCount={photos.length}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndoAction}
        onRedo={handleRedoAction}
        onRerollLayout={handleRerollLayout}
        onShufflePhotos={handleShufflePhotos}
        onOpenExport={() => setIsExportOpen(true)}
        onReset={() => {
          setPhotos([]);
          setCells([]);
          setSelectedCellId(null);
        }}
      />

      <main className={styles.mainContent}>
        {photos.length === 0 ? (
          <div className={styles.emptyHero}>
            <div className={styles.heroText}>
              <h2 className={styles.heroTitle}>Automated Random Collage Creator</h2>
              <p className={styles.heroDesc}>
                Drop an entire folder or .zip archive of pictures.
              </p>
            </div>
            <Dropzone onPhotosLoaded={handlePhotosLoaded} />
          </div>
        ) : (
          <div className={styles.editorLayout}>
            <CanvasEditor
              cells={cells}
              photosMap={photosMap}
              settings={settings}
              selectedCellId={selectedCellId}
              onSelectCell={setSelectedCellId}
              onSwapCells={handleSwapCells}
              onUpdateTransform={handleUpdateTransform}
            />
            <SidebarControls
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              selectedCell={selectedCell}
              onUpdateSelectedCell={(t) => selectedCellId && handleUpdateTransform(selectedCellId, t)}
              totalPhotos={photos.length}
              suggestedColors={suggestedColors}
              isExtractingColors={isExtractingColors}
              onReExtractColors={handleReExtractColors}
            />
          </div>
        )}
      </main>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        cells={cells}
        photosMap={photosMap}
        settings={settings}
        onSuccess={(fileName) => addToast(`Exported ${fileName}`, 'success')}
        onError={(err) => addToast(`Export failed: ${err}`, 'error')}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
