/**
 * Core QR Engine wrapper around qr-code-styling
 */

import QRCodeStyling, { Options } from 'qr-code-styling';
import { QRStyleConfig, evaluateScanability, ScanabilityCheck } from './styles';

export class QRGenerator {
  private qrInstance: QRCodeStyling;
  private currentContent: string = 'https://example.com';
  private currentConfig: QRStyleConfig;

  constructor(initialConfig: QRStyleConfig, initialContent: string = 'https://example.com') {
    this.currentConfig = { ...initialConfig };
    this.currentContent = initialContent;
    this.qrInstance = new QRCodeStyling(this.buildOptions(300, 300));
  }

  private buildOptions(width: number, height: number): Options {
    const config = this.currentConfig;
    // Automatically elevate error correction to 'H' when a logo is used
    const effectiveECLevel = config.logoImage ? 'H' : config.errorCorrectionLevel;

    const options: Options = {
      width,
      height,
      data: this.currentContent || ' ',
      margin: config.margin,
      qrOptions: {
        errorCorrectionLevel: effectiveECLevel
      },
      image: config.logoImage,
      imageOptions: {
        hideBackgroundDots: config.hideBackgroundDots,
        imageSize: config.logoSize,
        margin: config.logoMargin,
        crossOrigin: 'anonymous'
      },
      backgroundOptions: {
        color: config.backgroundColor
      },
      dotsOptions: {
        type: config.mode === 'classic' ? 'square' : config.dotStyle,
        color: config.useGradient ? undefined : config.foregroundColor,
        gradient: config.useGradient && config.mode === 'styled' ? {
          type: 'linear',
          rotation: (config.gradientAngle * Math.PI) / 180,
          colorStops: [
            { offset: 0, color: config.foregroundColor },
            { offset: 1, color: config.gradientColor2 }
          ]
        } : undefined
      },
      cornersSquareOptions: {
        type: config.mode === 'classic' ? 'square' : config.cornerSquareStyle,
        color: config.foregroundColor
      },
      cornersDotOptions: {
        type: config.mode === 'classic' ? 'square' : config.cornerDotStyle,
        color: config.foregroundColor
      }
    };

    return options;
  }

  public render(container: HTMLElement): void {
    container.innerHTML = '';
    this.qrInstance.append(container);
  }

  public update(content?: string, config?: Partial<QRStyleConfig>): ScanabilityCheck {
    if (content !== undefined) {
      this.currentContent = content;
    }
    if (config) {
      this.currentConfig = { ...this.currentConfig, ...config };
    }

    const opts = this.buildOptions(300, 300);
    this.qrInstance.update(opts);

    return this.getScanability();
  }

  public getScanability(): ScanabilityCheck {
    return evaluateScanability(this.currentConfig, this.currentContent.length);
  }

  public getConfig(): QRStyleConfig {
    return { ...this.currentConfig };
  }

  public getContent(): string {
    return this.currentContent;
  }

  /**
   * Export QR Code as Blob at specific pixel resolution
   */
  public async getExportBlob(format: 'png' | 'svg' | 'jpeg', resolution: number = 1024): Promise<Blob> {
    if (format === 'svg') {
      const svgQr = new QRCodeStyling({
        ...this.buildOptions(resolution, resolution),
        type: 'svg'
      });
      const blob = await svgQr.getRawData('svg');
      if (!blob) throw new Error('Failed to generate SVG blob');
      return blob as Blob;
    }

    const rasterQr = new QRCodeStyling({
      ...this.buildOptions(resolution, resolution),
      type: 'canvas'
    });
    const blob = await rasterQr.getRawData(format);
    if (!blob) throw new Error(`Failed to generate ${format} blob`);
    return blob as Blob;
  }

  /**
   * Get image data URL for copying or quick download
   */
  public async getDataUrl(format: 'png' | 'jpeg', resolution: number = 1024): Promise<string> {
    const blob = await this.getExportBlob(format, resolution);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
