import { LayoutCell, PhotoItem, CollageTemplateId, TemplateDefinition } from '@/types/collage';
import { generateOrganicBspLayout, shufflePhotosInCells } from './bspLayoutGenerator';
import {
  generateCenterSpotlightLayout,
  generateDualHighlightsLayout,
  generateHeroTopLayout,
  generateHeroSplitLayout,
} from './templateLayoutGenerator';

export const COLLAGE_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'random_organic',
    label: 'Organic Chaos',
    description: 'High-entropy algorithmic cuts with asymmetric golden-ratio partitions',
  },
  {
    id: 'center_spotlight',
    label: 'Center Spotlight',
    description: '1 Dominant centerpiece in the middle with a dynamically packed surround',
  },
  {
    id: 'dual_highlights',
    label: 'Dual Highlights',
    description: '2 Large focal photos in the center flanked by header & footer rows',
  },
  {
    id: 'hero_top',
    label: 'Hero Banner',
    description: '1 Wide panoramic top feature with an irregular mosaic below',
  },
  {
    id: 'hero_split',
    label: 'Magazine Split',
    description: '1 Large left focus column with an asymmetric multi-cell flank',
  },
];

export function generateCollageLayout(
  photos: PhotoItem[],
  canvasWidth: number,
  canvasHeight: number,
  templateId: CollageTemplateId = 'random_organic'
): LayoutCell[] {
  if (photos.length === 0) return [];

  switch (templateId) {
    case 'center_spotlight':
      return generateCenterSpotlightLayout(photos, canvasWidth, canvasHeight);
    case 'dual_highlights':
      return generateDualHighlightsLayout(photos, canvasWidth, canvasHeight);
    case 'hero_top':
      return generateHeroTopLayout(photos, canvasWidth, canvasHeight);
    case 'hero_split':
      return generateHeroSplitLayout(photos, canvasWidth, canvasHeight);
    case 'random_organic':
    default:
      return generateOrganicBspLayout(photos, canvasWidth, canvasHeight);
  }
}

export { shufflePhotosInCells };
