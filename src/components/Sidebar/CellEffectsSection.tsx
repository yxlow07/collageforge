'use client';

import React, { useState, useMemo } from 'react';
import styles from './CellEffectsSection.module.css';
import { CellEffectConfig, CellEffectType, DEFAULT_CELL_EFFECT } from '@/types/collage';
import { Sparkles } from 'lucide-react';

interface CellEffectsSectionProps {
  cellEffect?: CellEffectConfig;
  onUpdateEffect: (newEffect: Partial<CellEffectConfig>) => void;
}

const EFFECT_PRESETS: Array<{
  type: CellEffectType;
  label: string;
  previewClass: string;
  config: CellEffectConfig;
}> = [
  {
    type: 'none',
    label: 'None',
    previewClass: 'previewNone',
    config: { type: 'none', blur: 0, color: 'rgba(0, 0, 0, 0.45)', borderWidth: 0, borderColor: '#ffffff' },
  },
  {
    type: 'soft_shadow',
    label: 'Soft Shadow',
    previewClass: 'previewSoftShadow',
    config: { type: 'soft_shadow', blur: 8, color: 'rgba(0, 0, 0, 0.35)', borderWidth: 0, borderColor: '#ffffff' },
  },
  {
    type: 'deep_shadow',
    label: 'Deep 3D',
    previewClass: 'previewDeepShadow',
    config: { type: 'deep_shadow', blur: 14, color: 'rgba(0, 0, 0, 0.55)', borderWidth: 0, borderColor: '#ffffff' },
  },
  {
    type: 'radiant_glow',
    label: 'Warm Glow',
    previewClass: 'previewWarmGlow',
    config: { type: 'radiant_glow', blur: 10, color: 'rgba(249, 115, 22, 0.65)', borderWidth: 0, borderColor: '#ffffff' },
  },
  {
    type: 'classic_border',
    label: 'Framed',
    previewClass: 'previewFramed',
    config: { type: 'classic_border', blur: 0, color: 'rgba(0, 0, 0, 0.45)', borderWidth: 3, borderColor: '#ffffff' },
  },
  {
    type: 'floating_frame',
    label: 'Floating Mat',
    previewClass: 'previewFloatingMat',
    config: { type: 'floating_frame', blur: 10, color: 'rgba(0, 0, 0, 0.45)', borderWidth: 2, borderColor: '#ffffff' },
  },
];

const GLOW_COLOR_CHIPS = [
  { label: 'Deep Shadow', color: 'rgba(0, 0, 0, 0.65)' },
  { label: 'Soft Shadow', color: 'rgba(0, 0, 0, 0.35)' },
  { label: 'Warm Amber', color: 'rgba(249, 115, 22, 0.7)' },
  { label: 'Golden Honey', color: 'rgba(245, 158, 11, 0.7)' },
  { label: 'Electric Cyan', color: 'rgba(6, 182, 212, 0.7)' },
  { label: 'Soft Halo', color: 'rgba(255, 255, 255, 0.5)' },
];

const BORDER_COLOR_CHIPS = [
  { label: 'Pure White', color: '#ffffff' },
  { label: 'Off-White', color: '#f4f4f5' },
  { label: 'Muted Zinc', color: '#71717a' },
  { label: 'Dark Charcoal', color: '#18181b' },
  { label: 'Warm Amber', color: '#f97316' },
  { label: 'Golden Brass', color: '#d97706' },
];

function parseRgbaOrHex(colorStr: string): { hex: string; alpha: number } {
  if (!colorStr) return { hex: '#000000', alpha: 0.5 };
  const trimmed = colorStr.trim();

  // Match rgba(r, g, b, a) or rgb(r, g, b)
  const rgbaMatch = trimmed.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i
  );
  if (rgbaMatch) {
    const r = Math.min(255, parseInt(rgbaMatch[1], 10));
    const g = Math.min(255, parseInt(rgbaMatch[2], 10));
    const b = Math.min(255, parseInt(rgbaMatch[3], 10));
    const a = rgbaMatch[4] !== undefined ? Math.max(0, Math.min(1, parseFloat(rgbaMatch[4]))) : 1;
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return { hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`, alpha: a };
  }

  // Match #rrggbb
  if (/^#?[0-9a-f]{6}$/i.test(trimmed)) {
    const clean = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    return { hex: clean.toLowerCase(), alpha: 1 };
  }

  // Match #rgb
  if (/^#?[0-9a-f]{3}$/i.test(trimmed)) {
    const clean = trimmed.replace('#', '');
    const r = clean[0], g = clean[1], b = clean[2];
    return { hex: `#${r}${r}${g}${g}${b}${b}`.toLowerCase(), alpha: 1 };
  }

  return { hex: '#000000', alpha: 0.5 };
}

function toRgbaString(hex: string, alpha: number): string {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (cleanHex.length !== 6) {
    cleanHex = '000000';
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  const roundedAlpha = Math.max(0, Math.min(1, Math.round(alpha * 100) / 100));
  return `rgba(${r}, ${g}, ${b}, ${roundedAlpha})`;
}

export const CellEffectsSection: React.FC<CellEffectsSectionProps> = ({
  cellEffect = DEFAULT_CELL_EFFECT,
  onUpdateEffect,
}) => {
  const currentType = cellEffect.type || 'none';
  const { hex: shadowHex, alpha: shadowAlpha } = useMemo(
    () => parseRgbaOrHex(cellEffect.color),
    [cellEffect.color]
  );

  // Synchronize input text with external color without useEffect (official React pattern)
  const [prevShadowHex, setPrevShadowHex] = useState(shadowHex);
  const [shadowHexText, setShadowHexText] = useState(shadowHex);

  if (shadowHex !== prevShadowHex) {
    setPrevShadowHex(shadowHex);
    setShadowHexText(shadowHex);
  }

  const currentBorderColor = cellEffect.borderColor || '#ffffff';
  const [prevBorderColor, setPrevBorderColor] = useState(currentBorderColor);
  const [borderHexText, setBorderHexText] = useState(currentBorderColor);

  if (currentBorderColor !== prevBorderColor) {
    setPrevBorderColor(currentBorderColor);
    setBorderHexText(currentBorderColor);
  }

  const handleShadowHexChange = (newHex: string) => {
    onUpdateEffect({ color: toRgbaString(newHex, shadowAlpha) });
  };

  const handleShadowHexInputChange = (val: string) => {
    setShadowHexText(val);
    const clean = val.trim();
    if (/^#?[0-9a-fA-F]{6}$/.test(clean) || /^#?[0-9a-fA-F]{3}$/.test(clean)) {
      const formatted = clean.startsWith('#') ? clean : `#${clean}`;
      onUpdateEffect({ color: toRgbaString(formatted, shadowAlpha) });
    }
  };

  const handleShadowHexBlur = () => {
    setShadowHexText(shadowHex);
  };

  const handleShadowAlphaChange = (newAlpha: number) => {
    onUpdateEffect({ color: toRgbaString(shadowHex, newAlpha) });
  };

  const handleBorderColorChange = (newHex: string) => {
    onUpdateEffect({ borderColor: newHex });
  };

  const handleBorderHexInputChange = (val: string) => {
    setBorderHexText(val);
    const clean = val.trim();
    if (/^#?[0-9a-fA-F]{6}$/.test(clean) || /^#?[0-9a-fA-F]{3}$/.test(clean)) {
      const formatted = clean.startsWith('#') ? clean : `#${clean}`;
      onUpdateEffect({ borderColor: formatted });
    }
  };

  const handleBorderHexBlur = () => {
    setBorderHexText(currentBorderColor);
  };

  const isGlowChipActive = (chipColor: string) => {
    const parsedChip = parseRgbaOrHex(chipColor);
    return (
      parsedChip.hex.toLowerCase() === shadowHex.toLowerCase() &&
      Math.abs(parsedChip.alpha - shadowAlpha) < 0.03
    );
  };

  const isBorderChipActive = (chipColor: string) => {
    return currentBorderColor.toLowerCase() === chipColor.toLowerCase();
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerTitle}>
          <Sparkles size={14} className={styles.headerIcon} />
          <h4>Cell Effects & Depth</h4>
        </div>
        <span
          className={`${styles.activeBadge} ${
            currentType !== 'none' ? styles.activeBadgeHighlight : ''
          }`}
        >
          {currentType !== 'none' && <span className={styles.activePulseDot} />}
          {EFFECT_PRESETS.find((p) => p.type === currentType)?.label || 'Custom'}
        </span>
      </div>

      {/* Preset Buttons with visual miniature cards */}
      <div className={styles.presetsGrid}>
        {EFFECT_PRESETS.map((p) => {
          const isActive = currentType === p.type;
          return (
            <button
              key={p.type}
              className={`${styles.presetBtn} ${isActive ? styles.activePreset : ''}`}
              onClick={() => onUpdateEffect(p.config)}
              type="button"
              title={`Preset: ${p.label}`}
            >
              <div className={styles.presetPreviewCard}>
                <span className={`${styles.presetMiniCell} ${styles[p.previewClass]}`} />
              </div>
              <span className={styles.presetLabel}>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Fine-Tuning Controls */}
      {currentType !== 'none' && (
        <div className={styles.controlsWrap}>
          {/* Shadow / Glow Blur Intensity */}
          <div className={styles.controlGroup}>
            <div className={styles.labelRow}>
              <span>Shadow / Glow Blur</span>
              <span className={styles.valBadge}>{cellEffect.blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={cellEffect.blur}
              onChange={(e) => onUpdateEffect({ blur: Number(e.target.value) })}
              className={styles.rangeInput}
              suppressHydrationWarning
            />
          </div>

          {/* Shadow / Glow Color */}
          {cellEffect.blur > 0 && (
            <div className={styles.controlGroup}>
              <div className={styles.labelRow}>
                <span>Shadow / Glow Color</span>
                <span className={styles.valBadge}>
                  {shadowHex.toUpperCase()} · {Math.round(shadowAlpha * 100)}%
                </span>
              </div>
              <div className={styles.colorRow}>
                {/* Overlaid color selector & active preview color: only shows the active preview color */}
                <label
                  className={styles.colorPickerWrapper}
                  title={`Active effect color: ${cellEffect.color} (${Math.round(
                    shadowAlpha * 100
                  )}% opacity). Click to change color`}
                >
                  <span
                    className={styles.swatchPreview}
                    style={{ backgroundColor: cellEffect.color }}
                    aria-hidden="true"
                  />
                  <input
                    type="color"
                    value={shadowHex}
                    onChange={(e) => handleShadowHexChange(e.target.value)}
                    className={styles.hiddenColorInput}
                    title="Pick glow/shadow color"
                    aria-label="Pick glow/shadow color"
                    suppressHydrationWarning
                  />
                </label>
                <input
                  type="text"
                  value={shadowHexText}
                  onChange={(e) => handleShadowHexInputChange(e.target.value)}
                  onBlur={handleShadowHexBlur}
                  className={styles.colorInput}
                  placeholder="#000000"
                  spellCheck={false}
                  suppressHydrationWarning
                />
              </div>

              {/* Opacity / Transparency Slider */}
              <div className={styles.subControlGroup}>
                <div className={styles.labelRow}>
                  <span>Glow / Shadow Opacity</span>
                  <span className={styles.valBadge}>{Math.round(shadowAlpha * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={Math.round(shadowAlpha * 100)}
                  onChange={(e) => handleShadowAlphaChange(Number(e.target.value) / 100)}
                  className={styles.rangeInput}
                  suppressHydrationWarning
                />
              </div>

              {/* Preset Glow Chips with Active State */}
              <div className={styles.colorChips}>
                {GLOW_COLOR_CHIPS.map((chip) => {
                  const active = isGlowChipActive(chip.color);
                  return (
                    <button
                      key={chip.label}
                      className={`${styles.chip} ${active ? styles.activeChip : ''}`}
                      style={{ backgroundColor: chip.color }}
                      onClick={() => onUpdateEffect({ color: chip.color })}
                      title={`${chip.label} (${chip.color})`}
                      type="button"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Border Frame Width */}
          <div className={styles.controlGroup}>
            <div className={styles.labelRow}>
              <span>Frame Border Width</span>
              <span className={styles.valBadge}>{cellEffect.borderWidth}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              value={cellEffect.borderWidth}
              onChange={(e) => onUpdateEffect({ borderWidth: Number(e.target.value) })}
              className={styles.rangeInput}
              suppressHydrationWarning
            />
          </div>

          {/* Border Color */}
          {cellEffect.borderWidth > 0 && (
            <div className={styles.controlGroup}>
              <div className={styles.labelRow}>
                <span>Frame Border Color</span>
                <span className={styles.valBadge}>
                  {currentBorderColor.toUpperCase()}
                </span>
              </div>
              <div className={styles.colorRow}>
                {/* Overlaid color selector & active preview color: only shows the active preview color */}
                <label
                  className={styles.colorPickerWrapper}
                  title={`Border color: ${currentBorderColor}. Click to change color`}
                >
                  <span
                    className={styles.swatchPreview}
                    style={{ backgroundColor: currentBorderColor }}
                    aria-hidden="true"
                  />
                  <input
                    type="color"
                    value={currentBorderColor}
                    onChange={(e) => handleBorderColorChange(e.target.value)}
                    className={styles.hiddenColorInput}
                    title="Pick frame border color"
                    aria-label="Pick frame border color"
                    suppressHydrationWarning
                  />
                </label>
                <input
                  type="text"
                  value={borderHexText}
                  onChange={(e) => handleBorderHexInputChange(e.target.value)}
                  onBlur={handleBorderHexBlur}
                  className={styles.colorInput}
                  placeholder="#ffffff"
                  spellCheck={false}
                  suppressHydrationWarning
                />
              </div>

              {/* Preset Border Chips with Active State */}
              <div className={styles.colorChips}>
                {BORDER_COLOR_CHIPS.map((chip) => {
                  const active = isBorderChipActive(chip.color);
                  return (
                    <button
                      key={chip.label}
                      className={`${styles.chip} ${active ? styles.activeChip : ''}`}
                      style={{ backgroundColor: chip.color }}
                      onClick={() => onUpdateEffect({ borderColor: chip.color })}
                      title={`${chip.label} (${chip.color})`}
                      type="button"
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
