'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './CanvasEditor.module.css';
import { LayoutCell, CollageSettings } from '@/types/collage';
import { renderCollage, calculatePixelCells } from '@/utils/canvasRenderer';
import { ZoomIn, ZoomOut, Move, Shuffle } from 'lucide-react';

interface CanvasEditorProps {
  cells: LayoutCell[];
  photosMap: Map<string, HTMLImageElement>;
  settings: CollageSettings;
  selectedCellId: string | null;
  onSelectCell: (cellId: string | null) => void;
  onSwapCells: (cellIdA: string, cellIdB: string) => void;
  onUpdateTransform: (cellId: string, transform: { zoom?: number; offsetX?: number; offsetY?: number }) => void;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  cells,
  photosMap,
  settings,
  selectedCellId,
  onSelectCell,
  onSwapCells,
  onUpdateTransform,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);

  // Convert client mouse/touch point to canvas coordinate
  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = settings.canvasWidth / rect.width;
      const scaleY = settings.canvasHeight / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [settings.canvasWidth, settings.canvasHeight]
  );

  // Find cell at canvas coordinates
  const findCellAt = useCallback(
    (x: number, y: number): LayoutCell | null => {
      const pixelCells = calculatePixelCells(
        cells,
        settings.canvasWidth,
        settings.canvasHeight,
        settings.gap
      );
      for (const p of pixelCells) {
        if (x >= p.x && x <= p.x + p.width && y >= p.y && y <= p.y + p.height) {
          return cells.find((c) => c.id === p.cellId) || null;
        }
      }
      return null;
    },
    [cells, settings]
  );

  // Redraw canvas whenever dependencies change
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderCollage({
      canvas,
      ctx,
      cells,
      photosMap,
      settings,
      selectedCellId,
      dragOverCellId: dragOverId,
      draggingCellId: dragSourceId,
      scale: 1,
    });
  }, [cells, photosMap, settings, selectedCellId, dragOverId, dragSourceId]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Mouse Down: Start Pan or Drag-and-Swap
  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const hit = findCellAt(coords.x, coords.y);

    if (!hit) {
      onSelectCell(null);
      return;
    }

    if (selectedCellId === hit.id) {
      // Already selected -> enter panning mode
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    } else {
      // Select and prepare potential drag-and-swap
      onSelectCell(hit.id);
      setDragSourceId(hit.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);

    // If panning inside selected cell
    if (isPanning && panStart && selectedCellId) {
      const activeCell = cells.find((c) => c.id === selectedCellId);
      if (activeCell) {
        const dx = (e.clientX - panStart.x) * 0.005;
        const dy = (e.clientY - panStart.y) * 0.005;
        onUpdateTransform(selectedCellId, {
          offsetX: Math.max(-1, Math.min(1, activeCell.transform.offsetX + dx)),
          offsetY: Math.max(-1, Math.min(1, activeCell.transform.offsetY + dy)),
        });
        setPanStart({ x: e.clientX, y: e.clientY });
      }
      return;
    }

    // If dragging to swap
    if (dragSourceId) {
      const hit = findCellAt(coords.x, coords.y);
      if (hit && hit.id !== dragSourceId) {
        setDragOverId(hit.id);
      } else {
        setDragOverId(null);
      }
    }
  };

  const handleMouseUp = () => {
    if (dragSourceId && dragOverId && dragSourceId !== dragOverId) {
      onSwapCells(dragSourceId, dragOverId);
    }
    setDragSourceId(null);
    setDragOverId(null);
    setIsPanning(false);
    setPanStart(null);
  };

  // Wheel event for focal zoom on hover/selection
  const handleWheel = (e: React.WheelEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const hit = findCellAt(coords.x, coords.y);
    if (!hit) return;

    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
    const newZoom = Math.max(1, Math.min(3.5, hit.transform.zoom + zoomDelta));
    onUpdateTransform(hit.id, { zoom: newZoom });
  };

  const activeCell = cells.find((c) => c.id === selectedCellId);

  return (
    <div
      ref={containerRef}
      className={styles.canvasContainer}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          width={settings.canvasWidth}
          height={settings.canvasHeight}
          className={`${styles.canvas} ${isPanning ? styles.panning : ''} ${
            dragSourceId ? styles.dragging : ''
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
        />

        {activeCell && (
          <div className={styles.floatingToolbar}>
            <span className={styles.toolbarLabel}>
              <Move size={14} /> Drag photo to pan
            </span>
            <div className={styles.divider} />
            <button
              className={styles.toolBtn}
              onClick={() =>
                onUpdateTransform(activeCell.id, {
                  zoom: Math.min(3.5, activeCell.transform.zoom + 0.15),
                })
              }
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
            <span className={styles.zoomVal}>
              {Math.round(activeCell.transform.zoom * 100)}%
            </span>
            <button
              className={styles.toolBtn}
              onClick={() =>
                onUpdateTransform(activeCell.id, {
                  zoom: Math.max(1.0, activeCell.transform.zoom - 0.15),
                })
              }
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <div className={styles.divider} />
            <button
              className={styles.toolBtn}
              onClick={() =>
                onUpdateTransform(activeCell.id, { zoom: 1, offsetX: 0, offsetY: 0 })
              }
              title="Reset Zoom & Pan"
            >
              <Shuffle size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
