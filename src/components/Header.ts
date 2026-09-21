/**
 * Header Component with branding, navigation, and theme switcher
 */

import { ThemeMode, getStoredTheme, setStoredTheme } from '../utils/storage';

export interface HeaderCallbacks {
  onNavClick: (tab: 'generator' | 'templates' | 'history' | 'about') => void;
}

export class Header {
  private container: HTMLElement;
  private callbacks: HeaderCallbacks;
  private currentTheme: ThemeMode;

  constructor(callbacks: HeaderCallbacks) {
    this.callbacks = callbacks;
    this.currentTheme = getStoredTheme();
    this.container = document.createElement('header');
    this.container.className = 'app-header';
    this.applyTheme(this.currentTheme, false);
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  private applyTheme(theme: ThemeMode, persist: boolean = true): void {
    this.currentTheme = theme;
    if (persist) {
      setStoredTheme(theme);
    }

    let isDark = false;
    if (theme === 'dark') {
      isDark = true;
    } else if (theme === 'system') {
      isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  public toggleTheme(): void {
    const nextTheme: ThemeMode = this.currentTheme === 'light' ? 'dark' : this.currentTheme === 'dark' ? 'system' : 'light';
    this.applyTheme(nextTheme, true);
    this.updateThemeButton();
  }

  private getThemeIcon(): string {
    if (this.currentTheme === 'light') return '☀️';
    if (this.currentTheme === 'dark') return '🌙';
    return '💻'; // System
  }

  private getThemeLabel(): string {
    if (this.currentTheme === 'light') return 'Theme: Light';
    if (this.currentTheme === 'dark') return 'Theme: Dark';
    return 'Theme: System';
  }

  private updateThemeButton(): void {
    const btn = this.container.querySelector<HTMLButtonElement>('#theme-toggle-btn');
    if (btn) {
      btn.innerHTML = this.getThemeIcon();
      btn.title = this.getThemeLabel();
      btn.setAttribute('aria-label', this.getThemeLabel());
    }
  }

  public setActiveNav(tab: 'generator' | 'templates' | 'history' | 'about'): void {
    const navItems = this.container.querySelectorAll<HTMLAnchorElement>('.nav-item');
    navItems.forEach(item => {
      if (item.dataset.tab === tab) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="header-inner">
        <div class="brand" id="brand-logo" role="button" tabindex="0" title="QR Studio Home">
          <div class="brand-icon">
            <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="16" fill="#2563eb"/>
              <rect x="10" y="10" width="18" height="18" rx="4" fill="white"/>
              <rect x="13" y="13" width="12" height="12" rx="2" fill="#2563eb"/>
              <rect x="16" y="16" width="6" height="6" rx="1.5" fill="white"/>
              <rect x="36" y="10" width="18" height="18" rx="4" fill="white"/>
              <rect x="39" y="13" width="12" height="12" rx="2" fill="#2563eb"/>
              <rect x="42" y="16" width="6" height="6" rx="1.5" fill="white"/>
              <rect x="10" y="36" width="18" height="18" rx="4" fill="white"/>
              <rect x="13" y="39" width="12" height="12" rx="2" fill="#2563eb"/>
              <rect x="16" y="42" width="6" height="6" rx="1.5" fill="white"/>
              <rect x="36" y="36" width="6" height="6" rx="2" fill="white"/>
              <rect x="48" y="36" width="6" height="6" rx="2" fill="white"/>
              <rect x="42" y="42" width="6" height="6" rx="2" fill="white"/>
              <rect x="36" y="48" width="6" height="6" rx="2" fill="white"/>
              <rect x="48" y="48" width="6" height="6" rx="2" fill="white"/>
            </svg>
          </div>
          <div>
            <span class="brand-title">QR Studio</span>
            <span class="brand-subtitle">Create beautiful QR codes</span>
          </div>
        </div>

        <nav class="nav-links" id="main-nav">
          <a href="#generator" class="nav-item active" data-tab="generator">Generator</a>
          <a href="#templates" class="nav-item" data-tab="templates">Templates</a>
          <a href="#history" class="nav-item" data-tab="history">History</a>
          <a href="#about" class="nav-item" data-tab="about">About</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="nav-item">GitHub ↗</a>
        </nav>

        <div class="header-actions">
          <button id="theme-toggle-btn" class="theme-toggle" title="${this.getThemeLabel()}" aria-label="${this.getThemeLabel()}">
            ${this.getThemeIcon()}
          </button>
          <button id="mobile-hamburger-btn" class="mobile-menu-btn" aria-label="Toggle mobile menu">
            ☰
          </button>
        </div>
      </div>
    `;

    // Listeners
    const brand = this.container.querySelector('#brand-logo');
    brand?.addEventListener('click', () => this.callbacks.onNavClick('generator'));

    const navItems = this.container.querySelectorAll<HTMLAnchorElement>('.nav-item[data-tab]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.dataset.tab as any;
        if (tab) {
          this.setActiveNav(tab);
          this.callbacks.onNavClick(tab);
          this.container.querySelector('#main-nav')?.classList.remove('mobile-open');
        }
      });
    });

    const themeBtn = this.container.querySelector('#theme-toggle-btn');
    themeBtn?.addEventListener('click', () => this.toggleTheme());

    const mobileBtn = this.container.querySelector('#mobile-hamburger-btn');
    mobileBtn?.addEventListener('click', () => {
      const nav = this.container.querySelector('#main-nav');
      nav?.classList.toggle('mobile-open');
    });

    // Listen for system theme change
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.currentTheme === 'system') {
        this.applyTheme('system', false);
      }
    });
  }
}
