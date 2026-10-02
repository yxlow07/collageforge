'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './CanvasEditor.module.css';
import { LayoutCell, CollageSettings } from '@/types/collage';
import { renderCollage, calculatePixelCells } from '@/utils/canvasRenderer';
import { Minus, Plus, Maximize2 } from 'lucide-react';

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

  // Cell-level interaction states
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isCellPanning, setIsCellPanning] = useState(false);
  const [cellPanStart, setCellPanStart] = useState<{ x: number; y: number } | null>(null);

  // Workspace-level Canvas Zoom & Pan states
  const [canvasZoom, setCanvasZoom] = useState<number>(1.0);
  const [canvasPan, setCanvasPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isWorkspacePanning, setIsWorkspacePanning] = useState(false);
  const [workspacePanStart, setWorkspacePanStart] = useState<{ x: number; y: number } | null>(null);

  // Convert client mouse/touch point to canvas coordinate (auto-adjusts for CSS scale & translate)
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

  // Non-passive wheel event listener: Ctrl + scroll / pinch zooms canvas, normal scroll zooms photo or pans
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelEvent = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Prevent default browser zoom of entire web page
        e.preventDefault();

        // Calculate smooth exponential zoom factor
        const factor = e.deltaY < 0 ? 1.12 : 0.89;

        setCanvasZoom((prevZoom) => {
          const newZoom = Math.min(3.5, Math.max(0.25, Math.round(prevZoom * factor * 1000) / 1000));
          if (newZoom === prevZoom) return prevZoom;

          // Focal zoom towards mouse position
          const rect = container.getBoundingClientRect();
          const mouseX = e.clientX - rect.left - rect.width / 2;
          const mouseY = e.clientY - rect.top - rect.height / 2;
          const scaleRatio = newZoom / prevZoom;

          setCanvasPan((prevPan) => ({
            x: mouseX - (mouseX - prevPan.x) * scaleRatio,
            y: mouseY - (mouseY - prevPan.y) * scaleRatio,
          }));

          return newZoom;
        });
      } else if (e.shiftKey) {
        // Shift + scroll pans horizontally
        e.preventDefault();
        setCanvasPan((prev) => ({
          x: prev.x - e.deltaY * 0.8,
          y: prev.y,
        }));
      } else {
        // Normal scroll: check if hovering over a cell for photo focal zoom
        const coords = getCanvasCoords(e.clientX, e.clientY);
        const hit = findCellAt(coords.x, coords.y);
        if (hit) {
          e.preventDefault();
          const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
          const newCellZoom = Math.max(1, Math.min(3.5, hit.transform.zoom + zoomDelta));
          onUpdateTransform(hit.id, { zoom: newCellZoom });
        } else if (canvasZoom > 1.05) {
          // If zoomed in and scrolling over empty workspace, pan workspace
          e.preventDefault();
          setCanvasPan((prev) => ({
            x: prev.x - e.deltaX * 0.8,
            y: prev.y - e.deltaY * 0.8,
          }));
        }
      }
    };

    container.addEventListener('wheel', handleWheelEvent, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheelEvent);
    };
  }, [canvasZoom, getCanvasCoords, findCellAt, onUpdateTransform]);

  // Keyboard gestures (Space for pan, Ctrl +/-/0 for zoom)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setCanvasZoom((z) => Math.min(3.5, Math.round(z * 1.2 * 100) / 100));
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        setCanvasZoom((z) => Math.max(0.25, Math.round(z * 0.8 * 100) / 100));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setCanvasZoom(1.0);
        setCanvasPan({ x: 0, y: 0 });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsWorkspacePanning(false);
        setWorkspacePanStart(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse Down: Start Workspace Pan, Cell Focal Pan, or Drag-and-Swap
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click (button 1) or Space + Left click -> Workspace pan
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      e.preventDefault();
      setIsWorkspacePanning(true);
      setWorkspacePanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (e.button !== 0) return; // Only process left click for cell actions

    const coords = getCanvasCoords(e.clientX, e.clientY);
    const hit = findCellAt(coords.x, coords.y);

    if (!hit) {
      onSelectCell(null);
      // Clicking empty workspace when zoomed in allows click-drag pan
      if (canvasZoom > 1.05) {
        setIsWorkspacePanning(true);
        setWorkspacePanStart({ x: e.clientX, y: e.clientY });
      }
      return;
    }

    if (selectedCellId === hit.id) {
      // Already selected cell -> enter focal photo pan mode
      setIsCellPanning(true);
      setCellPanStart({ x: e.clientX, y: e.clientY });
    } else {
      // Select cell and prepare potential drag-and-swap
      onSelectCell(hit.id);
      setDragSourceId(hit.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // If workspace panning (Space + drag, middle click, or zoomed empty background)
    if (isWorkspacePanning && workspacePanStart) {
      const dx = e.clientX - workspacePanStart.x;
      const dy = e.clientY - workspacePanStart.y;
      setCanvasPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setWorkspacePanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const coords = getCanvasCoords(e.clientX, e.clientY);

    // If panning inside selected cell (photo focal pan)
    if (isCellPanning && cellPanStart && selectedCellId) {
      const activeCell = cells.find((c) => c.id === selectedCellId);
      if (activeCell) {
        const dx = (e.clientX - cellPanStart.x) * 0.005;
        const dy = (e.clientY - cellPanStart.y) * 0.005;
        onUpdateTransform(selectedCellId, {
          offsetX: Math.max(-1, Math.min(1, activeCell.transform.offsetX + dx)),
          offsetY: Math.max(-1, Math.min(1, activeCell.transform.offsetY + dy)),
        });
        setCellPanStart({ x: e.clientX, y: e.clientY });
      }
      return;
    }

    // If dragging to swap cells
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
    if (isWorkspacePanning) {
      setIsWorkspacePanning(false);
      setWorkspacePanStart(null);
    }
    if (dragSourceId && dragOverId && dragSourceId !== dragOverId) {
      onSwapCells(dragSourceId, dragOverId);
    }
    setDragSourceId(null);
    setDragOverId(null);
    setIsCellPanning(false);
    setCellPanStart(null);
  };

  // Zoom control helpers
  const handleZoomIn = () => {
    setCanvasZoom((z) => Math.min(3.5, Math.round(z * 1.2 * 100) / 100));
  };

  const handleZoomOut = () => {
    setCanvasZoom((z) => Math.max(0.25, Math.round(z * 0.8 * 100) / 100));
  };

  const handleResetZoom = () => {
    setCanvasZoom(1.0);
    setCanvasPan({ x: 0, y: 0 });
  };

  const activeCell = cells.find((c) => c.id === selectedCellId);

  return (
    <div
      ref={containerRef}
      className={`${styles.canvasContainer} ${
        isSpacePressed ? styles.spacePressed : ''
      } ${isWorkspacePanning ? styles.workspacePanning : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zoomable & Pannable Viewport Layer */}
      <div
        className={`${styles.canvasViewport} ${
          isWorkspacePanning ? styles.isDraggingWorkspace : ''
        }`}
        style={{
          transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasZoom})`,
        }}
      >
        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            width={settings.canvasWidth}
            height={settings.canvasHeight}
            className={`${styles.canvas} ${isCellPanning ? styles.panning : ''} ${
              dragSourceId ? styles.dragging : ''
            }`}
          />
        </div>
      </div>

      {/* Floating Toolbar for Selected Cell (Stays crisp at 1x) */}
      {activeCell && (
        <div className={styles.floatingToolbar}>
          <span className={styles.toolbarLabel}>Drag photo to pan</span>
          <div className={styles.divider} />
          <button
            className={styles.toolBtn}
            onClick={() =>
              onUpdateTransform(activeCell.id, {
                zoom: Math.min(3.5, activeCell.transform.zoom + 0.15),
              })
            }
            title="Zoom In Photo"
            aria-label="Zoom In Photo"
          >
            +
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
            title="Zoom Out Photo"
            aria-label="Zoom Out Photo"
          >
            &minus;
          </button>
          <div className={styles.divider} />
          <button
            className={styles.toolBtn}
            onClick={() =>
              onUpdateTransform(activeCell.id, { zoom: 1, offsetX: 0, offsetY: 0 })
            }
            title="Reset Photo Zoom & Pan"
          >
            Reset
          </button>
        </div>
      )}

      {/* Floating Zoom HUD in bottom-right corner */}
      <div className={styles.zoomHUD}>
        <button
          className={styles.zoomBtn}
          onClick={handleZoomOut}
          title="Zoom out canvas (Ctrl + Scroll Down / Ctrl -)"
          aria-label="Zoom out canvas"
        >
          <Minus size={14} />
        </button>
        <button
          className={styles.zoomValueBtn}
          onClick={handleResetZoom}
          title="Click to reset zoom to 100% (Ctrl + 0)"
          aria-label="Reset canvas zoom"
        >
          {Math.round(canvasZoom * 100)}%
        </button>
        <button
          className={styles.zoomBtn}
          onClick={handleZoomIn}
          title="Zoom in canvas (Ctrl + Scroll Up / Ctrl +)"
          aria-label="Zoom in canvas"
        >
          <Plus size={14} />
        </button>
        <button
          className={styles.zoomFitBtn}
          onClick={handleResetZoom}
          title="Fit / Reset canvas to screen (Ctrl + 0)"
          aria-label="Fit / Reset canvas"
        >
          <Maximize2 size={12} />
          <span>Fit</span>
        </button>
      </div>

      {/* Gesture Helper Hint */}
      <div className={styles.zoomHint}>
        <span>Ctrl + Scroll to zoom</span>
        <span>•</span>
        <span>Space + Drag to pan</span>
      </div>
    </div>
  );
};
