/**
 * Download utilities for QR export
 */

import { QRGenerator } from '../qr/generator';

export async function downloadQRCode(
  generator: QRGenerator,
  format: 'png' | 'svg' | 'jpeg',
  resolution: number = 1024,
  customFilename?: string
): Promise<void> {
  const extension = format === 'jpeg' ? 'jpg' : format;
  const baseName = customFilename && customFilename.trim()
    ? customFilename.trim().replace(/[^a-zA-Z0-9_\-\u00C0-\u024F]/g, '_')
    : 'qr-code';
  
  const filename = `${baseName}.${extension}`;

  const blob = await generator.getExportBlob(format, resolution);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 150);
}
