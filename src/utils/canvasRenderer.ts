import { LayoutCell, CollageSettings, PhotoItem } from '@/types/collage';

export interface RenderOptions {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  cells: LayoutCell[];
  photosMap: Map<string, HTMLImageElement>;
  settings: CollageSettings;
  selectedCellId?: string | null;
  dragOverCellId?: string | null;
  draggingCellId?: string | null;
  scale?: number; // scale multiplier for high-res export
}

export interface PixelCellBounds {
  cellId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculates pixel bounds for all cells considering canvas dimensions and gaps
 */
export function calculatePixelCells(
  cells: LayoutCell[],
  canvasWidth: number,
  canvasHeight: number,
  gap: number
): PixelCellBounds[] {
  const halfGap = gap / 2;

  return cells.map((cell) => {
    const rawX = cell.x * canvasWidth;
    const rawY = cell.y * canvasHeight;
    const rawW = cell.width * canvasWidth;
    const rawH = cell.height * canvasHeight;

    // Inset borders by half-gap so adjacent cells have full gap spacing
    const x = rawX + halfGap;
    const y = rawY + halfGap;
    const width = Math.max(1, rawW - gap);
    const height = Math.max(1, rawH - gap);

    return {
      cellId: cell.id,
      x,
      y,
      width,
      height,
    };
  });
}

/**
 * Renders the entire collage onto a canvas 2D context.
 */
export function renderCollage(options: RenderOptions): void {
  const {
    ctx,
    cells,
    photosMap,
    settings,
    selectedCellId,
    dragOverCellId,
    draggingCellId,
    scale = 1,
  } = options;

  const width = settings.canvasWidth * scale;
  const height = settings.canvasHeight * scale;
  const gap = settings.gap * scale;
  const radius = settings.borderRadius * scale;

  ctx.save();

  // Clear background
  ctx.clearRect(0, 0, width, height);
  if (settings.backgroundColor) {
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  const pixelCells = calculatePixelCells(cells, width, height, gap);

  pixelCells.forEach((b) => {
    const cell = cells.find((c) => c.id === b.cellId);
    if (!cell) return;

    const img = photosMap.get(cell.photoId);
    const isSelected = selectedCellId === cell.id;
    const isDragOver = dragOverCellId === cell.id;
    const isDragging = draggingCellId === cell.id;

    ctx.save();

    // Clip cell area with border radius
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function' && radius > 0) {
      const maxR = Math.min(radius, b.width / 2, b.height / 2);
      ctx.roundRect(b.x, b.y, b.width, b.height, Math.max(0, maxR));
    } else {
      ctx.rect(b.x, b.y, b.width, b.height);
    }
    ctx.clip();

    if (img && img.complete && img.naturalWidth > 0) {
      const cellAspect = b.width / b.height;
      const imgAspect = img.naturalWidth / img.naturalHeight;

      // Base cover dimensions
      let baseW: number;
      let baseH: number;

      if (imgAspect > cellAspect) {
        baseH = b.height;
        baseW = b.height * imgAspect;
      } else {
        baseW = b.width;
        baseH = b.width / imgAspect;
      }

      // Apply zoom (clamped >= 1)
      const zoom = Math.max(1, cell.transform.zoom || 1);
      const drawW = baseW * zoom;
      const drawH = baseH * zoom;

      // Maximum pan boundaries to ensure image covers cell completely
      const maxPanX = Math.max(0, (drawW - b.width) / 2);
      const maxPanY = Math.max(0, (drawH - b.height) / 2);

      const offsetX = Math.max(-1, Math.min(1, cell.transform.offsetX || 0)) * maxPanX;
      const offsetY = Math.max(-1, Math.min(1, cell.transform.offsetY || 0)) * maxPanY;

      const drawX = b.x + (b.width - drawW) / 2 + offsetX;
      const drawY = b.y + (b.height - drawH) / 2 + offsetY;

      // Apply drag opacity if cell is being dragged
      if (isDragging) {
        ctx.globalAlpha = 0.45;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      // Placeholder background for pending/empty image
      ctx.fillStyle = '#1e1915';
      ctx.fillRect(b.x, b.y, b.width, b.height);
    }

    ctx.restore();

    // Visual overlays: Drag target highlight (Warm Sunset Glow)
    if (isDragOver && !isDragging) {
      ctx.save();
      ctx.lineWidth = 3 * scale;
      ctx.strokeStyle = '#f97316';
      ctx.fillStyle = 'rgba(249, 115, 22, 0.32)';
      drawRoundedPath(ctx, b.x, b.y, b.width, b.height, radius);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Visual overlays: Selected cell highlight (Warm Amber Outline)
    if (isSelected) {
      ctx.save();
      ctx.lineWidth = 2.5 * scale;
      ctx.strokeStyle = '#fb923c';
      drawRoundedPath(ctx, b.x, b.y, b.width, b.height, radius);
      ctx.stroke();
      ctx.restore();
    }
  });

  ctx.restore();
}

function drawRoundedPath(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
): void {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function' && radius > 0) {
    const maxR = Math.min(radius, w / 2, h / 2);
    ctx.roundRect(x, y, w, h, Math.max(0, maxR));
  } else {
    ctx.rect(x, y, w, h);
  }
}
