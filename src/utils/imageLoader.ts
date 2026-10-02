import { PhotoItem } from '@/types/collage';

export function preloadImages(
  items: PhotoItem[],
  onAllLoaded?: (map: Map<string, HTMLImageElement>) => void
): Map<string, HTMLImageElement> {
  const map = new Map<string, HTMLImageElement>();
  let loadedCount = 0;

  if (items.length === 0) {
    if (onAllLoaded) onAllLoaded(map);
    return map;
  }

  items.forEach((p) => {
    const img = new Image();
    img.src = p.src;
    img.onload = () => {
      loadedCount++;
      if (loadedCount === items.length && onAllLoaded) {
        onAllLoaded(new Map(map));
      }
    };
    img.onerror = () => {
      loadedCount++;
      if (loadedCount === items.length && onAllLoaded) {
        onAllLoaded(new Map(map));
      }
    };
    map.set(p.id, img);
  });

  return map;
}
