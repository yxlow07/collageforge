'use client';

import React, { useState, useRef } from 'react';
import styles from './Dropzone.module.css';
import { Upload, FolderArchive, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { extractImagesFromZip, processImageFiles } from '@/utils/archiveExtractor';
import { getSampleGalleryPhotos } from '@/utils/sampleImages';
import { PhotoItem } from '@/types/collage';

interface DropzoneProps {
  onPhotosLoaded: (photos: PhotoItem[], ignoredCount: number) => void;
  isCompact?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onPhotosLoaded, isCompact = false }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setCurrentFile('');

    try {
      const firstFile = files[0];
      const isZip = firstFile.name.toLowerCase().endsWith('.zip');

      if (isZip) {
        const result = await extractImagesFromZip(firstFile, (pct, name) => {
          setProgress(pct);
          setCurrentFile(name);
        });
        onPhotosLoaded(result.photos, result.ignoredCount);
      } else {
        const fileArr = Array.from(files);
        const result = await processImageFiles(fileArr, (pct, name) => {
          setProgress(pct);
          setCurrentFile(name);
        });
        onPhotosLoaded(result.photos, result.ignoredCount);
      }
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setCurrentFile('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleLoadDemo = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const demoPhotos = getSampleGalleryPhotos();
      onPhotosLoaded(demoPhotos, 0);
      setIsProcessing(false);
    }, 250);
  };

  if (isCompact) {
    return (
      <div className={styles.compactContainer}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,image/jpeg,image/png,image/webp,image/svg+xml"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => handleFiles(e.target.files)}
          suppressHydrationWarning
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={styles.compactBtn}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className={styles.spin} size={16} />
          ) : (
            <Upload size={16} />
          )}
          <span>{isProcessing ? `${progress}%` : 'Upload ZIP / Photos'}</span>
        </button>
        <button
          onClick={handleLoadDemo}
          className={styles.compactDemoBtn}
          title="Load curated sample photo gallery"
          disabled={isProcessing}
        >
          <Sparkles size={16} />
          <span>Demo</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`${styles.dropzoneCard} ${isDragActive ? styles.dragActive : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip,image/jpeg,image/png,image/webp,image/svg+xml"
        multiple
        className={styles.hiddenInput}
        onChange={(e) => handleFiles(e.target.files)}
        suppressHydrationWarning
      />

      <div className={styles.iconCircle}>
        {isProcessing ? (
          <Loader2 className={styles.spin} size={36} />
        ) : (
          <FolderArchive size={36} />
        )}
      </div>

      <h3 className={styles.title}>
        {isProcessing ? 'Unpacking Media Archive...' : 'Drop your .zip archive here'}
      </h3>

      <p className={styles.subtitle}>
        Supports a single .zip file with photos or multiple JPEG, PNG, WebP images.
      </p>

      {isProcessing && (
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.progressMeta}>
            <span>{currentFile || 'Extracting...'}</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}

      {!isProcessing && (
        <div className={styles.buttonRow}>
          <button
            className={styles.browseBtn}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={18} />
            <span>Select .ZIP or Images</span>
          </button>

          <span className={styles.orText}>or</span>

          <button className={styles.demoBtn} onClick={handleLoadDemo}>
            <Sparkles size={18} />
            <span>Try with Sample Gallery</span>
          </button>
        </div>
      )}

      <div className={styles.featuresPills}>
        <span className={styles.pill}>
          <ImageIcon size={14} /> Auto BSP Grids
        </span>
        <span className={styles.pill}>
          <FolderArchive size={14} /> Subfolder Traversal
        </span>
        <span className={styles.pill}>
          <Sparkles size={14} /> 4K Offscreen Export
        </span>
      </div>
    </div>
  );
};
