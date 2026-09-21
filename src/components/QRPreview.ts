/**
 * QR Preview Component with prominent display and scanability feedback
 */

import { QRGenerator } from '../qr/generator';
import { ScanabilityCheck } from '../qr/styles';

export class QRPreview {
  private container: HTMLElement;
  private canvasWrapper: HTMLElement;
  private canvasContainer: HTMLElement;
  private statusContainer: HTMLElement;
  private generator: QRGenerator;

  constructor(generator: QRGenerator) {
    this.generator = generator;
    this.container = document.createElement('div');
    this.container.className = 'card preview-card';

    this.canvasWrapper = document.createElement('div');
    this.canvasWrapper.className = 'qr-canvas-wrapper';

    this.canvasContainer = document.createElement('div');
    this.canvasContainer.className = 'qr-canvas-container';
    this.canvasWrapper.appendChild(this.canvasContainer);

    this.statusContainer = document.createElement('div');
    this.statusContainer.className = 'preview-meta';

    this.container.appendChild(this.canvasWrapper);
    this.container.appendChild(this.statusContainer);

    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public getCanvasContainer(): HTMLElement {
    return this.canvasContainer;
  }

  public updateStatus(check: ScanabilityCheck): void {
    let badgeClass = 'badge-success';
    let statusLabel = 'Good Scanability';
    let dotClass = 'status-good';

    if (check.status === 'warning') {
      badgeClass = 'badge-warning';
      statusLabel = 'Scanability Warning';
      dotClass = 'status-warning';
    } else if (check.status === 'error') {
      badgeClass = 'badge-error';
      statusLabel = 'Critical: Poor Contrast';
      dotClass = 'status-error';
    }

    this.statusContainer.innerHTML = `
      <div class="scanability-status">
        <span class="status-indicator ${dotClass}"></span>
        <span class="badge ${badgeClass}">${statusLabel}</span>
      </div>
      <p style="font-size: 0.8125rem; color: var(--text-muted); max-width: 320px; text-align: center; margin-top: 2px;">
        ${check.message}
      </p>
      <div style="display: flex; align-items: center; gap: 6px; font-size: 0.8125rem; color: var(--success); font-weight: 500; margin-top: 6px;">
        <span>✓</span> <span>QR generated 100% locally in browser</span>
      </div>
    `;
  }

  public render(): void {
    this.generator.render(this.canvasContainer);
    this.updateStatus(this.generator.getScanability());
  }
}
