/**
 * App orchestration and main entry layout
 */

import { QRGenerator } from './qr/generator';
import { DEFAULT_STYLE_CONFIG, QRStyleConfig } from './qr/styles';
import { Header } from './components/Header';
import { QRTypeSelector } from './components/QRTypeSelector';
import { QRForm, FormChangePayload } from './components/QRForm';
import { QRPreview } from './components/QRPreview';
import { StylePanel } from './components/StylePanel';
import { LogoUploader } from './components/LogoUploader';
import { DownloadPanel } from './components/DownloadPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { TemplatesModal, TemplateItem } from './components/TemplatesModal';
import { AboutModal } from './components/AboutModal';
import { saveHistoryItem, HistoryItem } from './utils/storage';

export class App {
  private root: HTMLElement;
  private generator: QRGenerator;
  private header!: Header;
  private typeSelector!: QRTypeSelector;
  private form!: QRForm;
  private preview!: QRPreview;
  private stylePanel!: StylePanel;
  private logoUploader!: LogoUploader;
  private downloadPanel!: DownloadPanel;
  private historyPanel!: HistoryPanel;
  private templatesModal!: TemplatesModal;
  private aboutModal!: AboutModal;

  private historyDebounceTimer: any = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.generator = new QRGenerator(DEFAULT_STYLE_CONFIG, 'https://example.com');
    this.initComponents();
    this.render();
    this.registerServiceWorker();
  }

  private initComponents(): void {
    // Header
    this.header = new Header({
      onNavClick: (tab) => this.handleNavClick(tab)
    });

    // QR Type Selector
    this.typeSelector = new QRTypeSelector('url', (type) => {
      this.form.setType(type);
    });

    // QR Form
    this.form = new QRForm('url', (payload) => {
      this.handleFormChange(payload);
    });

    // Preview
    this.preview = new QRPreview(this.generator);

    // Style Panel
    this.stylePanel = new StylePanel(DEFAULT_STYLE_CONFIG, (partialConfig) => {
      this.handleStyleChange(partialConfig);
    });

    // Logo Uploader
    this.logoUploader = new LogoUploader(DEFAULT_STYLE_CONFIG, (partialConfig) => {
      this.handleLogoChange(partialConfig);
    });

    // Download Panel
    this.downloadPanel = new DownloadPanel(this.generator);

    // History Panel
    this.historyPanel = new HistoryPanel({
      onRegenerate: (item) => this.loadFromHistory(item),
      onClose: () => this.header.setActiveNav('generator')
    });

    // Templates Modal
    this.templatesModal = new TemplatesModal((template) => {
      this.loadTemplate(template);
      this.header.setActiveNav('generator');
    });

    // About Modal
    this.aboutModal = new AboutModal();
  }

  private handleNavClick(tab: 'generator' | 'templates' | 'history' | 'about'): void {
    if (tab === 'generator') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'templates') {
      this.templatesModal.open();
    } else if (tab === 'history') {
      this.historyPanel.open();
    } else if (tab === 'about') {
      this.aboutModal.open();
    }
  }

  private handleFormChange(payload: FormChangePayload): void {
    const check = this.generator.update(payload.payload);
    this.preview.updateStatus(check);

    // Suggest clean file name for download
    const cleanTitle = payload.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 24);
    this.downloadPanel.setFilename(`qr-${cleanTitle || 'code'}`);

    // Debounced history save
    if (payload.isValid && payload.payload.trim().length > 0) {
      if (this.historyDebounceTimer) clearTimeout(this.historyDebounceTimer);
      this.historyDebounceTimer = setTimeout(() => {
        saveHistoryItem({
          type: payload.type,
          title: payload.title,
          snippet: payload.snippet,
          payload: payload.payload,
          formData: payload.formData
        });
      }, 1500);
    }
  }

  private handleStyleChange(config: Partial<QRStyleConfig>): void {
    const check = this.generator.update(undefined, config);
    this.preview.updateStatus(check);
  }

  private handleLogoChange(config: Partial<QRStyleConfig>): void {
    const check = this.generator.update(undefined, config);
    this.preview.updateStatus(check);
    // Sync error correction level if elevated
    if (config.errorCorrectionLevel) {
      this.stylePanel.setConfig({ errorCorrectionLevel: config.errorCorrectionLevel });
    }
  }

  private loadTemplate(tpl: TemplateItem): void {
    this.typeSelector.setSelected(tpl.type);
    this.form.setType(tpl.type, tpl.formData);
  }

  private loadFromHistory(item: HistoryItem): void {
    this.typeSelector.setSelected(item.type);
    this.form.setType(item.type, item.formData);
  }

  private render(): void {
    this.root.innerHTML = '';

    // Append Header
    this.root.appendChild(this.header.getElement());

    // Main App Container
    const mainContainer = document.createElement('div');
    mainContainer.className = 'app-container';

    // Hero / Intro
    const hero = document.createElement('div');
    hero.className = 'hero-section';
    hero.innerHTML = `
      <h1 class="hero-title">Create a QR Code in Seconds</h1>
      <p class="hero-subtitle">
        Free • 100% Private • No Signup • Works Offline
      </p>
      <div style="margin-top: 14px; display: flex; justify-content: center; gap: 10px;">
        <button type="button" id="btn-hero-templates" class="btn btn-outline btn-sm">
          ⚡ Explore Quick Templates
        </button>
      </div>
    `;
    hero.querySelector('#btn-hero-templates')?.addEventListener('click', () => {
      this.templatesModal.open();
    });
    mainContainer.appendChild(hero);

    // Main Grid Layout
    const mainGrid = document.createElement('div');
    mainGrid.className = 'main-grid';

    // Left Column
    const leftPanel = document.createElement('div');
    leftPanel.className = 'left-panel';

    const typeCard = document.createElement('div');
    typeCard.className = 'card';
    typeCard.innerHTML = `<h3 style="font-size: 1.15rem; font-weight: 600; margin-bottom: 14px;">Choose QR Type</h3>`;
    typeCard.appendChild(this.typeSelector.getElement());
    leftPanel.appendChild(typeCard);

    leftPanel.appendChild(this.form.getElement());
    leftPanel.appendChild(this.stylePanel.getElement());
    leftPanel.appendChild(this.logoUploader.getElement());

    // Right Column (Sticky Preview & Actions)
    const rightPanel = document.createElement('div');
    rightPanel.className = 'right-panel';
    rightPanel.appendChild(this.preview.getElement());
    rightPanel.appendChild(this.downloadPanel.getElement());

    // Privacy Banner under preview
    const privacyNotice = document.createElement('div');
    privacyNotice.className = 'privacy-banner';
    privacyNotice.innerHTML = `
      <div class="privacy-banner-icon">🛡️</div>
      <div>
        <strong>Privacy Protected</strong>
        <p style="font-size: 0.75rem; margin: 0; opacity: 0.85;">
          All QR computation happens in your local browser engine. No credentials or URLs are ever uploaded.
        </p>
      </div>
    `;
    rightPanel.appendChild(privacyNotice);

    mainGrid.appendChild(leftPanel);
    mainGrid.appendChild(rightPanel);
    mainContainer.appendChild(mainGrid);

    // Feature Showcase Section
    const features = document.createElement('section');
    features.className = 'features-grid';
    features.innerHTML = `
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <div class="feature-content">
          <h4>Fast & Instant</h4>
          <p>Generates high-speed QR codes in real-time as you type, with zero latency.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔒</div>
        <div class="feature-content">
          <h4>100% Private</h4>
          <p>Your inputs never leave your device. Fully client-side with no tracking cookies.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎨</div>
        <div class="feature-content">
          <h4>Customizable</h4>
          <p>Pick custom shapes, vibrant color gradients, and company center logos.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📱</div>
        <div class="feature-content">
          <h4>Mobile Friendly</h4>
          <p>Optimized for touchscreens, tablets, and desktops with an installable PWA mode.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">💾</div>
        <div class="feature-content">
          <h4>High-Res Export</h4>
          <p>Export in vector SVG for large scale printing, or 2048px ultra HD PNG.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🆓</div>
        <div class="feature-content">
          <h4>Completely Free</h4>
          <p>No paywalls, no subscription traps, and no expiration dates on generated codes.</p>
        </div>
      </div>
    `;
    mainContainer.appendChild(features);

    this.root.appendChild(mainContainer);

    // Footer
    const footer = document.createElement('footer');
    footer.className = 'app-footer';
    const currentYear = new Date().getFullYear();
    footer.innerHTML = `
      <div class="footer-inner">
        <div>
          <span style="font-weight: 700; color: var(--text-primary);">QR Studio</span>
          <span style="color: var(--text-muted);"> — Free, privacy-first QR Code Generator</span>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
            © ${currentYear} QR Studio • Open source & Made for the web
          </div>
        </div>
        <div class="footer-links">
          <a href="#generator" id="footer-link-gen">Generator</a>
          <a href="#templates" id="footer-link-tpl">Templates</a>
          <a href="#history" id="footer-link-hist">History</a>
          <a href="#about" id="footer-link-about">About</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        </div>
      </div>
    `;

    footer.querySelector('#footer-link-gen')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    footer.querySelector('#footer-link-tpl')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.templatesModal.open();
    });
    footer.querySelector('#footer-link-hist')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.historyPanel.open();
    });
    footer.querySelector('#footer-link-about')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.aboutModal.open();
    });

    this.root.appendChild(footer);

    // Append Modals to document body
    document.body.appendChild(this.historyPanel.getElement());
    document.body.appendChild(this.templatesModal.getElement());
    document.body.appendChild(this.aboutModal.getElement());
  }

  private registerServiceWorker(): void {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {
          // SW registration silent fallback
        });
      });
    }
  }
}
