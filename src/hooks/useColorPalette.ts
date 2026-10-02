'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SuggestedColor } from '@/types/collage';
import { samplePixelsFromImages, generateColorSuggestions } from '@/utils/knnColorExtractor';

export function useColorPalette(
  photosMap: Map<string, HTMLImageElement>,
  photoCount: number
) {
  const [suggestedColors, setSuggestedColors] = useState<SuggestedColor[]>([]);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const extractPalette = useCallback(() => {
    if (photosMap.size === 0) {
      setSuggestedColors([]);
      return;
    }

    setIsExtracting(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Run extraction asynchronously to keep UI responsive
    timeoutRef.current = setTimeout(() => {
      try {
        const images = Array.from(photosMap.values()).filter(
          (img) => img.complete && img.naturalWidth > 0
        );

        if (images.length === 0) {
          setIsExtracting(false);
          return;
        }

        const pixels = samplePixelsFromImages(images);
        const suggestions = generateColorSuggestions(pixels);
        setSuggestedColors(suggestions);
      } catch (err) {
        console.warn('Failed to extract color palette:', err);
      } finally {
        setIsExtracting(false);
      }
    }, 120);
  }, [photosMap]);

  useEffect(() => {
    if (photoCount === 0 || photosMap.size === 0) {
      setSuggestedColors([]);
      setIsExtracting(false);
      return;
    }

    extractPalette();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [photosMap, photoCount, extractPalette]);

  return {
    suggestedColors,
    isExtracting,
    reExtract: extractPalette,
  };
}
