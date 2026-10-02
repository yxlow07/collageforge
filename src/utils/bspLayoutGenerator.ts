import { LayoutCell, PhotoItem } from '@/types/collage';

export interface BspNode {
  x: number;
  y: number;
  width: number;
  height: number;
  left?: BspNode;
  right?: BspNode;
  isLeaf: boolean;
}

const MIN_ASPECT = 0.4;
const MAX_ASPECT = 2.4;

export function getVisualAspect(node: { width: number; height: number }, canvasW: number, canvasH: number): number {
  const pixelW = node.width * canvasW;
  const pixelH = node.height * canvasH;
  return pixelW / Math.max(1, pixelH);
}

export function isAspectValid(width: number, height: number, canvasW: number, canvasH: number): boolean {
  const aspect = getVisualAspect({ width, height }, canvasW, canvasH);
  return aspect >= MIN_ASPECT && aspect <= MAX_ASPECT;
}

/**
 * Organic, highly randomized asymmetric BSP layout generator
 */
export function generateOrganicBspLayout(
  photos: PhotoItem[],
  canvasWidth: number,
  canvasHeight: number,
  rootBounds = { x: 0, y: 0, width: 1, height: 1 }
): LayoutCell[] {
  if (photos.length === 0) return [];

  const root: BspNode = {
    x: rootBounds.x,
    y: rootBounds.y,
    width: rootBounds.width,
    height: rootBounds.height,
    isLeaf: true,
  };

  const leaves: BspNode[] = [root];

  while (leaves.length < photos.length) {
    // Sort leaves by area descending
    leaves.sort((a, b) => b.width * b.height - a.width * a.height);

    // Pick a candidate among the larger leaves with weighted randomness
    // (Instead of always picking index 0, pick among top candidates for high entropy)
    const poolSize = Math.min(leaves.length, Math.max(1, Math.floor(leaves.length * 0.7) + 1));
    const chosenIdx = Math.floor(Math.pow(Math.random(), 1.5) * poolSize);
    const nodeToSplit = leaves[chosenIdx];
    leaves.splice(chosenIdx, 1);

    const visualAspect = getVisualAspect(nodeToSplit, canvasWidth, canvasHeight);

    // High randomness: probabilistic cut direction based on aspect ratio
    let splitVertical: boolean;
    if (visualAspect > 1.8) {
      splitVertical = true;
    } else if (visualAspect < 0.55) {
      splitVertical = false;
    } else {
      // In balanced range, randomize with 50/50 chance
      splitVertical = Math.random() < 0.5;
    }

    // Wide variety of organic split ratios (golden ratio 0.382 / 0.618, 0.28, 0.33, 0.5, 0.67, 0.72)
    const candidateRatios = [
      0.382 + (Math.random() - 0.5) * 0.12,
      0.618 + (Math.random() - 0.5) * 0.12,
      0.28 + Math.random() * 0.44,
      0.5 + (Math.random() - 0.5) * 0.2,
      0.33,
      0.67,
      0.5,
    ].sort(() => Math.random() - 0.5);

    let chosenRatio = 0.5;
    let splitSuccess = false;

    // Try selected orientation first
    for (const ratio of candidateRatios) {
      const w1 = splitVertical ? nodeToSplit.width * ratio : nodeToSplit.width;
      const h1 = splitVertical ? nodeToSplit.height : nodeToSplit.height * ratio;
      const w2 = splitVertical ? nodeToSplit.width * (1 - ratio) : nodeToSplit.width;
      const h2 = splitVertical ? nodeToSplit.height : nodeToSplit.height * (1 - ratio);

      if (
        isAspectValid(w1, h1, canvasWidth, canvasHeight) &&
        isAspectValid(w2, h2, canvasWidth, canvasHeight)
      ) {
        chosenRatio = ratio;
        splitSuccess = true;
        break;
      }
    }

    // If initial orientation failed aspect constraints, try orthogonal direction
    if (!splitSuccess) {
      splitVertical = !splitVertical;
      for (const ratio of candidateRatios) {
        const w1 = splitVertical ? nodeToSplit.width * ratio : nodeToSplit.width;
        const h1 = splitVertical ? nodeToSplit.height : nodeToSplit.height * ratio;
        const w2 = splitVertical ? nodeToSplit.width * (1 - ratio) : nodeToSplit.width;
        const h2 = splitVertical ? nodeToSplit.height : nodeToSplit.height * (1 - ratio);

        if (
          isAspectValid(w1, h1, canvasWidth, canvasHeight) &&
          isAspectValid(w2, h2, canvasWidth, canvasHeight)
        ) {
          chosenRatio = ratio;
          splitSuccess = true;
          break;
        }
      }
    }

    // If still restricted, fall back to safe 0.5 split
    if (!splitSuccess) {
      chosenRatio = 0.5;
    }

    nodeToSplit.isLeaf = false;

    if (splitVertical) {
      const leftW = nodeToSplit.width * chosenRatio;
      const rightW = nodeToSplit.width - leftW;

      nodeToSplit.left = {
        x: nodeToSplit.x,
        y: nodeToSplit.y,
        width: leftW,
        height: nodeToSplit.height,
        isLeaf: true,
      };

      nodeToSplit.right = {
        x: nodeToSplit.x + leftW,
        y: nodeToSplit.y,
        width: rightW,
        height: nodeToSplit.height,
        isLeaf: true,
      };
    } else {
      const topH = nodeToSplit.height * chosenRatio;
      const bottomH = nodeToSplit.height - topH;

      nodeToSplit.left = {
        x: nodeToSplit.x,
        y: nodeToSplit.y,
        width: nodeToSplit.width,
        height: topH,
        isLeaf: true,
      };

      nodeToSplit.right = {
        x: nodeToSplit.x,
        y: nodeToSplit.y + topH,
        width: nodeToSplit.width,
        height: bottomH,
        isLeaf: true,
      };
    }

    leaves.push(nodeToSplit.left);
    leaves.push(nodeToSplit.right);
  }

  // Shuffle leaves mapping randomly to avoid top-to-bottom monotony
  const shuffledPhotos = [...photos].sort(() => Math.random() - 0.5);

  return leaves.map((leaf, index) => ({
    id: `cell-${index}-${Math.random().toString(36).substring(2, 7)}`,
    photoId: shuffledPhotos[index]?.id ?? '',
    x: leaf.x,
    y: leaf.y,
    width: leaf.width,
    height: leaf.height,
    transform: {
      zoom: 1.0,
      offsetX: 0,
      offsetY: 0,
    },
  }));
}

/**
 * Shuffles which photo is mapped to which cell while preserving cell geometries.
 */
export function shufflePhotosInCells(
  currentCells: LayoutCell[],
  photos: PhotoItem[]
): LayoutCell[] {
  const shuffledPhotoIds = [...photos.map((p) => p.id)].sort(() => Math.random() - 0.5);

  return currentCells.map((cell, idx) => ({
    ...cell,
    photoId: shuffledPhotoIds[idx % shuffledPhotoIds.length],
    transform: {
      zoom: 1.0,
      offsetX: 0,
      offsetY: 0,
    },
  }));
}

export { generateOrganicBspLayout as generateBspLayout };
