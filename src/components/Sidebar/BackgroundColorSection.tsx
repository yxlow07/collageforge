'use client';

import React from 'react';
import styles from './BackgroundColorSection.module.css';
import { SuggestedColor, GradientSettings } from '@/types/collage';
import { Loader2 } from 'lucide-react';
import { GradientCustomizer } from './GradientCustomizer';

export const COLOR_PRESETS = [
  { name: 'Espresso Dark', hex: '#14110e' },
  { name: 'Sunset Amber', hex: '#ea580c' },
  { name: 'Warm Terracotta', hex: '#c2410c' },
  { name: 'Golden Honey', hex: '#d97706' },
  { name: 'Warm Sand', hex: '#fed7aa' },
  { name: 'Alabaster Cream', hex: '#faf7f2' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Transparent', hex: '' },
];

interface BackgroundColorSectionProps {
  backgroundColor: string;
  onUpdateColor: (color: string) => void;
  gradient?: GradientSettings;
  onUpdateGradient?: (grad: Partial<GradientSettings>) => void;
  suggestedColors: SuggestedColor[];
  isExtracting?: boolean;
  onReExtract?: () => void;
  photoCount: number;
}

export const BackgroundColorSection: React.FC<BackgroundColorSectionProps> = ({
  backgroundColor,
  onUpdateColor,
  gradient,
  onUpdateGradient,
  suggestedColors,
  isExtracting = false,
  onReExtract,
  photoCount,
}) => {
  const isGradient = Boolean(gradient?.enabled);

  const handleSetMode = (mode: 'solid' | 'gradient') => {
    if (onUpdateGradient) {
      onUpdateGradient({ enabled: mode === 'gradient' });
    }
  };

  const gradientPreview = isGradient
    ? gradient?.type === 'radial'
      ? `radial-gradient(circle, ${gradient.colorStart}, ${gradient.colorEnd})`
      : `linear-gradient(${gradient?.angle || 135}deg, ${gradient?.colorStart}, ${gradient?.colorEnd})`
    : '';

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerTitle}>
          <h4>Background</h4>
        </div>
        <div className={styles.activeColorBadge}>
          {isGradient ? (
            <>
              <span className={styles.activeDot} style={{ background: gradientPreview }} />
              <span>Gradient</span>
            </>
          ) : (
            <>
              <span
                className={`${styles.activeDot} ${!backgroundColor ? styles.checkerboard : ''}`}
                style={{ backgroundColor: backgroundColor || 'transparent' }}
              />
              <span>{backgroundColor || 'Transparent'}</span>
            </>
          )}
        </div>
      </div>

      {/* Mode Tabs: Solid vs Gradient */}
      <div className={styles.modeTabs}>
        <button
          className={`${styles.modeTab} ${!isGradient ? styles.activeModeTab : ''}`}
          onClick={() => handleSetMode('solid')}
          type="button"
        >
          <span>Solid</span>
        </button>
        <button
          className={`${styles.modeTab} ${isGradient ? styles.activeModeTab : ''}`}
          onClick={() => handleSetMode('gradient')}
          type="button"
        >
          <span>Gradient</span>
        </button>
      </div>

      {isGradient ? (
        <GradientCustomizer
          gradient={gradient}
          onUpdateGradient={onUpdateGradient || (() => {})}
          suggestedColors={suggestedColors}
        />
      ) : (
        <>
          {/* Suggested Colors from Photos via KNN / K-Means */}
          <div className={styles.subgroup}>
            <div className={styles.subgroupHeader}>
              <div className={styles.subgroupLabel}>
                <span>Suggested from Photos</span>
                <span className={styles.badge}>KNN</span>
              </div>
              {photoCount > 0 && onReExtract && (
                <button
                  onClick={onReExtract}
                  className={styles.reExtractBtn}
                  title="Re-extract color suggestions"
                  disabled={isExtracting}
                >
                  <span>Re-extract</span>
                </button>
              )}
            </div>

        {isExtracting ? (
          <div className={styles.extractingPlaceholder}>
            <Loader2 size={13} className={styles.spin} />
            <span>Analyzing photo pixels with KNN...</span>
          </div>
        ) : suggestedColors.length > 0 ? (
          <div className={styles.swatchGrid}>
            {suggestedColors.map((item) => {
              const isSelected = backgroundColor.toLowerCase() === item.hex.toLowerCase();
              return (
                <button
                  key={`${item.name}-${item.hex}`}
                  className={`${styles.swatchBtn} ${isSelected ? styles.swatchActive : ''}`}
                  style={{ backgroundColor: item.hex }}
                  onClick={() => onUpdateColor(item.hex)}
                  title={`${item.name} (${item.hex})\n${item.description}`}
                  type="button"
                >
                  {item.isAverage && <span className={styles.swatchIndicator} />}
                </button>
              );
            })}
          </div>
        ) : (
          <p className={styles.noPhotosHint}>
            {photoCount === 0
              ? 'Upload photos to extract matching background colors'
              : 'Extracting photo color palette...'}
          </p>
        )}
      </div>

      {/* Standard Palette Presets */}
      <div className={styles.subgroup}>
        <div className={styles.subgroupHeader}>
          <span className={styles.subgroupLabel}>Standard Presets</span>
        </div>
        <div className={styles.swatchGrid}>
          {COLOR_PRESETS.map((c) => {
            const isSelected = backgroundColor === c.hex;
            return (
              <button
                key={c.name}
                className={`${styles.swatchBtn} ${isSelected ? styles.swatchActive : ''} ${
                  !c.hex ? styles.checkerboard : ''
                }`}
                style={{ backgroundColor: c.hex || 'transparent' }}
                onClick={() => onUpdateColor(c.hex)}
                title={`${c.name} ${c.hex ? `(${c.hex})` : ''}`}
                type="button"
              />
            );
          })}
        </div>
      </div>

      {/* Custom Picker and Hex Input */}
      <div className={styles.customColorRow}>
        <input
          type="color"
          value={backgroundColor || '#ffffff'}
          onChange={(e) => onUpdateColor(e.target.value)}
          className={styles.colorPicker}
          title="Pick custom color"
          suppressHydrationWarning
        />
        <input
          type="text"
          value={backgroundColor}
          placeholder="#000000 or transparent"
          onChange={(e) => onUpdateColor(e.target.value)}
          className={styles.hexInput}
          suppressHydrationWarning
        />
      </div>
        </>
      )}
    </section>
  );
};
