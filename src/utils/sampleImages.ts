import { PhotoItem } from '@/types/collage';

interface PhotoSpec {
  name: string;
  w: number;
  h: number;
  skyTop: string;
  skyBottom: string;
  groundColor: string;
  accentColor: string;
  scene: 'dune' | 'coast' | 'mountain' | 'forest' | 'architecture' | 'sunset';
}

const CURATED_PHOTOS: PhotoSpec[] = [
  {
    name: 'Desert Dunes.jpg',
    w: 1200,
    h: 800,
    skyTop: '#f4a261',
    skyBottom: '#e76f51',
    groundColor: '#b06c45',
    accentColor: '#fefae0',
    scene: 'dune',
  },
  {
    name: 'Coastal Cliffs.jpg',
    w: 900,
    h: 1200,
    skyTop: '#577590',
    skyBottom: '#90be6d',
    groundColor: '#274060',
    accentColor: '#f9c74f',
    scene: 'coast',
  },
  {
    name: 'Pine Ridge.jpg',
    w: 1000,
    h: 1000,
    skyTop: '#6b705c',
    skyBottom: '#a5a58d',
    groundColor: '#283618',
    accentColor: '#dda15e',
    scene: 'forest',
  },
  {
    name: 'Alpine Vista.jpg',
    w: 1200,
    h: 750,
    skyTop: '#2b2d42',
    skyBottom: '#8d99ae',
    groundColor: '#435058',
    accentColor: '#edf2f4',
    scene: 'mountain',
  },
  {
    name: 'Terracotta Facade.jpg',
    w: 800,
    h: 1200,
    skyTop: '#f3c68f',
    skyBottom: '#ee9b00',
    groundColor: '#9b2226',
    accentColor: '#ca6702',
    scene: 'architecture',
  },
  {
    name: 'Sunset Shore.jpg',
    w: 1100,
    h: 850,
    skyTop: '#9d0208',
    skyBottom: '#e85d04',
    groundColor: '#03071e',
    accentColor: '#faa307',
    scene: 'sunset',
  },
  {
    name: 'Warm Canyon.jpg',
    w: 950,
    h: 1150,
    skyTop: '#cb997e',
    skyBottom: '#ddbea9',
    groundColor: '#6b4226',
    accentColor: '#ffe8d6',
    scene: 'dune',
  },
  {
    name: 'Nordic Horizon.jpg',
    w: 1000,
    h: 800,
    skyTop: '#3d5a80',
    skyBottom: '#98c1d9',
    groundColor: '#293241',
    accentColor: '#e0fbfc',
    scene: 'coast',
  },
];

function renderSvgScene(spec: PhotoSpec): string {
  const { w, h, skyTop, skyBottom, groundColor, accentColor, scene } = spec;

  let sceneElements = '';

  if (scene === 'dune') {
    sceneElements = `
      <circle cx="${w * 0.7}" cy="${h * 0.35}" r="${Math.min(w, h) * 0.18}" fill="${accentColor}" opacity="0.85" />
      <path d="M 0,${h * 0.65} Q ${w * 0.35},${h * 0.52} ${w * 0.7},${h * 0.68} T ${w},${h * 0.62} L ${w},${h} L 0,${h} Z" fill="${groundColor}" />
      <path d="M 0,${h * 0.78} Q ${w * 0.45},${h * 0.65} ${w},${h * 0.75} L ${w},${h} L 0,${h} Z" fill="#000000" opacity="0.2" />
    `;
  } else if (scene === 'coast') {
    sceneElements = `
      <circle cx="${w * 0.3}" cy="${h * 0.4}" r="${Math.min(w, h) * 0.14}" fill="${accentColor}" opacity="0.75" />
      <path d="M 0,${h * 0.6} L ${w * 0.45},${h * 0.58} L ${w * 0.7},${h * 0.8} L ${w},${h * 0.75} L ${w},${h} L 0,${h} Z" fill="${groundColor}" />
      <path d="M 0,${h * 0.8} Q ${w * 0.5},${h * 0.74} ${w},${h * 0.82} L ${w},${h} L 0,${h} Z" fill="${skyBottom}" opacity="0.3" />
    `;
  } else if (scene === 'mountain') {
    sceneElements = `
      <polygon points="0,${h * 0.85} ${w * 0.35},${h * 0.35} ${w * 0.7},${h * 0.85}" fill="${groundColor}" />
      <polygon points="${w * 0.35},${h * 0.35} ${w * 0.42},${h * 0.45} ${w * 0.35},${h * 0.48} ${w * 0.28},${h * 0.45}" fill="${accentColor}" opacity="0.9" />
      <polygon points="${w * 0.4},${h * 0.9} ${w * 0.75},${h * 0.45} ${w},${h * 0.9}" fill="${groundColor}" opacity="0.75" />
    `;
  } else if (scene === 'forest') {
    sceneElements = `
      <circle cx="${w * 0.5}" cy="${h * 0.3}" r="${Math.min(w, h) * 0.2}" fill="${accentColor}" opacity="0.6" />
      <path d="M 0,${h * 0.7} Q ${w * 0.25},${h * 0.65} ${w * 0.5},${h * 0.68} T ${w},${h * 0.65} L ${w},${h} L 0,${h} Z" fill="${groundColor}" />
      <path d="M 0,${h * 0.82} Q ${w * 0.3},${h * 0.75} ${w * 0.6},${h * 0.8} T ${w},${h * 0.78} L ${w},${h} L 0,${h} Z" fill="#000000" opacity="0.3" />
    `;
  } else if (scene === 'architecture') {
    sceneElements = `
      <rect x="${w * 0.15}" y="${h * 0.2}" width="${w * 0.7}" height="${h * 0.8}" fill="${groundColor}" />
      <rect x="${w * 0.3}" y="${h * 0.35}" width="${w * 0.18}" height="${h * 0.3}" rx="4" fill="${accentColor}" opacity="0.8" />
      <rect x="${w * 0.55}" y="${h * 0.35}" width="${w * 0.18}" height="${h * 0.3}" rx="4" fill="${accentColor}" opacity="0.8" />
      <polygon points="${w * 0.15},${h * 0.2} ${w * 0.5},${h * 0.08} ${w * 0.85},${h * 0.2}" fill="${skyBottom}" opacity="0.9" />
    `;
  } else {
    // sunset
    sceneElements = `
      <circle cx="${w * 0.5}" cy="${h * 0.62}" r="${Math.min(w, h) * 0.24}" fill="${accentColor}" />
      <rect x="0" y="${h * 0.65}" width="${w}" height="${h * 0.35}" fill="${groundColor}" />
      <path d="M ${w * 0.2},${h * 0.72} L ${w * 0.8},${h * 0.72}" stroke="${accentColor}" stroke-width="3" opacity="0.5" />
      <path d="M ${w * 0.35},${h * 0.8} L ${w * 0.65},${h * 0.8}" stroke="${accentColor}" stroke-width="2" opacity="0.3" />
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <linearGradient id="grad-${w}-${h}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${skyTop}" />
          <stop offset="100%" stop-color="${skyBottom}" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad-${w}-${h})" />
      ${sceneElements}
    </svg>
  `;
}

export function getSampleGalleryPhotos(): PhotoItem[] {
  return CURATED_PHOTOS.map((spec, index) => {
    const svgStr = renderSvgScene(spec);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    return {
      id: `sample-photo-${index + 1}`,
      name: spec.name,
      src: url,
      originalWidth: spec.w,
      originalHeight: spec.h,
      aspectRatio: spec.w / spec.h,
      blob,
    };
  });
}
