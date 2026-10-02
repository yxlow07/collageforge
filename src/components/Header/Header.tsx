'use client';

import React from 'react';
import styles from './Header.module.css';
import {
  Undo2,
  Redo2,
  Sun,
  Moon,
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
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
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
  theme = 'dark',
  onToggleTheme,
}) => {
  return (
    <header className={styles.header}>
      {/* Brand logo & title */}
      <div className={styles.brand}>
        <div className={styles.brandText}>
          <h1 className={styles.title}>CollageForge</h1>
        </div>
        {photoCount > 0 && (
          <span className={styles.photoBadge} title="Active photos in collage">
            {photoCount} photos
          </span>
        )}
      </div>

      {/* Right controls: Actions + Theme Toggle */}
      <div className={styles.headerRight}>
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
              <span>Re-Roll Layout</span>
              <kbd className={styles.kbd}>R</kbd>
            </button>

            <button
              className={styles.actionBtn}
              onClick={onShufflePhotos}
              title="Randomize photo positions inside current layout (S)"
            >
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
              <span>New Media</span>
            </button>

            {/* Export PNG */}
            <button
              className={styles.exportBtn}
              onClick={onOpenExport}
              title="Export high-resolution PNG (Ctrl+E)"
            >
              <span>Export PNG</span>
            </button>
          </div>
        )}

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            className={styles.themeToggleBtn}
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        )}
      </div>
    </header>
  );
};
