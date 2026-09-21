/**
 * Download Panel Component for exporting, copying, and sharing QR codes
 */

import { QRGenerator } from '../qr/generator';
import { downloadQRCode } from '../utils/download';
import { copyImageToClipboard, copyTextToClipboard, shareQRCode, showToast } from '../utils/clipboard';

export class DownloadPanel {
  private container: HTMLElement;
  private generator: QRGenerator;
  private selectedResolution: number = 1024;
  private customFilename: string = 'qr-code';

  constructor(generator: QRGenerator) {
    this.generator = generator;
    this.container = document.createElement('div');
    this.container.className = 'card download-card';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setFilename(name: string): void {
    this.customFilename = name;
    const input = this.container.querySelector<HTMLInputElement>('#input-filename');
    if (input) input.value = name;
  }

  private render(): void {
    const hasShareApi = typeof navigator !== 'undefined' && !!navigator.share;

    this.container.innerHTML = `
      <h3 style="font-size: 1.15rem; font-weight: 600; margin-bottom: 12px;">Export & Share</h3>

      <div class="download-options-row">
        <div class="form-group" style="margin-bottom: 0; flex: 1.2;">
          <label for="input-filename" style="margin-bottom: 4px;">File Name</label>
          <input type="text" id="input-filename" class="form-control form-control-sm" placeholder="qr-code" value="${this.customFilename}" />
        </div>

        <div class="form-group" style="margin-bottom: 0; flex: 1;">
          <label for="select-resolution" style="margin-bottom: 4px;">Resolution</label>
          <select id="select-resolution" class="form-control form-control-sm">
            <option value="512">512 × 512</option>
            <option value="1024" selected>1024 × 1024 (HD)</option>
            <option value="2048">2048 × 2048 (Print)</option>
          </select>
        </div>
      </div>

      <!-- Main Download Buttons -->
      <div class="download-grid">
        <button type="button" id="btn-dl-png" class="btn btn-primary" title="Export high-resolution PNG format">
          <span>📥 Download PNG</span>
        </button>
        <button type="button" id="btn-dl-svg" class="btn btn-secondary" title="Export scalable vector SVG format">
          <span>📐 Download SVG</span>
        </button>
        <button type="button" id="btn-dl-jpg" class="btn btn-secondary" title="Export JPG format">
          <span>🖼️ Download JPG</span>
        </button>
        <button type="button" id="btn-copy-img" class="btn btn-secondary" title="Copy QR image to clipboard">
          <span>📋 Copy Image</span>
        </button>
      </div>

      <!-- Secondary Utility Buttons -->
      <div style="display: flex; gap: 10px; margin-top: 12px; width: 100%;">
        <button type="button" id="btn-copy-text" class="btn btn-outline btn-sm" style="flex: 1;" title="Copy payload text/URL">
          <span>📄 Copy Payload</span>
        </button>
        ${hasShareApi ? `
          <button type="button" id="btn-share" class="btn btn-outline btn-sm" style="flex: 1;" title="Share via device share menu">
            <span>🔗 Share</span>
          </button>
        ` : ''}
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const filenameInput = this.container.querySelector<HTMLInputElement>('#input-filename');
    filenameInput?.addEventListener('input', () => {
      this.customFilename = filenameInput.value;
    });

    const resSelect = this.container.querySelector<HTMLSelectElement>('#select-resolution');
    resSelect?.addEventListener('change', () => {
      this.selectedResolution = parseInt(resSelect.value, 10);
    });

    // PNG Download
    const pngBtn = this.container.querySelector('#btn-dl-png');
    pngBtn?.addEventListener('click', async () => {
      try {
        await downloadQRCode(this.generator, 'png', this.selectedResolution, this.customFilename);
        showToast('PNG downloaded!', 'success');
      } catch (e) {
        showToast('Download error', 'error');
      }
    });

    // SVG Download
    const svgBtn = this.container.querySelector('#btn-dl-svg');
    svgBtn?.addEventListener('click', async () => {
      try {
        await downloadQRCode(this.generator, 'svg', this.selectedResolution, this.customFilename);
        showToast('SVG vector downloaded!', 'success');
      } catch (e) {
        showToast('Download error', 'error');
      }
    });

    // JPG Download
    const jpgBtn = this.container.querySelector('#btn-dl-jpg');
    jpgBtn?.addEventListener('click', async () => {
      try {
        await downloadQRCode(this.generator, 'jpeg', this.selectedResolution, this.customFilename);
        showToast('JPG image downloaded!', 'success');
      } catch (e) {
        showToast('Download error', 'error');
      }
    });

    // Copy Image
    const copyImgBtn = this.container.querySelector('#btn-copy-img');
    copyImgBtn?.addEventListener('click', async () => {
      await copyImageToClipboard(this.generator);
    });

    // Copy Text
    const copyTextBtn = this.container.querySelector('#btn-copy-text');
    copyTextBtn?.addEventListener('click', async () => {
      await copyTextToClipboard(this.generator.getContent());
    });

    // Share
    const shareBtn = this.container.querySelector('#btn-share');
    shareBtn?.addEventListener('click', async () => {
      await shareQRCode(this.generator, 'My QR Code', 'Scan this QR code generated with QR Studio');
    });
  }
}
