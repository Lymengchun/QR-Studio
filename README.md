# QR Studio ⚡

A modern, fast, and privacy-friendly QR Code Generator web application designed for normal everyday users and businesses.

Built with **HTML5, CSS3, TypeScript, and Vite**, QR Studio generates 100% of your QR codes directly inside your web browser. No accounts, no subscriptions, no tracking cookies, and zero server dependencies.

![QR Studio Preview](public/favicon.svg)

---

## ✨ Features

- **🌐 11 Everyday QR Types**:
  - **Website URL**: Automatic validation and one-tap test links.
  - **Plain Text**: Notes, messages, instructions with real-time character counters.
  - **Wi-Fi**: WPA/WPA2/WPA3, WEP, Open networks, and hidden network support.
  - **Contact (vCard 3.0)**: Name, phone, email, company, website, and physical address.
  - **Email**: Pre-addressed `mailto:` with subject line and body text.
  - **Phone**: Instant one-tap dialing (`tel:`).
  - **SMS**: Pre-addressed text messaging with template message.
  - **Location / Google Maps**: Direct GPS coordinates with browser geolocation support.
  - **WhatsApp**: Direct chat links with pre-filled greeting messages.
  - **Calendar Event**: iCalendar event with title, location, start/end dates, and description.
  - **Crypto / Bitcoin**: Bitcoin, Ethereum, Solana, and USDT payment address formatting.
- **🎨 Classic & Styled QR Modes**:
  - **Dot Styles**: Standard square, rounded modules, circular dots, classy, and extra-rounded.
  - **Corner Eyes**: Square, rounded, and circular corner patterns.
  - **Color Customization**: High-contrast color pickers, linear gradients with customizable angle.
  - **Quiet Zone Adjustment**: Safety margin controls to guarantee reliable camera detection.
  - **Style Presets**: One-click presets (Classic, Minimal, Modern, Business, Soft Emerald, Colorful, Dark Slate).
- **🖼️ Logo Embedding**:
  - Upload custom PNG, JPG, or SVG logos.
  - Quick built-in presets (Link, Wi-Fi, Phone, Mail, WhatsApp, Map, Star, Heart, Bitcoin).
  - Automatic error correction elevation to Level H (High, ~30% recovery) when logos are applied.
  - Scanability warning when logos exceed 32% of total QR size.
  - Background cutout toggle to keep logos clear and legible.
- **🛡️ Scanability Guard**:
  - Real-time WCAG color contrast ratio calculator.
  - Instant warnings for low-contrast color combinations or inverted (light-on-dark) QR codes.
- **💾 Export & Sharing**:
  - **PNG**: Choose between 512×512, 1024×1024 (HD), or 2048×2048 (Print Quality).
  - **SVG**: Scalable vector graphics for high-end graphic design and large format print.
  - **JPG**: Standard image format for universal compatibility.
  - **Copy Image**: Directly copy the PNG image to your system clipboard.
  - **Copy Payload**: Copy URL or raw text content with one click.
  - **Web Share**: Share directly to messaging apps on mobile devices.
- **📜 Local History**:
  - Stored in browser `localStorage` (max 20 items).
  - Relative timestamps ("2 minutes ago", "Yesterday").
  - "Load" action to re-populate any past QR code in one click.
  - Security option: *"Do not save sensitive QR content"* (omits Wi-Fi passwords).
  - "Clear All History" button.
- **⚡ Quick Templates**:
  - Jumpstart QR generation with pre-populated templates for websites, Wi-Fi, business cards, Instagram, WhatsApp, customer support, and crypto.
- **🌓 Dark Mode**:
  - Light, Dark, and System theme support with persistent settings.
  - QR preview background remains light by default so your camera scanner can always read it.
- **📱 PWA & Offline Support**:
  - Installable Progressive Web App with `manifest.webmanifest`.
  - Built-in service worker (`sw.js`) enabling 100% offline usage.
- **🚀 GitHub Pages Ready**:
  - Configured with relative base path (`base: './'`).
  - Automated deployment workflow included (`.github/workflows/deploy.yml`).

---

## 🛠️ Tech Stack

- **Bundler**: Vite 6
- **Language**: TypeScript 5
- **Styling**: Vanilla CSS3 with CSS Variables & Responsive Grid/Flexbox
- **QR Engine**: `qr-code-styling` (Client-side Canvas & SVG rendering)
- **Deployment**: GitHub Pages / Static Hosting

---

## 💻 Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Start local development server

```bash
npm run dev
```

Visit the local server in your browser (typically `http://localhost:3000`).

### 3. Build for production

```bash
npm run build
```

This compiles TypeScript (`tsc`) and bundles optimized static assets into the `dist/` directory.

### 4. Test production build locally

```bash
npm run preview
```

---

## 🚀 GitHub Pages Deployment

This repository is pre-configured for automated deployment to **GitHub Pages** using GitHub Actions.

### Step 1: Push code to your GitHub repository

```bash
git init
git add .
git commit -m "Initial QR Studio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

### Step 2: Enable GitHub Pages in your repository settings

1. Navigate to your repository on GitHub.
2. Go to **Settings** > **Pages** (in the left sidebar under *Code and automation*).
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.

### Step 3: Automated Deployment

Whenever you push commits to the `main` branch, the `.github/workflows/deploy.yml` workflow will:
1. Check out your code.
2. Install Node.js dependencies (`npm ci`).
3. Build the production application (`npm run build`).
4. Upload and deploy `dist/` to GitHub Pages.

Your live application will be available at:

```text
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/
```

*(Because `vite.config.ts` uses `base: './'`, asset links work flawlessly on both root domains and subpath repositories).*

---

## 🔒 Privacy & Security Guarantee

- **Zero Server Uploads**: The application has no backend server or API keys. All QR code modules, SVG shapes, and images are drawn client-side using the HTML5 Canvas API and browser SVG DOM.
- **No Third-Party Analytics**: No tracking pixels, Google Analytics, or third-party cookies.
- **Local Logo Processing**: Uploaded logos are converted to base64 Data URLs via `FileReader` strictly within browser memory and are never saved to remote servers.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
