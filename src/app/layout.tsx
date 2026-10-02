import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CollageForge — Automated Random Collage Creator',
  description:
    'Procedural algorithmic photo montage creator. Drop a .zip archive of photos to instantly pack them into irregular, non-standard BSP grids, customize gaps and crops, and export high-resolution PNGs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
