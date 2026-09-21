/**
 * Logo Uploader Component with preset icons, custom image upload, and size safety guards
 */

import { QRStyleConfig } from '../qr/styles';
import { showToast } from '../utils/clipboard';

export interface LogoPreset {
  id: string;
  name: string;
  iconSvgPath: string;
}

const PRESET_LOGOS: LogoPreset[] = [
  { id: 'link', name: 'Link', iconSvgPath: './icons/link.svg' },
  { id: 'wifi', name: 'Wi-Fi', iconSvgPath: './icons/wifi.svg' },
  { id: 'phone', name: 'Phone', iconSvgPath: './icons/phone.svg' },
  { id: 'mail', name: 'Mail', iconSvgPath: './icons/mail.svg' },
  { id: 'whatsapp', name: 'WhatsApp', iconSvgPath: './icons/whatsapp.svg' },
  { id: 'map', name: 'Map', iconSvgPath: './icons/map.svg' },
  { id: 'star', name: 'Star', iconSvgPath: './icons/star.svg' },
  { id: 'heart', name: 'Heart', iconSvgPath: './icons/heart.svg' },
  { id: 'bitcoin', name: 'Bitcoin', iconSvgPath: './icons/bitcoin.svg' }
];

export class LogoUploader {
  private container: HTMLElement;
  private config: QRStyleConfig;
  private onChange: (config: Partial<QRStyleConfig>) => void;
  private selectedPresetId: string | null = null;

  constructor(initialConfig: QRStyleConfig, onChange: (config: Partial<QRStyleConfig>) => void) {
    this.config = { ...initialConfig };
    this.onChange = onChange;
    this.container = document.createElement('div');
    this.container.className = 'card logo-card';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setConfig(newConfig: Partial<QRStyleConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (!this.config.logoImage) {
      this.selectedPresetId = null;
    }
    this.render();
  }

  private render(): void {
    const hasLogo = !!this.config.logoImage;
    const isLogoTooLarge = this.config.logoSize > 0.32;

    this.container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 600;">Center Logo</h3>
          <p class="hint">Embed an icon or your company brand inside the QR center</p>
        </div>
        ${hasLogo ? `
          <button type="button" id="btn-remove-logo" class="btn btn-danger btn-sm">
            ✕ Remove Logo
          </button>
        ` : ''}
      </div>

      <!-- Quick Preset Icons -->
      <div class="form-group" style="margin-bottom: 16px;">
        <label>Quick Preset Logos</label>
        <div class="preset-grid" style="grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));">
          <button type="button" class="preset-chip ${!hasLogo ? 'active' : ''}" id="btn-preset-none">
            None
          </button>
          ${PRESET_LOGOS.map(preset => `
            <button type="button" class="preset-chip ${this.selectedPresetId === preset.id ? 'active' : ''}" data-logo-preset="${preset.id}">
              <img src="${preset.iconSvgPath}" alt="${preset.name}" style="width: 18px; height: 18px; vertical-align: middle;" />
              <span>${preset.name}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- File Upload Zone -->
      <div class="form-group">
        <label for="logo-file-input">Or Upload Custom Image (PNG, JPG, SVG)</label>
        <div id="drop-zone" style="border: 2px dashed var(--border-color); border-radius: var(--radius-md); padding: 18px; text-align: center; cursor: pointer; transition: all var(--transition-fast); background: var(--bg-surface-subtle);">
          <div style="font-size: 1.4rem; margin-bottom: 4px;">📁</div>
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--text-secondary);">Click to browse or drag & drop image</p>
          <span class="hint">Recommended: square image, max 2MB</span>
          <input type="file" id="logo-file-input" accept="image/png,image/jpeg,image/webp,image/svg+xml" style="display: none;" />
        </div>
      </div>

      <!-- Logo Controls (Shown when logo is present) -->
      ${hasLogo ? `
        <div style="margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border-color);">
          <div class="form-row">
            <div class="form-group">
              <label for="range-logo-size">Logo Scale: <span id="val-logo-size">${Math.round(this.config.logoSize * 100)}%</span></label>
              <div class="range-slider">
                <input type="range" id="range-logo-size" min="0.15" max="0.38" step="0.01" value="${this.config.logoSize}" />
              </div>
            </div>

            <div class="form-group">
              <label for="range-logo-margin">Padding Margin: <span id="val-logo-margin">${this.config.logoMargin}px</span></label>
              <div class="range-slider">
                <input type="range" id="range-logo-margin" min="0" max="16" step="1" value="${this.config.logoMargin}" />
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-top: 4px;">
            <label class="checkbox-label">
              <input type="checkbox" id="check-hide-dots" ${this.config.hideBackgroundDots ? 'checked' : ''} />
              Clear QR dots underneath logo (Clean cutout)
            </label>
          </div>

          ${isLogoTooLarge ? `
            <div class="badge badge-warning" style="margin-top: 8px; width: 100%; justify-content: flex-start; padding: 8px 12px;">
              ⚠️ Warning: Large logos may reduce scan reliability. Keep scale under 32%.
            </div>
          ` : ''}
        </div>
      ` : ''}
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // None Preset
    const noneBtn = this.container.querySelector('#btn-preset-none');
    noneBtn?.addEventListener('click', () => {
      this.selectedPresetId = null;
      this.config.logoImage = undefined;
      this.onChange({ logoImage: undefined });
      this.render();
    });

    // Remove Logo Button
    const removeBtn = this.container.querySelector('#btn-remove-logo');
    removeBtn?.addEventListener('click', () => {
      this.selectedPresetId = null;
      this.config.logoImage = undefined;
      this.onChange({ logoImage: undefined });
      this.render();
      showToast('Logo removed', 'success');
    });

    // Preset Clicks
    const presetButtons = this.container.querySelectorAll<HTMLButtonElement>('[data-logo-preset]');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.logoPreset;
        const preset = PRESET_LOGOS.find(p => p.id === id);
        if (preset) {
          this.selectedPresetId = preset.id;
          this.config.logoImage = preset.iconSvgPath;
          this.onChange({
            logoImage: preset.iconSvgPath,
            errorCorrectionLevel: 'H' // Elevate EC
          });
          this.render();
          showToast(`Applied ${preset.name} logo (EC set to High)`, 'success');
        }
      });
    });

    // File Upload / Dropzone
    const dropZone = this.container.querySelector<HTMLElement>('#drop-zone');
    const fileInput = this.container.querySelector<HTMLInputElement>('#logo-file-input');

    dropZone?.addEventListener('click', () => fileInput?.click());

    dropZone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--primary)';
      dropZone.style.backgroundColor = 'var(--primary-subtle)';
    });

    dropZone?.addEventListener('dragleave', () => {
      dropZone.style.borderColor = 'var(--border-color)';
      dropZone.style.backgroundColor = 'var(--bg-surface-subtle)';
    });

    dropZone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--border-color)';
      dropZone.style.backgroundColor = 'var(--bg-surface-subtle)';
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        this.handleFileUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput?.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        this.handleFileUpload(fileInput.files[0]);
      }
    });

    // Size Slider
    const rangeSize = this.container.querySelector<HTMLInputElement>('#range-logo-size');
    const valSize = this.container.querySelector('#val-logo-size');
    rangeSize?.addEventListener('input', () => {
      const size = parseFloat(rangeSize.value);
      if (valSize) valSize.textContent = `${Math.round(size * 100)}%`;
      this.config.logoSize = size;
      this.onChange({ logoSize: size });
    });

    // Margin Slider
    const rangeMargin = this.container.querySelector<HTMLInputElement>('#range-logo-margin');
    const valMargin = this.container.querySelector('#val-logo-margin');
    rangeMargin?.addEventListener('input', () => {
      const margin = parseInt(rangeMargin.value, 10);
      if (valMargin) valMargin.textContent = `${margin}px`;
      this.config.logoMargin = margin;
      this.onChange({ logoMargin: margin });
    });

    // Hide Background Dots
    const checkHideDots = this.container.querySelector<HTMLInputElement>('#check-hide-dots');
    checkHideDots?.addEventListener('change', () => {
      const checked = checkHideDots.checked;
      this.config.hideBackgroundDots = checked;
      this.onChange({ hideBackgroundDots: checked });
    });
  }

  private handleFileUpload(file: File): void {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, or SVG)', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image file size exceeds 2MB limit', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        this.selectedPresetId = null;
        this.config.logoImage = result;
        this.onChange({
          logoImage: result,
          errorCorrectionLevel: 'H'
        });
        this.render();
        showToast('Custom logo loaded! Error correction set to High.', 'success');
      }
    };
    reader.onerror = () => {
      showToast('Failed to read image file', 'error');
    };
    reader.readAsDataURL(file);
  }
}
