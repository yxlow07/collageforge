# CollageForge — Automated Random Collage Creator

A high-performance, client-side web application designed to eliminate the manual friction of assembling photo collages. Users can drop an entire `.zip` archive or batch of images to immediately generate dynamically packed, non-standard layout grids, customize borders and colors, and export high-resolution print-ready PNGs.

---

## ✨ Features

### 📦 Client-Side Archive Ingestion
* **Drag-and-Drop ZIP Unpacking:** Fast client-side extraction using `JSZip` without uploading sensitive photos to a remote server.
* **Smart Artifact Filtering:** Automatically ignores OS hidden files (`.DS_Store`, `__MACOSX`, thumbnails) and invalid media.
* **Curated Demo Gallery:** One-click demo mode with procedurally generated vector scenes for immediate exploration.

### 🧩 Procedural Irregular Layouts (BSP Engine)
* **Non-Standard Grid Generation:** Uses recursive Binary Space Partitioning (BSP) and guillotine packing algorithms to generate irregular, dynamic layouts instead of rigid uniform grids.
* **Curated Templates:**
  * *Organic Dynamic (BSP):* Completely randomized procedural split hierarchy.
  * *Center Spotlight:* Large focal frame surrounded by supporting images.
  * *Dual Highlights:* Balanced twin hero frames with peripheral tiles.
  * *Hero Top Banner:* Panoramic header tile over multi-column masonry.
  * *Hero Split:* Symmetrical dual-anchor composition.
* **Instant Re-Roll & Shuffle:** Re-calculate split ratios (`R`) or randomize photo placements (`S`) in milliseconds.

### 🎨 KNN Smart Background Palette & Color Science
* **Pixel Color Extraction:** Samples pixel color distributions across all loaded images using an offscreen canvas buffer.
* **KNN / K-Means Clustering:** Vector-quantizes colors using 1-Nearest Neighbor (1-NN) clustering with K-Means++ initialization to extract dominant photo centroids and arithmetic mean color.
* **Dynamic Variation Suggestions:** Automatically generates harmonized matting backgrounds:
  * **Average Tone:** The exact arithmetic mean color across all photos.
  * **Deep Shade:** Moody, low-lightness ($8\text{--}16\%$) matting for dramatic cinematic collages.
  * **Soft Tint:** Clean, airy pastel gallery matting ($92\text{--}97\%$ lightness) complementing highlights.
  * **Muted Neutral:** Subtle desaturated framing tone for minimal visual distraction.
  * **Vibrant Accent:** Saturated punch highlighting the dominant hue.
  * **Harmonies:** Warm-shifted ($+28^\circ$), Cool-shifted ($-28^\circ$), and Complementary ($180^\circ$) color wheel variations.
  * **Dominant Clusters:** Direct cluster centroid tones representing the largest pixel clusters.
* **Full Customization:** Native HTML5 color picker and hex input for custom palette selection.

### 🖱️ Interactive Canvas Manipulation
* **Drag & Swap:** Drag one cell over another to instantly swap image positions with glowing drop targets.
* **Focal Zoom & Pan:** Select any cell to crop-zoom ($1.0\times$ to $3.0\times$) and pan along X/Y axes without breaking cell boundaries.
* **Border Gap & Corner Radius:** Global sliders for inner spacing ($0\text{--}40\text{px}$) and corner rounding ($0\text{--}30\text{px}$).
* **Aspect Ratio Presets:** 1:1 Square, 4:5 Portrait, 16:9 Landscape, 9:16 Story, 3:2 Classic, 2:3 Portrait, and A4 Poster.

### 🚀 High-Resolution PNG Export Engine
* **OffscreenCanvas Pipeline:** Renders full-resolution images off-thread to avoid DPI degradation and screen scaling artifacts.
* **Multi-Scale Output:** Standard ($1\times$), High-Res ($2\times$), and Ultra-Print ($4\times$ up to 300 DPI / 4K+).
* **Privacy-Preserving:** Strips private EXIF metadata while maintaining sRGB color fidelity.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl` + `Z` / `Cmd` + `Z` | Undo last change |
| `Ctrl` + `Y` / `Cmd` + `Shift` + `Z` | Redo change |
| `R` | Re-roll layout geometry |
| `S` | Shuffle photos across frames |
| `Ctrl` + `E` / `Cmd` + `E` | Open Export dialog |
| `Esc` | Deselect active cell |

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
* **Language:** TypeScript 5
* **UI & Styling:** Vanilla CSS Modules with custom design tokens (Warm amber & dark theme)
* **Archive Parsing:** [JSZip](https://stuk.github.io/jszip/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Rendering Engine:** HTML5 2D Canvas API + OffscreenCanvas

---

## 📁 Project Structure

```text
CollageCreator/
├── src/
│   ├── app/
│   │   ├── globals.css              # Design tokens and theme system
│   │   ├── layout.tsx               # Root application layout
│   │   └── page.tsx                 # Core application controller
│   ├── components/
│   │   ├── CanvasEditor/            # Interactive HTML5 collage canvas
│   │   ├── Dropzone/                # Archive & file ingestion component
│   │   ├── ExportModal/             # High-resolution export dialogue
│   │   ├── Header/                  # Top navigation, counters, and action bar
│   │   ├── Sidebar/                 # Sidebar controls & BackgroundColorSection
│   │   └── Toast/                   # Notification feedback system
│   ├── hooks/
│   │   ├── useCollageHistory.ts     # Undo/Redo state stack management
│   │   └── useColorPalette.ts       # Asynchronous photo palette extraction
│   ├── types/
│   │   └── collage.ts               # Core domain models and interfaces
│   └── utils/
│       ├── archiveExtractor.ts      # ZIP unpacking and file sanitization
│       ├── bspLayoutGenerator.ts    # Binary Space Partitioning algorithm
│       ├── canvasRenderer.ts        # Offscreen and viewport canvas renderer
│       ├── exportEngine.ts          # Multi-scale PNG export pipeline
│       ├── imageLoader.ts           # Preloading and texture management
│       ├── knnColorExtractor.ts     # KNN / K-Means clustering and color math
│       ├── layoutEngine.ts          # Layout dispatcher & shuffle logic
│       ├── sampleImages.ts          # Vector-based demo gallery generator
│       └── templateLayoutGenerator.ts # Curated structural compositions
├── PRD.md                           # Product Requirement Document
├── Note.md                          # Engineering standards & constraints
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.17+ or v20+)
* npm, yarn, or pnpm

### Installation

1. Install project dependencies:
   ```cmd
   npm install
   ```

2. Start the local development server:
   ```cmd
   npm run dev
   ```

3. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

### Building for Production

Compile the optimized static production bundle:
```cmd
npm run build
```

Run the production server:
```cmd
npm run start
```
