import { LayoutCell, CollageSettings } from '@/types/collage';
import { renderCollage } from './canvasRenderer';

export interface ExportConfig {
  scale: 1 | 2 | 4;
  cells: LayoutCell[];
  photosMap: Map<string, HTMLImageElement>;
  settings: CollageSettings;
}

/**
 * Renders the collage at the requested scale using an OffscreenCanvas
 * and triggers download of the resulting PNG blob.
 */
export async function exportCollageAsPng(
  config: ExportConfig,
  onProgress?: (status: string) => void
): Promise<string> {
  const { scale, cells, photosMap, settings } = config;

  if (onProgress) onProgress('Preparing high-resolution render...');

  const targetWidth = Math.round(settings.canvasWidth * scale);
  const targetHeight = Math.round(settings.canvasHeight * scale);

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;

  // Use OffscreenCanvas if available, otherwise fallback to HTMLCanvasElement
  if (typeof OffscreenCanvas !== 'undefined') {
    const offscreen = new OffscreenCanvas(targetWidth, targetHeight);
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) throw new Error('Could not get 2D rendering context for export');

    renderCollage({
      canvas: offscreen,
      ctx: offCtx,
      cells,
      photosMap,
      settings,
      scale,
    });

    if (onProgress) onProgress('Encoding high-resolution PNG...');
    const blob = await offscreen.convertToBlob({ type: 'image/png' });
    return triggerDownload(blob, targetWidth, targetHeight);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D rendering context for export');

    renderCollage({
      canvas,
      ctx,
      cells,
      photosMap,
      settings,
      scale,
    });

    if (onProgress) onProgress('Compiling PNG image blob...');

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }
        const fileName = triggerDownload(blob, targetWidth, targetHeight);
        resolve(fileName);
      }, 'image/png');
    });
  }
}

function triggerDownload(blob: Blob, width: number, height: number): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `collage-${timestamp}-${width}x${height}.png`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  return fileName;
}
