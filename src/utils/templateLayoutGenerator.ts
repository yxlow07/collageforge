import { LayoutCell, PhotoItem } from '@/types/collage';
import { generateOrganicBspLayout } from './bspLayoutGenerator';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function createCell(
  rect: Rect,
  photoId: string,
  prefix: string,
  index: number
): LayoutCell {
  return {
    id: `${prefix}-${index}-${Math.random().toString(36).substring(2, 6)}`,
    photoId,
    x: Math.max(0, Math.min(1, rect.x)),
    y: Math.max(0, Math.min(1, rect.y)),
    width: Math.max(0.05, Math.min(1, rect.width)),
    height: Math.max(0.05, Math.min(1, rect.height)),
    transform: { zoom: 1.0, offsetX: 0, offsetY: 0 },
  };
}

/**
 * Distributes remaining count across sub-regions proportionally
 */
function distributeCount(total: number, weights: number[]): number[] {
  const sumWeights = weights.reduce((a, b) => a + b, 0);
  let remaining = total;
  const counts = weights.map((w, i) => {
    if (i === weights.length - 1) return 0;
    const allocated = Math.round((w / sumWeights) * total);
    remaining -= allocated;
    return allocated;
  });
  counts[weights.length - 1] = Math.max(0, remaining);
  return counts;
}

/**
 * 1 Big Highlight in the center with dynamic randomized surround
 */
export function generateCenterSpotlightLayout(
  photos: PhotoItem[],
  canvasWidth: number,
  canvasHeight: number
): LayoutCell[] {
  const total = photos.length;
  if (total <= 2) {
    return generateOrganicBspLayout(photos, canvasWidth, canvasHeight);
  }

  const cells: LayoutCell[] = [];
  const shuffled = [...photos].sort(() => Math.random() - 0.5);

  // Center hero box dimensions (e.g. 50% width, 52% height in center)
  const heroW = 0.5;
  const heroH = 0.52;
  const heroX = (1 - heroW) / 2;
  const heroY = (1 - heroH) / 2;

  // 1. Add center highlight
  cells.push(createCell({ x: heroX, y: heroY, width: heroW, height: heroH }, shuffled[0].id, 'hero-center', 0));

  const remainingPhotos = shuffled.slice(1);
  const remainingCount = remainingPhotos.length;

  // Surround regions: Top, Bottom, Left, Right
  const regions: Rect[] = [
    { x: 0, y: 0, width: 1, height: heroY }, // Top
    { x: 0, y: heroY + heroH, width: 1, height: 1 - (heroY + heroH) }, // Bottom
    { x: 0, y: heroY, width: heroX, height: heroH }, // Left
    { x: heroX + heroW, y: heroY, width: 1 - (heroX + heroW), height: heroH }, // Right
  ];

  // Distribute remaining photos across the 4 surrounding regions
  const counts = distributeCount(remainingCount, [regions[0].height, regions[1].height, regions[2].width, regions[3].width]);

  let currentPhotoIdx = 0;
  regions.forEach((region, rIdx) => {
    const regionCount = counts[rIdx];
    if (regionCount <= 0) return;

    const subPhotos = remainingPhotos.slice(currentPhotoIdx, currentPhotoIdx + regionCount);
    currentPhotoIdx += regionCount;

    const subCells = generateOrganicBspLayout(subPhotos, canvasWidth, canvasHeight, region);
    cells.push(...subCells);
  });

  return cells;
}

/**
 * 2 Big Highlights in the middle with dynamically packed surroundings
 */
export function generateDualHighlightsLayout(
  photos: PhotoItem[],
  canvasWidth: number,
  canvasHeight: number
): LayoutCell[] {
  const total = photos.length;
  if (total <= 3) {
    return generateOrganicBspLayout(photos, canvasWidth, canvasHeight);
  }

  const cells: LayoutCell[] = [];
  const shuffled = [...photos].sort(() => Math.random() - 0.5);

  const isWide = canvasWidth >= canvasHeight;
  const topH = 0.22;
  const bottomH = 0.22;
  const midH = 1 - topH - bottomH;

  if (isWide) {
    // 2 side-by-side large highlights in the middle band
    const leftHeroW = 0.5;
    const rightHeroW = 0.5;

    cells.push(createCell({ x: 0, y: topH, width: leftHeroW, height: midH }, shuffled[0].id, 'dual-left', 0));
    cells.push(createCell({ x: leftHeroW, y: topH, width: rightHeroW, height: midH }, shuffled[1].id, 'dual-right', 1));
  } else {
    // 2 stacked large highlights in the center column
    const leftW = 0.18;
    const rightW = 0.18;
    const centerW = 1 - leftW - rightW;
    const halfH = midH / 2;

    cells.push(createCell({ x: leftW, y: topH, width: centerW, height: halfH }, shuffled[0].id, 'dual-top', 0));
    cells.push(createCell({ x: leftW, y: topH + halfH, width: centerW, height: halfH }, shuffled[1].id, 'dual-bottom', 1));
  }

  const remainingPhotos = shuffled.slice(2);
  const remainingCount = remainingPhotos.length;

  // Header band and Footer band
  const topRegion: Rect = { x: 0, y: 0, width: 1, height: topH };
  const bottomRegion: Rect = { x: 0, y: 1 - bottomH, width: 1, height: bottomH };

  const topCount = Math.ceil(remainingCount / 2);
  const bottomCount = remainingCount - topCount;

  if (topCount > 0) {
    const topCells = generateOrganicBspLayout(
      remainingPhotos.slice(0, topCount),
      canvasWidth,
      canvasHeight,
      topRegion
    );
    cells.push(...topCells);
  }

  if (bottomCount > 0) {
    const bottomCells = generateOrganicBspLayout(
      remainingPhotos.slice(topCount),
      canvasWidth,
      canvasHeight,
      bottomRegion
    );
    cells.push(...bottomCells);
  }

  return cells;
}

/**
 * Hero Banner at the top (or bottom) with irregular packed bottom
 */
export function generateHeroTopLayout(
  photos: PhotoItem[],
  canvasWidth: number,
  canvasHeight: number
): LayoutCell[] {
  if (photos.length <= 2) {
    return generateOrganicBspLayout(photos, canvasWidth, canvasHeight);
  }

  const shuffled = [...photos].sort(() => Math.random() - 0.5);
  const heroH = 0.52;

  const heroCell = createCell({ x: 0, y: 0, width: 1, height: heroH }, shuffled[0].id, 'hero-top', 0);
  const remainingCells = generateOrganicBspLayout(
    shuffled.slice(1),
    canvasWidth,
    canvasHeight,
    { x: 0, y: heroH, width: 1, height: 1 - heroH }
  );

  return [heroCell, ...remainingCells];
}

/**
 * Magazine Split: Hero panel on the left (or right) with mosaic flank
 */
export function generateHeroSplitLayout(
  photos: PhotoItem[],
  canvasWidth: number,
  canvasHeight: number
): LayoutCell[] {
  if (photos.length <= 2) {
    return generateOrganicBspLayout(photos, canvasWidth, canvasHeight);
  }

  const shuffled = [...photos].sort(() => Math.random() - 0.5);
  const heroW = 0.55;

  const heroCell = createCell({ x: 0, y: 0, width: heroW, height: 1 }, shuffled[0].id, 'hero-split', 0);
  const remainingCells = generateOrganicBspLayout(
    shuffled.slice(1),
    canvasWidth,
    canvasHeight,
    { x: heroW, y: 0, width: 1 - heroW, height: 1 }
  );

  return [heroCell, ...remainingCells];
}
