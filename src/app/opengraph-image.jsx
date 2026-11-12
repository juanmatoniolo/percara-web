// src/app/opengraph-image.jsx
import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(<div style={{ display: 'flex', fontSize: 64 }}>Percara</div>, size);
}

/* RESUMEN
   Stub inicial. Se implementa en su fase.
   Depende de: (pendiente) */
