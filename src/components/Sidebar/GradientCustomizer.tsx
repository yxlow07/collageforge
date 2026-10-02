'use client';

import React from 'react';
import styles from './GradientCustomizer.module.css';
import { GradientSettings, SuggestedColor, DEFAULT_GRADIENT_SETTINGS } from '@/types/collage';

interface GradientCustomizerProps {
  gradient?: GradientSettings;
  onUpdateGradient: (newGrad: Partial<GradientSettings>) => void;
  suggestedColors?: SuggestedColor[];
}

export const GRADIENT_PRESETS = [
  { name: 'Sunset Ember', start: '#ea580c', end: '#431407', angle: 135 },
  { name: 'Espresso Twilight', start: '#2d1810', end: '#0d0b09', angle: 135 },
  { name: 'Nordic Slate', start: '#334155', end: '#0f172a', angle: 180 },
  { name: 'Golden Amber', start: '#d97706', end: '#451a03', angle: 135 },
  { name: 'Rose Noir', start: '#831843', end: '#1e1017', angle: 135 },
  { name: 'Deep Emerald', start: '#065f46', end: '#022c22', angle: 135 },
  { name: 'Studio Light', start: '#ffffff', end: '#cbd5e1', angle: 180 },
  { name: 'Desert Sand', start: '#fef3c7', end: '#fde68a', angle: 135 },
];

export const GradientCustomizer: React.FC<GradientCustomizerProps> = ({
  gradient = DEFAULT_GRADIENT_SETTINGS,
  onUpdateGradient,
  suggestedColors = [],
}) => {
  const { type = 'linear', angle = 135, colorStart = '#2d1810', colorEnd = '#0f0c0a' } = gradient;

  const previewStyle =
    type === 'radial'
      ? `radial-gradient(circle at center, ${colorStart}, ${colorEnd})`
      : `linear-gradient(${angle}deg, ${colorStart}, ${colorEnd})`;

  // Generate Photo-Matched Gradient from top KNN colors
  const handlePhotoMatch = () => {
    if (suggestedColors.length >= 2) {
      onUpdateGradient({
        enabled: true,
        colorStart: suggestedColors[0].hex,
        colorEnd: suggestedColors[1].hex,
        angle: 135,
      });
    }
  };

  return (
    <div className={styles.container}>
      {/* Live Gradient Preview Bar */}
      <div className={styles.previewBar} style={{ background: previewStyle }}>
        <span className={styles.previewBadge}>
          {type === 'radial' ? 'Radial' : `${angle}° Linear`}
        </span>
      </div>

      {/* 1-Click Photo Matched Gradient */}
      {suggestedColors.length >= 2 && (
        <button className={styles.photoMatchBtn} onClick={handlePhotoMatch} type="button">
          <span>Generate Photo-Matched Gradient</span>
        </button>
      )}

      {/* Presets */}
      <div className={styles.subgroup}>
        <span className={styles.subgroupLabel}>Gradient Presets</span>
        <div className={styles.presetGrid}>
          {GRADIENT_PRESETS.map((p) => {
            const bg = `linear-gradient(${p.angle}deg, ${p.start}, ${p.end})`;
            return (
              <button
                key={p.name}
                className={styles.presetSwatch}
                style={{ background: bg }}
                onClick={() =>
                  onUpdateGradient({
                    enabled: true,
                    type: 'linear',
                    angle: p.angle,
                    colorStart: p.start,
                    colorEnd: p.end,
                  })
                }
                title={`${p.name} (${p.start} → ${p.end})`}
                type="button"
              />
            );
          })}
        </div>
      </div>

      {/* Gradient Type (Linear vs Radial) */}
      <div className={styles.subgroup}>
        <span className={styles.subgroupLabel}>Gradient Style</span>
        <div className={styles.typeRow}>
          <button
            className={`${styles.typeBtn} ${type === 'linear' ? styles.activeType : ''}`}
            onClick={() => onUpdateGradient({ type: 'linear' })}
            type="button"
          >
            <span>Linear</span>
          </button>
          <button
            className={`${styles.typeBtn} ${type === 'radial' ? styles.activeType : ''}`}
            onClick={() => onUpdateGradient({ type: 'radial' })}
            type="button"
          >
            <span>Radial</span>
          </button>
        </div>
      </div>

      {/* Linear Angle Slider & Presets */}
      {type === 'linear' && (
        <div className={styles.angleRow}>
          <div className={styles.labelRow}>
            <span>Angle</span>
            <span className={styles.valBadge}>{angle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={angle}
            onChange={(e) => onUpdateGradient({ angle: Number(e.target.value) })}
            className={styles.rangeInput}
            suppressHydrationWarning
          />
          <div className={styles.directionButtons}>
            <button
              className={`${styles.dirBtn} ${angle === 90 ? styles.activeDir : ''}`}
              onClick={() => onUpdateGradient({ angle: 90 })}
              title="Horizontal (90°)"
              type="button"
            >
              90° →
            </button>
            <button
              className={`${styles.dirBtn} ${angle === 180 ? styles.activeDir : ''}`}
              onClick={() => onUpdateGradient({ angle: 180 })}
              title="Vertical (180°)"
              type="button"
            >
              180° ↓
            </button>
            <button
              className={`${styles.dirBtn} ${angle === 135 ? styles.activeDir : ''}`}
              onClick={() => onUpdateGradient({ angle: 135 })}
              title="Diagonal (135°)"
              type="button"
            >
              135° ↘
            </button>
            <button
              className={`${styles.dirBtn} ${angle === 45 ? styles.activeDir : ''}`}
              onClick={() => onUpdateGradient({ angle: 45 })}
              title="Diagonal (45°)"
              type="button"
            >
              45° ↗
            </button>
          </div>
        </div>
      )}

      {/* Color Stops Pickers */}
      <div className={styles.stopsSection}>
        <div className={styles.stopRow}>
          <span className={styles.stopLabel}>Start</span>
          <input
            type="color"
            value={colorStart}
            onChange={(e) => onUpdateGradient({ colorStart: e.target.value })}
            className={styles.colorPicker}
            title="Pick gradient start color"
            suppressHydrationWarning
          />
          <input
            type="text"
            value={colorStart}
            onChange={(e) => onUpdateGradient({ colorStart: e.target.value })}
            className={styles.hexInput}
            placeholder="#000000"
            suppressHydrationWarning
          />
        </div>

        <div className={styles.stopRow}>
          <span className={styles.stopLabel}>End</span>
          <input
            type="color"
            value={colorEnd}
            onChange={(e) => onUpdateGradient({ colorEnd: e.target.value })}
            className={styles.colorPicker}
            title="Pick gradient end color"
            suppressHydrationWarning
          />
          <input
            type="text"
            value={colorEnd}
            onChange={(e) => onUpdateGradient({ colorEnd: e.target.value })}
            className={styles.hexInput}
            placeholder="#000000"
            suppressHydrationWarning
          />
        </div>
      </div>
    </div>
  );
};
