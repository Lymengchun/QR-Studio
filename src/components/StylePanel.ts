/**
 * Style Panel Component for Classic & Styled QR Modes and Presets
 */

import {
  QRStyleConfig,
  DEFAULT_STYLE_CONFIG,
  STYLE_PRESETS,
  DotType,
  CornerSquareType,
  ErrorCorrectionLevel
} from '../qr/styles';

export class StylePanel {
  private container: HTMLElement;
  private config: QRStyleConfig;
  private onChange: (config: Partial<QRStyleConfig>) => void;
  private activePresetId: string = 'classic';

  constructor(initialConfig: QRStyleConfig = DEFAULT_STYLE_CONFIG, onChange: (config: Partial<QRStyleConfig>) => void) {
    this.config = { ...initialConfig };
    this.onChange = onChange;
    this.container = document.createElement('div');
    this.container.className = 'card style-card';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setConfig(newConfig: Partial<QRStyleConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.render();
  }

  private update(partial: Partial<QRStyleConfig>): void {
    this.config = { ...this.config, ...partial };
    this.onChange(partial);
  }

  private render(): void {
    const isClassic = this.config.mode === 'classic';

    this.container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 1.15rem; font-weight: 600;">Customization</h3>
        <div class="segmented-control" style="width: 170px;">
          <button type="button" class="segmented-item ${isClassic ? 'active' : ''}" id="mode-classic">Classic</button>
          <button type="button" class="segmented-item ${!isClassic ? 'active' : ''}" id="mode-styled">Styled</button>
        </div>
      </div>

      <!-- Presets Selector -->
      <div class="form-group" style="margin-bottom: 20px;">
        <label>Quick Style Presets</label>
        <div class="preset-grid">
          ${STYLE_PRESETS.map(preset => `
            <button type="button" class="preset-chip ${this.activePresetId === preset.id ? 'active' : ''}" data-preset="${preset.id}" title="${preset.description}">
              ${preset.name}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Colors Section -->
      <div class="form-row" style="margin-bottom: 16px;">
        <div class="form-group">
          <label for="color-fg">QR Color (Foreground)</label>
          <div class="color-picker-row">
            <div class="color-input-wrapper">
              <input type="color" id="color-fg" value="${this.config.foregroundColor}" />
            </div>
            <input type="text" id="color-fg-text" class="form-control" value="${this.config.foregroundColor}" maxlength="7" style="font-family: var(--font-mono); text-transform: uppercase;" />
          </div>
        </div>

        <div class="form-group">
          <label for="color-bg">Background Color</label>
          <div class="color-picker-row">
            <div class="color-input-wrapper">
              <input type="color" id="color-bg" value="${this.config.backgroundColor}" />
            </div>
            <input type="text" id="color-bg-text" class="form-control" value="${this.config.backgroundColor}" maxlength="7" style="font-family: var(--font-mono); text-transform: uppercase;" />
          </div>
        </div>
      </div>

      <!-- Gradient Options (Styled Mode Only) -->
      <div id="gradient-section" style="${isClassic ? 'display: none;' : 'display: block;'} margin-bottom: 16px; padding: 14px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <label class="checkbox-label" style="font-weight: 600; color: var(--text-primary);">
            <input type="checkbox" id="check-gradient" ${this.config.useGradient ? 'checked' : ''} />
            Enable Gradient
          </label>
        </div>

        <div id="gradient-controls" style="${this.config.useGradient ? 'display: block;' : 'display: none;'}">
          <div class="form-row">
            <div class="form-group">
              <label for="color-grad-2">Gradient Color 2</label>
              <div class="color-picker-row">
                <div class="color-input-wrapper">
                  <input type="color" id="color-grad-2" value="${this.config.gradientColor2}" />
                </div>
                <input type="text" id="color-grad-2-text" class="form-control" value="${this.config.gradientColor2}" maxlength="7" style="font-family: var(--font-mono); text-transform: uppercase;" />
              </div>
            </div>
            <div class="form-group">
              <label for="range-grad-angle">Gradient Angle: <span id="val-grad-angle">${this.config.gradientAngle}°</span></label>
              <div class="range-slider">
                <input type="range" id="range-grad-angle" min="0" max="360" step="5" value="${this.config.gradientAngle}" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Styled Shapes (Styled Mode Only) -->
      <div id="shapes-section" style="${isClassic ? 'display: none;' : 'display: block;'}">
        <div class="form-row" style="margin-bottom: 16px;">
          <div class="form-group">
            <label for="select-dots">Pattern Style (Dots)</label>
            <select id="select-dots" class="form-control">
              <option value="square" ${this.config.dotStyle === 'square' ? 'selected' : ''}>Standard Square</option>
              <option value="rounded" ${this.config.dotStyle === 'rounded' ? 'selected' : ''}>Rounded</option>
              <option value="dots" ${this.config.dotStyle === 'dots' ? 'selected' : ''}>Dots (Circular)</option>
              <option value="classy" ${this.config.dotStyle === 'classy' ? 'selected' : ''}>Classy</option>
              <option value="extra-rounded" ${this.config.dotStyle === 'extra-rounded' ? 'selected' : ''}>Extra Rounded</option>
            </select>
          </div>

          <div class="form-group">
            <label for="select-corners">Corner Eyes Style</label>
            <select id="select-corners" class="form-control">
              <option value="square" ${this.config.cornerSquareStyle === 'square' ? 'selected' : ''}>Square Corners</option>
              <option value="extra-rounded" ${this.config.cornerSquareStyle === 'extra-rounded' ? 'selected' : ''}>Rounded Corners</option>
              <option value="dot" ${this.config.cornerSquareStyle === 'dot' ? 'selected' : ''}>Circular Corners</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Quiet Zone & Error Correction -->
      <div class="form-row">
        <div class="form-group">
          <label for="range-margin">Quiet Zone (Margin): <span id="val-margin">${this.config.margin}px</span></label>
          <div class="range-slider">
            <input type="range" id="range-margin" min="4" max="36" step="2" value="${this.config.margin}" />
          </div>
          <span class="hint">Ensures white border around QR for camera detection</span>
        </div>

        <div class="form-group">
          <label for="select-ec">Error Correction</label>
          <select id="select-ec" class="form-control">
            <option value="L" ${this.config.errorCorrectionLevel === 'L' ? 'selected' : ''}>Low (~7% recovery)</option>
            <option value="M" ${this.config.errorCorrectionLevel === 'M' ? 'selected' : ''}>Medium (~15% recovery) - Standard</option>
            <option value="Q" ${this.config.errorCorrectionLevel === 'Q' ? 'selected' : ''}>Quartile (~25% recovery)</option>
            <option value="H" ${this.config.errorCorrectionLevel === 'H' ? 'selected' : ''}>High (~30% recovery) - Recommended</option>
          </select>
          <span class="hint">Higher recovery handles stains, folds, or logos</span>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // Mode toggles
    const modeClassic = this.container.querySelector('#mode-classic');
    const modeStyled = this.container.querySelector('#mode-styled');

    modeClassic?.addEventListener('click', () => {
      this.activePresetId = 'classic';
      this.update({
        mode: 'classic',
        dotStyle: 'square',
        cornerSquareStyle: 'square',
        cornerDotStyle: 'square',
        useGradient: false
      });
      this.render();
    });

    modeStyled?.addEventListener('click', () => {
      this.update({ mode: 'styled' });
      this.render();
    });

    // Presets
    const presetButtons = this.container.querySelectorAll<HTMLButtonElement>('.preset-chip');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.preset;
        const preset = STYLE_PRESETS.find(p => p.id === id);
        if (preset) {
          this.activePresetId = preset.id;
          this.update(preset.config);
          this.render();
        }
      });
    });

    // Color Pickers
    const bindColor = (pickerId: string, textId: string, key: 'foregroundColor' | 'backgroundColor' | 'gradientColor2') => {
      const picker = this.container.querySelector<HTMLInputElement>(`#${pickerId}`);
      const text = this.container.querySelector<HTMLInputElement>(`#${textId}`);
      if (!picker || !text) return;

      picker.addEventListener('input', () => {
        text.value = picker.value;
        this.update({ [key]: picker.value });
      });

      text.addEventListener('input', () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(text.value)) {
          picker.value = text.value;
          this.update({ [key]: text.value });
        }
      });
    };

    bindColor('color-fg', 'color-fg-text', 'foregroundColor');
    bindColor('color-bg', 'color-bg-text', 'backgroundColor');
    bindColor('color-grad-2', 'color-grad-2-text', 'gradientColor2');

    // Gradient Toggle & Controls
    const checkGrad = this.container.querySelector<HTMLInputElement>('#check-gradient');
    const gradControls = this.container.querySelector<HTMLElement>('#gradient-controls');
    checkGrad?.addEventListener('change', () => {
      const checked = checkGrad.checked;
      if (gradControls) gradControls.style.display = checked ? 'block' : 'none';
      this.update({ useGradient: checked });
    });

    const rangeAngle = this.container.querySelector<HTMLInputElement>('#range-grad-angle');
    const valAngle = this.container.querySelector('#val-grad-angle');
    rangeAngle?.addEventListener('input', () => {
      const deg = parseInt(rangeAngle.value, 10);
      if (valAngle) valAngle.textContent = `${deg}°`;
      this.update({ gradientAngle: deg });
    });

    // Shapes
    const selectDots = this.container.querySelector<HTMLSelectElement>('#select-dots');
    selectDots?.addEventListener('change', () => {
      this.update({ dotStyle: selectDots.value as DotType });
    });

    const selectCorners = this.container.querySelector<HTMLSelectElement>('#select-corners');
    selectCorners?.addEventListener('change', () => {
      const val = selectCorners.value as CornerSquareType;
      this.update({
        cornerSquareStyle: val,
        cornerDotStyle: val === 'dot' ? 'dot' : (val === 'extra-rounded' ? 'dot' : 'square')
      });
    });

    // Margin & Error Correction
    const rangeMargin = this.container.querySelector<HTMLInputElement>('#range-margin');
    const valMargin = this.container.querySelector('#val-margin');
    rangeMargin?.addEventListener('input', () => {
      const margin = parseInt(rangeMargin.value, 10);
      if (valMargin) valMargin.textContent = `${margin}px`;
      this.update({ margin });
    });

    const selectEC = this.container.querySelector<HTMLSelectElement>('#select-ec');
    selectEC?.addEventListener('change', () => {
      this.update({ errorCorrectionLevel: selectEC.value as ErrorCorrectionLevel });
    });
  }
}
