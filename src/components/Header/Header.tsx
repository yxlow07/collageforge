'use client';

import React from 'react';
import styles from './Header.module.css';
import {
  Sparkles,
  Dices,
  Shuffle,
  Undo2,
  Redo2,
  Download,
  Upload,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  photoCount: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRerollLayout: () => void;
  onShufflePhotos: () => void;
  onOpenExport: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  photoCount,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRerollLayout,
  onShufflePhotos,
  onOpenExport,
  onReset,
}) => {
  return (
    <header className={styles.header}>
      {/* Brand logo & title */}
      <div className={styles.brand}>
        <div className={styles.logoIcon}>
          <Layers size={20} />
        </div>
        <div className={styles.brandText}>
          <h1 className={styles.title}>CollageForge</h1>
        </div>
        {photoCount > 0 && (
          <span className={styles.photoBadge} title="Active photos in collage">
            {photoCount} photos
          </span>
        )}
      </div>

      {/* Main Action Bar */}
      {photoCount > 0 && (
        <div className={styles.actions}>
          {/* Undo / Redo */}
          <div className={styles.historyGroup}>
            <button
              className={styles.iconBtn}
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <Undo2 size={16} />
            </button>
            <button
              className={styles.iconBtn}
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
            >
              <Redo2 size={16} />
            </button>
          </div>

          <div className={styles.divider} />

          {/* Procedural Grid Mutations */}
          <button
            className={styles.actionBtn}
            onClick={onRerollLayout}
            title="Generate new irregular BSP grid splits (R)"
          >
            <Dices size={16} className={styles.diceIcon} />
            <span>Re-Roll Layout</span>
            <kbd className={styles.kbd}>R</kbd>
          </button>

          <button
            className={styles.actionBtn}
            onClick={onShufflePhotos}
            title="Randomize photo positions inside current layout (S)"
          >
            <Shuffle size={16} />
            <span>Shuffle Photos</span>
            <kbd className={styles.kbd}>S</kbd>
          </button>

          <div className={styles.divider} />

          {/* New Upload / Clear */}
          <button
            className={styles.textBtn}
            onClick={onReset}
            title="Clear and upload new .zip archive"
          >
            <Upload size={15} />
            <span>New Media</span>
          </button>

          {/* Export PNG */}
          <button
            className={styles.exportBtn}
            onClick={onOpenExport}
            title="Export high-resolution PNG (Ctrl+E)"
          >
            <Download size={16} />
            <span>Export PNG</span>
          </button>
        </div>
      )}
    </header>
  );
};
