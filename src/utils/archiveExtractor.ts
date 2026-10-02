import JSZip from 'jszip';
import { PhotoItem } from '@/types/collage';

const VALID_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
const IGNORED_FILES = ['__macosx', '.ds_store', 'thumbs.db'];

export interface ExtractionResult {
  photos: PhotoItem[];
  ignoredCount: number;
  totalFound: number;
}

export type ProgressCallback = (percent: number, currentFileName: string) => void;

function isImageFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  for (const ign of IGNORED_FILES) {
    if (lower.includes(ign)) return false;
  }
  const baseName = fileName.split('/').pop() || '';
  if (baseName.startsWith('.')) return false;

  return VALID_IMAGE_EXTS.some((ext) => lower.endsWith(ext));
}

function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || 800;
      const height = img.naturalHeight || 800;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 800, height: 800 });
    };
    img.src = url;
  });
}

/**
 * Extracts all valid image files recursively from a zip archive.
 */
export async function extractImagesFromZip(
  file: File,
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const fileEntries: JSZip.JSZipObject[] = [];
  let ignoredCount = 0;

  loadedZip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;

    if (isImageFile(relativePath)) {
      fileEntries.push(zipEntry);
    } else {
      const lower = relativePath.toLowerCase();
      if (!lower.includes('__macosx') && !lower.endsWith('.ds_store')) {
        ignoredCount++;
      }
    }
  });

  const photos: PhotoItem[] = [];
  const total = fileEntries.length;

  for (let i = 0; i < total; i++) {
    const entry = fileEntries[i];
    const fileName = entry.name.split('/').pop() || entry.name;

    if (onProgress) {
      const percent = Math.round(((i + 1) / total) * 100);
      onProgress(percent, fileName);
    }

    try {
      const blob = await entry.async('blob');
      const { width, height } = await getImageDimensions(blob);
      const objectUrl = URL.createObjectURL(blob);

      photos.push({
        id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        name: fileName,
        src: objectUrl,
        originalWidth: width,
        originalHeight: height,
        aspectRatio: width / Math.max(1, height),
        blob,
      });
    } catch {
      ignoredCount++;
    }
  }

  return {
    photos,
    ignoredCount,
    totalFound: total,
  };
}

/**
 * Parses directly dropped or selected image files
 */
export async function processImageFiles(
  files: File[],
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  const validFiles: File[] = [];
  let ignoredCount = 0;

  for (const f of files) {
    if (isImageFile(f.name)) {
      validFiles.push(f);
    } else {
      ignoredCount++;
    }
  }

  const photos: PhotoItem[] = [];
  for (let i = 0; i < validFiles.length; i++) {
    const f = validFiles[i];
    if (onProgress) {
      onProgress(Math.round(((i + 1) / validFiles.length) * 100), f.name);
    }
    const { width, height } = await getImageDimensions(f);
    const objectUrl = URL.createObjectURL(f);

    photos.push({
      id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      name: f.name,
      src: objectUrl,
      originalWidth: width,
      originalHeight: height,
      aspectRatio: width / Math.max(1, height),
      blob: f,
    });
  }

  return {
    photos,
    ignoredCount,
    totalFound: validFiles.length,
  };
}
