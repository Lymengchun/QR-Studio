/**
 * Clipboard, toast notifications, and Web Share API integration
 */

import { QRGenerator } from '../qr/generator';

let toastContainer: HTMLElement | null = null;

export function showToast(message: string, type: 'success' | 'warning' | 'error' = 'success', durationMs: number = 2500): void {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '✓';
  if (type === 'warning') icon = '⚠';
  if (type === 'error') icon = '✕';

  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    toast.style.transition = 'all 180ms ease-in';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 200);
  }, durationMs);
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied content to clipboard!', 'success');
    return true;
  } catch (err) {
    showToast('Could not copy text to clipboard', 'error');
    return false;
  }
}

export async function copyImageToClipboard(generator: QRGenerator): Promise<boolean> {
  try {
    const blob = await generator.getExportBlob('png', 1024);
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      throw new Error('ClipboardItem not supported');
    }
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob
      })
    ]);
    showToast('Copied QR image to clipboard!', 'success');
    return true;
  } catch (err) {
    showToast('Image copy not supported in this browser. Please use Download.', 'warning');
    return false;
  }
}

export async function shareQRCode(generator: QRGenerator, title: string = 'QR Studio Code', text: string = 'Generated with QR Studio'): Promise<boolean> {
  try {
    if (navigator.share) {
      const blob = await generator.getExportBlob('png', 1024);
      const file = new File([blob], 'qr-code.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text
        });
        showToast('Shared successfully!', 'success');
        return true;
      } else {
        await navigator.share({
          title,
          text: generator.getContent()
        });
        showToast('Shared content link!', 'success');
        return true;
      }
    } else {
      // Fallback: Copy content or image
      await copyImageToClipboard(generator);
      return false;
    }
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      showToast('Sharing failed or was canceled.', 'warning');
    }
    return false;
  }
}
