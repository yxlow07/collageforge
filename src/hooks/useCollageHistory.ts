import { useState, useCallback } from 'react';
import { LayoutCell, CollageSettings } from '@/types/collage';

interface HistorySnapshot {
  cells: LayoutCell[];
  settings: CollageSettings;
}

export function useCollageHistory(
  initialCells: LayoutCell[],
  initialSettings: CollageSettings
) {
  const [history, setHistory] = useState<HistorySnapshot[]>([
    { cells: initialCells, settings: initialSettings },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushState = useCallback((cells: LayoutCell[], settings: CollageSettings) => {
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, { cells, settings }];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback((): HistorySnapshot | null => {
    if (!canUndo) return null;
    const newIdx = historyIndex - 1;
    setHistoryIndex(newIdx);
    return history[newIdx];
  }, [canUndo, historyIndex, history]);

  const redo = useCallback((): HistorySnapshot | null => {
    if (!canRedo) return null;
    const newIdx = historyIndex + 1;
    setHistoryIndex(newIdx);
    return history[newIdx];
  }, [canRedo, historyIndex, history]);

  const resetHistory = useCallback((cells: LayoutCell[], settings: CollageSettings) => {
    setHistory([{ cells, settings }]);
    setHistoryIndex(0);
  }, []);

  return {
    canUndo,
    canRedo,
    pushState,
    undo,
    redo,
    resetHistory,
  };
}
