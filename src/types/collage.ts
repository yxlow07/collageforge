export interface PhotoItem {
  id: string;
  name: string;
  src: string;
  originalWidth: number;
  originalHeight: number;
  aspectRatio: number;
  blob?: Blob;
}

export interface CellTransform {
  zoom: number; // 1.0 = fit cover
  offsetX: number; // -1 to 1 normalized pan offset
  offsetY: number;
}

export interface LayoutCell {
  id: string;
  photoId: string;
  // Normalized bounding box (0..1)
  x: number;
  y: number;
  width: number;
  height: number;
  transform: CellTransform;
}

export type CollageTemplateId =
  | 'random_organic'
  | 'center_spotlight'
  | 'dual_highlights'
  | 'hero_top'
  | 'hero_split';

export interface TemplateDefinition {
  id: CollageTemplateId;
  label: string;
  description: string;
}

export interface CollageSettings {
  aspectRatioId: string;
  canvasWidth: number;
  canvasHeight: number;
  gap: number; // 0 to 40 px
  borderRadius: number; // 0 to 30 px
  backgroundColor: string;
  presetName?: string;
  templateId: CollageTemplateId;
}

export const DEFAULT_COLLAGE_SETTINGS: CollageSettings = {
  aspectRatioId: '1:1',
  canvasWidth: 1200,
  canvasHeight: 1200,
  gap: 10,
  borderRadius: 8,
  backgroundColor: '#14110e',
  presetName: '1:1 Square',
  templateId: 'random_organic',
};

export interface AspectPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  iconName?: string;
}

export interface CollageState {
  photos: PhotoItem[];
  cells: LayoutCell[];
  settings: CollageSettings;
  selectedCellId: string | null;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  text: string;
}

export interface SuggestedColor {
  hex: string;
  name: string;
  description: string;
  category: 'average' | 'tone' | 'harmony' | 'cluster';
  isAverage?: boolean;
}

