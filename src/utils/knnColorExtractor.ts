import { SuggestedColor } from '@/types/collage';

interface ClusterResult {
  centroids: number[][]; // [r, g, b]
  counts: number[];
  totalPixels: number;
}

/**
 * Samples pixel RGB values across multiple loaded HTMLImageElements.
 */
export function samplePixelsFromImages(
  images: HTMLImageElement[],
  maxImagesToSample = 12
): number[][] {
  const pixels: number[][] = [];
  if (images.length === 0) return pixels;

  const canvas = document.createElement('canvas');
  const size = 36;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return pixels;

  // Stride sample across available images
  const step = Math.max(1, Math.floor(images.length / maxImagesToSample));
  const sampledImages = images.filter((_, idx) => idx % step === 0).slice(0, maxImagesToSample);

  for (const img of sampledImages) {
    if (!img.complete || img.naturalWidth === 0) continue;
    try {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const imgData = ctx.getImageData(0, 0, size, size).data;

      // Sample every 4th pixel for speed & statistical coverage
      for (let i = 0; i < imgData.length; i += 16) {
        const a = imgData[i + 3];
        if (a < 128) continue; // Skip transparent
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        pixels.push([r, g, b]);
      }
    } catch {
      // Ignore cross-origin or canvas read errors
    }
  }

  return pixels;
}

/**
 * Runs K-Means (KNN 1-Nearest Neighbor vector quantization) on sampled RGB pixels.
 */
export function runKMeans(pixels: number[][], k = 4, iterations = 8): ClusterResult {
  if (pixels.length === 0) {
    return { centroids: [], counts: [], totalPixels: 0 };
  }

  const clampedK = Math.min(k, pixels.length);
  // K-means++ initialization
  const centroids: number[][] = [];
  centroids.push([...pixels[Math.floor(Math.random() * pixels.length)]]);

  while (centroids.length < clampedK) {
    const distances: number[] = pixels.map((p) => {
      let minDistSq = Infinity;
      for (const c of centroids) {
        const dSq = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
        if (dSq < minDistSq) minDistSq = dSq;
      }
      return minDistSq;
    });

    const sumDist = distances.reduce((a, b) => a + b, 0);
    let randVal = Math.random() * sumDist;
    let chosenIdx = 0;
    for (let i = 0; i < distances.length; i++) {
      randVal -= distances[i];
      if (randVal <= 0) {
        chosenIdx = i;
        break;
      }
    }
    centroids.push([...pixels[chosenIdx]]);
  }

  // Iterative KNN 1-Nearest Neighbor assignment & centroid update
  let counts = new Array(clampedK).fill(0);
  for (let iter = 0; iter < iterations; iter++) {
    const sums = Array.from({ length: clampedK }, () => [0, 0, 0]);
    counts = new Array(clampedK).fill(0);

    for (const p of pixels) {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let ci = 0; ci < clampedK; ci++) {
        const c = centroids[ci];
        const dist = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = ci;
        }
      }
      sums[bestIdx][0] += p[0];
      sums[bestIdx][1] += p[1];
      sums[bestIdx][2] += p[2];
      counts[bestIdx]++;
    }

    for (let ci = 0; ci < clampedK; ci++) {
      if (counts[ci] > 0) {
        centroids[ci] = [
          Math.round(sums[ci][0] / counts[ci]),
          Math.round(sums[ci][1] / counts[ci]),
          Math.round(sums[ci][2] / counts[ci]),
        ];
      } else {
        centroids[ci] = [...pixels[Math.floor(Math.random() * pixels.length)]];
      }
    }
  }

  return { centroids, counts, totalPixels: pixels.length };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  return rgbToHex(Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255));
}

/**
 * Extracts the average pixel color and computes harmonized background variations.
 */
export function generateColorSuggestions(pixels: number[][]): SuggestedColor[] {
  if (pixels.length === 0) return [];

  // Compute arithmetic average RGB across all sampled pixels
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  for (let i = 0; i < pixels.length; i++) {
    sumR += pixels[i][0];
    sumG += pixels[i][1];
    sumB += pixels[i][2];
  }
  const avgR = Math.round(sumR / pixels.length);
  const avgG = Math.round(sumG / pixels.length);
  const avgB = Math.round(sumB / pixels.length);
  const avgHex = rgbToHex(avgR, avgG, avgB);
  const [h, s, l] = rgbToHsl(avgR, avgG, avgB);

  // Run KNN / K-Means for dominant color clusters
  const clusterData = runKMeans(pixels, 4, 8);
  const sortedIndices = clusterData.counts
    .map((cnt, idx) => ({ cnt, idx }))
    .sort((a, b) => b.cnt - a.cnt);

  const rawList: SuggestedColor[] = [
    {
      hex: avgHex,
      name: 'Average Tone',
      description: 'Arithmetic mean color of all photos',
      category: 'average',
      isAverage: true,
    },
    {
      hex: hslToHex(h, Math.min(80, Math.round(s * 1.15)), Math.max(9, Math.min(16, Math.round(l * 0.22)))),
      name: 'Deep Shade',
      description: 'Moody dark mat tailored to photo tones',
      category: 'tone',
    },
    {
      hex: hslToHex(h, Math.max(10, Math.min(30, Math.round(s * 0.35))), Math.min(97, Math.max(93, 100 - Math.round(l * 0.08)))),
      name: 'Soft Tint',
      description: 'Light gallery mat complementing photo highlights',
      category: 'tone',
    },
    {
      hex: hslToHex(h, Math.max(4, Math.round(s * 0.12)), l < 50 ? 22 : 88),
      name: 'Muted Neutral',
      description: 'Subtle desaturated tone for minimal distraction',
      category: 'tone',
    },
    {
      hex: hslToHex(h, Math.min(95, Math.max(65, Math.round(s * 1.4 + 15))), Math.max(38, Math.min(58, l))),
      name: 'Vibrant Accent',
      description: 'High-saturation punch of the dominant hue',
      category: 'tone',
    },
    {
      hex: hslToHex((h + 28) % 360, Math.max(25, Math.min(65, s)), l < 50 ? 18 : 86),
      name: 'Warm Harmony',
      description: 'Warm-shifted harmonious border',
      category: 'harmony',
    },
    {
      hex: hslToHex((h - 28 + 360) % 360, Math.max(25, Math.min(65, s)), l < 50 ? 18 : 86),
      name: 'Cool Harmony',
      description: 'Cool-shifted harmonious border',
      category: 'harmony',
    },
    {
      hex: hslToHex((h + 180) % 360, Math.max(20, Math.min(55, Math.round(s * 0.65))), l < 50 ? 20 : 85),
      name: 'Complementary',
      description: 'High-contrast complementary shade',
      category: 'harmony',
    },
  ];

  // Add top dominant KNN cluster centroids
  if (sortedIndices.length > 0 && clusterData.totalPixels > 0) {
    const topIdx = sortedIndices[0].idx;
    const c1 = clusterData.centroids[topIdx];
    const pct1 = Math.round((sortedIndices[0].cnt / clusterData.totalPixels) * 100);
    rawList.push({
      hex: rgbToHex(c1[0], c1[1], c1[2]),
      name: 'Dominant Primary',
      description: `Largest KNN cluster (${pct1}% of pixels)`,
      category: 'cluster',
    });

    if (sortedIndices.length > 1 && sortedIndices[1].cnt > 0) {
      const secIdx = sortedIndices[1].idx;
      const c2 = clusterData.centroids[secIdx];
      const pct2 = Math.round((sortedIndices[1].cnt / clusterData.totalPixels) * 100);
      rawList.push({
        hex: rgbToHex(c2[0], c2[1], c2[2]),
        name: 'Dominant Secondary',
        description: `Secondary KNN cluster (${pct2}% of pixels)`,
        category: 'cluster',
      });
    }
  }

  // De-duplicate any colors that resolve to the same hex
  const seenHex = new Set<string>();
  return rawList.filter((item) => {
    const lower = item.hex.toLowerCase();
    if (seenHex.has(lower)) return false;
    seenHex.add(lower);
    return true;
  });
}
