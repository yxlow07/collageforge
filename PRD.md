# Product Requirement Document (PRD): Automated Random Collage Creator

## 1. Executive Summary & Objective

The **Automated Random Collage Creator** is a web-based tool designed to eliminate the manual friction of assembling photo collages. Users upload a single `.zip` file containing an arbitrary number of images; the system extracts the images and immediately generates a dynamically packed, non-standard random collage layout. Users can customize, rearrange, re-crop, and adjust styling before exporting a high-resolution PNG ready for print or digital sharing.

---

## 2. Target Audience & Use Cases

* **Event & Vacation Summaries:** Users with 20–100 photos from a trip or party who want a poster without individually placing images into static templates.
* **Content Creators & Marketers:** Quick mood boards, aesthetic montages, and social media recaps.
* **Scrapbookers & Print Enthusiasts:** Fast layout exploration for wall prints and photo albums.

---

## 3. User Personas & Core Workflows

```
[Upload .zip] ──> [Extract & Filter Images] ──> [Procedural Grid Generation]
                                                        │
                                                        ▼
[Export PNG]  <── [Reposition / Style / Swap] <── [Interactive Canvas]

```

1. **Upload:** User drops a `.zip` archive onto the upload zone.
2. **Extraction & Validation:** The app extracts valid image files, detects aspect ratios, and discards invalid files.
3. **Initial Render:** The layout engine builds an irregular, non-uniform grid and populates it with images.
4. **Customization:** The user tweaks border thickness, shuffles layouts, swaps frames via drag-and-drop, and pans/zooms images inside individual cells.
5. **Export:** User selects a scale/resolution and downloads a clean `.png`.

---

## 4. Feature Specifications

### 4.1. File Ingestion & Archive Unpacking

* **Supported Archive Types:** `.zip`.
* **Supported Image Formats:** JPEG, PNG, WEBP, HEIC (converted client- or worker-side).
* **Archive Parsing:**
* Client-side extraction via WebAssembly/Web Workers (e.g., `JSZip` / `fflate`) to avoid heavy server bandwidth costs.
* Recursively traverse subdirectories inside the `.zip` archive.
* Filter out OS artifacts (`__MACOSX`, `.DS_Store`, hidden files).
* Filter out unsupported extensions or corrupted media with non-blocking error notifications (e.g., *"14 photos imported; 2 non-image files ignored"*).


* **Image Count Limits:**
* Minimum: 2 images.
* Recommended standard: 6–50 images.
* Soft warning threshold: 100+ images (alert user about potential browser canvas memory constraints).



---

### 4.2. Algorithmic Non-Standard Layout Generation

* **Irregular Grid Generation:**
* Move away from uniform $N \times M$ grids.
* Utilize a **recursive binary tree partitioning (BSP)** or **guillotine packing algorithm** with variable aspect ratios:
1. Start with the root bounding canvas.
2. Split nodes horizontally or vertically at randomized split ratios (e.g., 30/70, 40/60, 50/50).
3. Continue splitting until leaf count equals the total image count.


* Ensure leaf nodes adhere to bounded minimum aspect ratios (between $1:2$ and $2:1$) to avoid unusable ultra-thin slivers.


* **Regenerate / Shuffle Layout:**
* **"Re-Roll Layout" button:** Retains current image order but recalculates node split ratios and orientations.
* **"Shuffle Photos" button:** Keeps the layout intact but randomizes which image maps to which node.



---

### 4.3. Interactive Collage Editor (Canvas Engine)

| Feature | Interaction / Mechanism | Behavior / Requirements |
| --- | --- | --- |
| **Drag & Swap** | Drag one grid cell over another | Swaps the two images while keeping cell frame dimensions intact. Visual drop target indicator appears on hover. |
| **Repositioning & Panning** | Double-click or select cell $\rightarrow$ drag photo | Repositions the photo within the clipping mask of its cell (`object-position` behavior). |
| **Focal Zoom** | Scroll wheel or slider when cell is active | Zooms in/out within the cell boundary (clamped to prevent showing empty borders inside the cell). |
| **Border & Gap Editing** | Global slider control (0px to 40px) | Adjusts inner margins between adjacent cells dynamically without clipping images. |
| **Border Radius** | Global slider control (0px to 30px) | Rounds the corners of each image cell. |
| **Border / Background Color** | Color picker + Hex input + KNN Smart Palette | Sets the canvas background color revealed by cell gaps. Uses KNN / K-means clustering on imported photos to extract average pixel color and dynamically suggest harmonized variations (Deep Shade, Soft Tint, Muted Neutral, Vibrant Accent, Warm/Cool Harmony, Complementary, and dominant cluster tones). |
| **Canvas Dimensions** | Preset dropdown + Custom inputs | Presets: 1:1 (Square), 4:5 (Instagram portrait), 16:9 (Landscape), A4/Poster ratios. |

---

### 4.4. PNG Export Engine

* **Offscreen Canvas Rendering:** Render output using an `OffscreenCanvas` at full target resolution to avoid DPI artifacts from screen display scaling.
* **Resolution Settings:**
* **Standard (1x):** Matches current viewport canvas dimensions (72 DPI).
* **High-Res (2x / 4x):** Multiplies scale factor for physical prints (up to 300 DPI equivalent, e.g., 3840×2160 or 4000×4000 px).


* **Export Metadata:** Strips private EXIF data from generated PNG while preserving sRGB color profiles.
* **File Naming Convention:** `collage-[timestamp]-[dimensions].png`.

---

## 5. Non-Functional Requirements

### 5.1. Performance & Memory

* **Extraction Throughput:** Unpack and parse up to 50 MB (approx. 50 average phone photos) in under 3 seconds on modern desktop hardware.
* **Rendering FPS:** Maintain $\ge 60$ FPS during pan, zoom, and border slider operations using canvas or WebGL-accelerated rendering (e.g., PixiJS, Fabric.js, or Konva.js).
* **Memory Management:** Downscale raw multi-megapixel images to working textures during editing; load original raw assets only during the high-res PNG export pass to prevent browser tab crashes on mobile/low-memory devices.

### 5.2. Usability & Accessibility

* Responsive drag-and-drop zone with full keyboard accessibility for basic toolbar functions (Undo/Redo, Shuffle, Export).
* Clear progress bar during archive extraction and high-res export generation.

---

## 6. Technical Stack Recommendations

* **Frontend Framework:** React or Next.js (TypeScript).
* **Archive Parsing:** `fflate` (lightweight, high-speed unzipping in Web Workers).
* **Canvas / Rendering Engine:**
* `Konva.js` (or `Fabric.js`) for scene-graph-based canvas manipulation, clipping groups, and dragging.


* **Image Processing & Export:** HTML5 Canvas API + Web Worker for off-thread PNG blob compilation.

---

## 7. Risks & Mitigations

* **Risk: Browser OOM (Out of Memory) on large zip uploads (e.g., 100+ 12MP images).**
* *Mitigation:* Generate thumbnail proxies for editing mode (max dimension 1200px); process full-resolution originals sequentially during export.


* **Risk: Random partition producing extreme, warped aspect ratios.**
* *Mitigation:* Apply strict boundary constraints in the recursive partition algorithm; reject partitions that yield width/height ratios outside $0.45$ to $2.2$.


* **Risk: HEIC/HEIF photos from iPhone users inside zip files.**
* *Mitigation:* Bundle `heic2any` to silently convert HEIC files to JPEG in a Web Worker before rendering.



---

## 8. Success Metrics (KPIs)

* **Time to First Collage:** $< 5$ seconds from drop event to full initial layout render.
* **Export Success Rate:** $> 99\%$ completed exports without WebGL context loss or memory crashes.
* **Customization Engagement:** Average of $\ge 2.5$ user edit actions (re-roll, swap, pan, or border tweak) per session before exporting.