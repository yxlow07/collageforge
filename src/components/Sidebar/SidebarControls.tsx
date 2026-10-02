'use client';

import React from 'react';
import styles from './SidebarControls.module.css';
import { CollageSettings, AspectPreset, LayoutCell, CollageTemplateId, SuggestedColor, CellEffectConfig } from '@/types/collage';
import { COLLAGE_TEMPLATES } from '@/utils/layoutEngine';
import { BackgroundColorSection } from './BackgroundColorSection';
import { CellEffectsSection } from './CellEffectsSection';

export const ASPECT_PRESETS: AspectPreset[] = [
  { id: '1:1', label: '1:1 Square', width: 1200, height: 1200 },
  { id: '4:5', label: '4:5 Portrait', width: 1080, height: 1350 },
  { id: '16:9', label: '16:9 Landscape', width: 1600, height: 900 },
  { id: '9:16', label: '9:16 Story', width: 900, height: 1600 },
  { id: '3:2', label: '3:2 Classic', width: 1500, height: 1000 },
  { id: '2:3', label: '2:3 Portrait', width: 1000, height: 1500 },
  { id: 'a4', label: 'A4 Poster', width: 1240, height: 1754 },
];

interface SidebarControlsProps {
  settings: CollageSettings;
  onUpdateSettings: (newSettings: Partial<CollageSettings>) => void;
  selectedCell: LayoutCell | null;
  onUpdateSelectedCell: (transform: { zoom?: number; offsetX?: number; offsetY?: number }) => void;
  totalPhotos: number;
  suggestedColors?: SuggestedColor[];
  isExtractingColors?: boolean;
  onReExtractColors?: () => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  settings,
  onUpdateSettings,
  selectedCell,
  onUpdateSelectedCell,
  totalPhotos,
  suggestedColors = [],
  isExtractingColors = false,
  onReExtractColors,
}) => {
  const handlePresetSelect = (preset: AspectPreset) => {
    onUpdateSettings({
      aspectRatioId: preset.id,
      canvasWidth: preset.width,
      canvasHeight: preset.height,
      presetName: preset.label,
    });
  };

  return (
    <aside className={styles.sidebar}>
      {/* Template Presets Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4>Collage Template</h4>
        </div>
        <div className={styles.templateList}>
          {COLLAGE_TEMPLATES.map((tmpl) => {
            const isActive = settings.templateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                className={`${styles.templateBtn} ${isActive ? styles.activeTemplate : ''}`}
                onClick={() => onUpdateSettings({ templateId: tmpl.id })}
                title={tmpl.description}
              >
                <span className={styles.templateTitle}>{tmpl.label}</span>
                <span className={styles.templateDesc}>{tmpl.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Aspect Ratio Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4>Canvas Ratio</h4>
        </div>
        <div className={styles.presetGrid}>
          {ASPECT_PRESETS.map((p) => {
            const isActive = settings.aspectRatioId === p.id;
            return (
              <button
                key={p.id}
                className={`${styles.presetBtn} ${isActive ? styles.activePreset : ''}`}
                onClick={() => handlePresetSelect(p)}
              >
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Frame Spacing & Curves */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4>Layout Styling</h4>
        </div>

        {/* Gap Slider */}
        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <span>Border Gap</span>
            <span className={styles.valBadge}>{settings.gap}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={settings.gap}
            onChange={(e) => onUpdateSettings({ gap: Number(e.target.value) })}
            className={styles.rangeInput}
            suppressHydrationWarning
          />
        </div>

        {/* Border Radius Slider */}
        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <span>Corner Radius</span>
            <span className={styles.valBadge}>{settings.borderRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={settings.borderRadius}
            onChange={(e) => onUpdateSettings({ borderRadius: Number(e.target.value) })}
            className={styles.rangeInput}
            suppressHydrationWarning
          />
        </div>
      </section>

      {/* Background / Gap Color & Gradient */}
      <BackgroundColorSection
        backgroundColor={settings.backgroundColor}
        onUpdateColor={(backgroundColor) => onUpdateSettings({ backgroundColor })}
        gradient={settings.gradient}
        onUpdateGradient={(newGrad) =>
          onUpdateSettings({
            gradient: { ...(settings.gradient || {}), ...newGrad } as any,
          })
        }
        suggestedColors={suggestedColors}
        isExtracting={isExtractingColors}
        onReExtract={onReExtractColors}
        photoCount={totalPhotos}
      />

      {/* Cell Effects (Glow, Shadow, Borders) */}
      <CellEffectsSection
        cellEffect={settings.cellEffect}
        onUpdateEffect={(newEffect) =>
          onUpdateSettings({
            cellEffect: { ...(settings.cellEffect || {}), ...newEffect } as CellEffectConfig,
          })
        }
      />



      {/* Selected Cell Controls */}
      {selectedCell && (
        <section className={`${styles.section} ${styles.cellSection}`}>
          <div className={styles.sectionHeader}>
            <h4>Active Frame Zoom</h4>
          </div>

          <div className={styles.controlGroup}>
            <div className={styles.labelRow}>
              <span>Crop Zoom</span>
              <span className={styles.valBadge}>
                {Math.round(selectedCell.transform.zoom * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.05"
              value={selectedCell.transform.zoom}
              onChange={(e) => onUpdateSelectedCell({ zoom: Number(e.target.value) })}
              className={styles.rangeInput}
              suppressHydrationWarning
            />
          </div>

          <button
            className={styles.resetPanBtn}
            onClick={() => onUpdateSelectedCell({ zoom: 1, offsetX: 0, offsetY: 0 })}
          >
            <span>Reset Frame Pan & Zoom</span>
          </button>
        </section>
      )}

      <div className={styles.footerNote}>
        <span>{totalPhotos} photos</span>
      </div>
    </aside>
  );
};
