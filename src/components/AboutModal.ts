/**
 * About Modal Component
 */

export class AboutModal {
  private overlay: HTMLElement;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.overlay;
  }

  public open(): void {
    this.overlay.classList.add('active');
  }

  public close(): void {
    this.overlay.classList.remove('active');
  }

  private render(): void {
    this.overlay.innerHTML = `
      <div class="modal-content" style="max-width: 520px;">
        <div class="modal-header">
          <h3>About QR Studio</h3>
          <button type="button" class="modal-close" id="btn-close-about" aria-label="Close modal">✕</button>
        </div>

        <div class="modal-body" style="line-height: 1.6; font-size: 0.9375rem; color: var(--text-secondary);">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 2.5rem; margin-bottom: 6px;">✨</div>
            <h4 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">QR Studio</h4>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">Modern, private & fast QR generator</p>
          </div>

          <p style="margin-bottom: 14px;">
            <strong>QR Studio</strong> is a lightweight, high-performance QR code generator built for everyday people and businesses.
          </p>

          <div style="background: var(--bg-surface-subtle); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 16px;">
            <h5 style="font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">🔒 100% Privacy & Zero Tracking</h5>
            <p style="font-size: 0.8125rem; color: var(--text-muted); margin: 0;">
              Your QR codes are rendered entirely on your computer or mobile phone. Neither your Wi-Fi credentials, personal contact details, or links are ever transmitted to any remote server.
            </p>
          </div>

          <h5 style="font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Key Highlights</h5>
          <ul style="padding-left: 20px; font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 16px;">
            <li><strong>No accounts:</strong> Generate instantly without sign-up or paywalls.</li>
            <li><strong>Vector SVG & High-Res PNG:</strong> Perfect for print, posters, and screens.</li>
            <li><strong>Scanability Guard:</strong> Real-time contrast checks prevent unreadable codes.</li>
            <li><strong>Offline Capable:</strong> Installable PWA works completely without internet.</li>
            <li><strong>Static Host Ready:</strong> Designed to deploy seamlessly on GitHub Pages.</li>
          </ul>

          <div style="border-top: 1px solid var(--border-color); padding-top: 14px; display: flex; justify-content: space-between; align-items: center; font-size: 0.8125rem;">
            <span>Open source under MIT License</span>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style="font-weight: 600;">GitHub Repository ↗</a>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" id="btn-close-about-footer" class="btn btn-primary btn-sm">Got it</button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    this.overlay.querySelector('#btn-close-about')?.addEventListener('click', () => this.close());
    this.overlay.querySelector('#btn-close-about-footer')?.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }
}
