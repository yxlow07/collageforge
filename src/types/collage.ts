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

export type CellEffectType =
  | 'none'
  | 'soft_shadow'
  | 'deep_shadow'
  | 'radiant_glow'
  | 'classic_border'
  | 'floating_frame';

export interface CellEffectConfig {
  type: CellEffectType;
  blur: number; // 0 to 40 px
  color: string; // hex or rgba
  borderWidth: number; // 0 to 12 px
  borderColor: string;
}

export const DEFAULT_CELL_EFFECT: CellEffectConfig = {
  type: 'none',
  blur: 16,
  color: 'rgba(0, 0, 0, 0.45)',
  borderWidth: 0,
  borderColor: '#ffffff',
};

export interface GradientSettings {
  enabled: boolean;
  type: 'linear' | 'radial';
  angle: number; // 0 to 360 deg
  colorStart: string;
  colorEnd: string;
  colorMiddle?: string;
}

export const DEFAULT_GRADIENT_SETTINGS: GradientSettings = {
  enabled: false,
  type: 'linear',
  angle: 135,
  colorStart: '#2d1810',
  colorEnd: '#0f0c0a',
};

export interface CollageSettings {
  aspectRatioId: string;
  canvasWidth: number;
  canvasHeight: number;
  gap: number; // 0 to 40 px
  borderRadius: number; // 0 to 30 px
  backgroundColor: string;
  presetName?: string;
  templateId: CollageTemplateId;
  cellEffect: CellEffectConfig;
  gradient?: GradientSettings;
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
  cellEffect: DEFAULT_CELL_EFFECT,
  gradient: DEFAULT_GRADIENT_SETTINGS,
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

