'use client';

import React, { useState } from 'react';
import styles from './ExportModal.module.css';
import { LayoutCell, CollageSettings } from '@/types/collage';
import { exportCollageAsPng } from '@/utils/exportEngine';
import { X, Loader2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cells: LayoutCell[];
  photosMap: Map<string, HTMLImageElement>;
  settings: CollageSettings;
  onSuccess: (fileName: string) => void;
  onError: (err: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  cells,
  photosMap,
  settings,
  onSuccess,
  onError,
}) => {
  const [scale, setScale] = useState<1 | 2 | 4>(2);
  const [isExporting, setIsExporting] = useState(false);
  const [statusText, setStatusText] = useState('');

  if (!isOpen) return null;

  const currentW = Math.round(settings.canvasWidth * scale);
  const currentH = Math.round(settings.canvasHeight * scale);

  const handleExport = async () => {
    setIsExporting(true);
    setStatusText('Initiating render engine...');

    try {
      const fileName = await exportCollageAsPng(
        {
          scale,
          cells,
          photosMap,
          settings,
        },
        (status) => setStatusText(status)
      );
      onSuccess(fileName);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Export failed';
      onError(msg);
    } finally {
      setIsExporting(false);
      setStatusText('');
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.titleWrap}>
            <h3>Export High-Resolution PNG</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close export dialog">
            <X size={18} />
          </button>
        </div>

        <p className={styles.desc}>
          Offscreen canvas renders pixel-perfect vector clipped frames with sRGB profile and clean EXIF metadata.
        </p>

        <div className={styles.scaleGrid}>
          {/* 1x Standard */}
          <div
            className={`${styles.scaleCard} ${scale === 1 ? styles.scaleActive : ''}`}
            onClick={() => setScale(1)}
          >
            <div className={styles.scaleHeader}>
              <span className={styles.scaleBadge}>1x</span>
              <span className={styles.scaleTitle}>Web & Screen</span>
            </div>
            <p className={styles.resText}>
              {settings.canvasWidth} × {settings.canvasHeight} px
            </p>
            <span className={styles.dpiTag}>72 DPI • Fast Export</span>
          </div>

          {/* 2x High-Res */}
          <div
            className={`${styles.scaleCard} ${scale === 2 ? styles.scaleActive : ''}`}
            onClick={() => setScale(2)}
          >
            <div className={styles.scaleHeader}>
              <span className={styles.scaleBadge}>2x</span>
              <span className={styles.scaleTitle}>HD Quality</span>
            </div>
            <p className={styles.resText}>
              {settings.canvasWidth * 2} × {settings.canvasHeight * 2} px
            </p>
            <span className={styles.dpiTag}>Retina Crisp • Recommended</span>
          </div>

          {/* 4x Ultra Print */}
          <div
            className={`${styles.scaleCard} ${scale === 4 ? styles.scaleActive : ''}`}
            onClick={() => setScale(4)}
          >
            <div className={styles.scaleHeader}>
              <span className={styles.scaleBadge}>4x</span>
              <span className={styles.scaleTitle}>Ultra Print</span>
            </div>
            <p className={styles.resText}>
              {settings.canvasWidth * 4} × {settings.canvasHeight * 4} px
            </p>
            <span className={styles.dpiTag}>300 DPI Poster Ready</span>
          </div>
        </div>

        <div className={styles.targetBanner}>
          <span>Output: {currentW} × {currentH} px PNG (Lossless)</span>
        </div>

        {isExporting && (
          <div className={styles.progressBox}>
            <Loader2 className={styles.spin} size={18} />
            <span>{statusText || 'Rendering output...'}</span>
          </div>
        )}

        <div className={styles.actionRow}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={isExporting}>
            Cancel
          </button>
          <button
            className={styles.downloadBtn}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting && <Loader2 className={styles.spin} size={18} />}
            <span>{isExporting ? 'Generating PNG...' : 'Download PNG'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
