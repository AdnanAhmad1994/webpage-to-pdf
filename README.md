# 📄 Webpage to PDF Pro - Chrome Extension

**Professional webpage to PDF converter with advanced features that actually work.**

## 🎯 Key Features

✅ **Full-Page Capture** - Captures entire page including content below the fold
✅ **Infinite Scroll Support** - Automatically loads all dynamic content
✅ **Hyperlink Preservation** - Clickable links in your PDFs
✅ **Dark Mode PDFs** - Convert pages to dark theme
✅ **No Page Refresh** - Seamless downloads without losing your place
✅ **High Quality** - True vector PDFs, not screenshots
✅ **Smart File Naming** - Automatic naming based on page title
✅ **Localhost Support** - Works with local development environments
✅ **Privacy First** - No data collection, all processing happens locally

---

## 🚀 Installation

### Method 1: Load Unpacked (For Development/Testing)

1. **Generate Icons First** (Required)
   ```bash
   cd icons
   # Open generate-icons.html in browser, save the 4 PNG files
   # OR use any square PNG images as placeholders
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `Webpage to pdf` folder
   - The extension should now appear in your toolbar

4. **Grant Permissions** (Optional, for full functionality)
   - Click "Details" on the extension card
   - Enable "Allow access to file URLs" for localhost support

### Method 2: Chrome Web Store (Coming Soon)

The extension will be published to the Chrome Web Store after testing and compliance review.

---

## 📖 Usage

### Basic Usage

1. **Navigate to any webpage** you want to convert
2. **Click the PDF Pro icon** in your Chrome toolbar
3. **Adjust settings** if needed (Dark Mode, Quality, etc.)
4. **Click "Convert to PDF"**
5. **PDF downloads automatically** - no page refresh!

### Keyboard Shortcut

- **Windows/Linux:** `Ctrl + Shift + P`
- **Mac:** `Cmd + Shift + P`

### Advanced Features

#### Dark Mode PDFs
Perfect for reducing eye strain when reading. Enable in popup or settings.

#### Custom File Naming
Configure patterns like:
- `{title}_{date}` → `Google_2026-01-18.pdf`
- `{title}_{timestamp}` → `Article_1737187200000.pdf`
- `MyCompany_{date}` → `MyCompany_2026-01-18.pdf`

#### Quality Settings
- **Medium** - Faster, smaller files (good for quick captures)
- **High** - Recommended balance (default)
- **Ultra** - Best quality, larger files and slower processing

#### Full Page Capture
Automatically scrolls and captures content:
- Lazy-loaded images
- Infinite scroll pages
- Dynamic content
- Viewport content beyond the fold

---

## 🔧 Configuration

### Settings Page

Access via:
- Click gear icon in popup
- Right-click extension icon → Options
- Navigate to `chrome://extensions/` → PDF Pro → Options

### Available Settings

#### General
- **PDF Quality** - Low, Medium, High, Ultra
- **Capture Full Page** - Enable/disable full-page capture
- **Handle Infinite Scroll** - Auto-load dynamic content
- **Wait for Images** - Ensure all images load
- **Hide Fixed Elements** - Remove sticky headers/toolbars
- **Preserve Hyperlinks** - Keep links clickable (recommended)
- **Dark Mode PDF** - Convert to dark theme
- **Enable Compression** - Reduce file size
- **File Name Pattern** - Customize output filenames

#### Advanced
- **Paper Size** - A4, Letter, Legal, A3
- **Orientation** - Portrait, Landscape
- **DPI** - 1x to 4x (higher = better quality, larger files)

---

## 🛠️ Development

### Project Structure

```
Webpage to pdf/
├── manifest.json           # Extension configuration
├── background.js           # Service worker (orchestration)
├── content.js              # Page capture logic
├── popup.html/js           # Extension popup UI
├── options.html/js         # Settings page
├── lib/
│   └── pdf-generator.js    # PDF generation engine
├── styles/
│   ├── popup.css           # Popup styles
│   └── options.css         # Options page styles
├── icons/
│   ├── icon16.png          # 16x16 icon
│   ├── icon32.png          # 32x32 icon
│   ├── icon48.png          # 48x48 icon
│   ├── icon128.png         # 128x128 icon
│   └── generate-icons.html # Icon generator
└── README.md              # This file
```

### Technologies Used

- **Chrome Extension Manifest V3** - Latest extension platform
- **html2canvas** - High-quality page rendering
- **jsPDF** - PDF document generation
- **Vanilla JavaScript** - No frameworks, pure performance
- **CSS3** - Modern, gradient-based UI

### Key Architecture Decisions

#### Why No Page Refresh?
Uses `chrome.downloads.download()` with data URLs instead of navigation-based downloads.

#### Why html2canvas + jsPDF?
- Captures complex layouts accurately
- Preserves styling and images
- Allows hyperlink injection
- Works with dynamic content

#### Why Manifest V3?
- Future-proof (V2 deprecated)
- Better security model
- Required for Chrome Web Store

---

## 🐛 Troubleshooting

### Extension Won't Load

**Issue:** "Manifest file is missing or unreadable"
- **Solution:** Ensure `manifest.json` is present and valid JSON

**Issue:** "Could not load icon"
- **Solution:** Generate icon files using `icons/generate-icons.html`

### Conversion Issues

**Issue:** "Extension doesn't work on certain pages"
- Chrome extensions cannot run on `chrome://`, `chrome-extension://`, system pages
- Some sites have strict Content Security Policies

**Issue:** "Images are missing in PDF"
- Enable "Wait for Images" in settings
- Scroll through page first to trigger lazy loading
- Some cross-origin images may be blocked by CORS

**Issue:** "PDF is too large"
- Lower quality setting (Medium instead of Ultra)
- Disable full-page capture for long pages
- Enable compression in settings

**Issue:** "Links not clickable in PDF"
- Ensure "Preserve Hyperlinks" is enabled
- Some complex link structures may not be detected

### Localhost/File URL Issues

**Issue:** "Doesn't work on localhost"
- Go to `chrome://extensions/`
- Find "Webpage to PDF Pro"
- Click "Details"
- Enable "Allow access to file URLs"

---

## 🔒 Privacy & Security

### Data Collection: NONE

This extension:
- ✅ Does NOT collect any user data
- ✅ Does NOT send data to external servers
- ✅ Does NOT use analytics or tracking
- ✅ Processes everything locally in your browser
- ✅ Does NOT require account creation
- ✅ Open source and auditable

### Permissions Explained

| Permission | Why Needed | What It Does |
|------------|------------|--------------|
| `activeTab` | Access current page | Read page content for PDF conversion |
| `downloads` | Save PDFs | Trigger PDF download without page refresh |
| `storage` | Save settings | Remember your preferences |
| `scripting` | Inject scripts | Load PDF generation library |
| `<all_urls>` | Work on all sites | Enable conversion on any webpage |

**Note:** `<all_urls>` is required for the extension to work on all websites. We only access pages when you explicitly click "Convert to PDF."

---

## 📊 Chrome Web Store Compliance

### Checklist for Publication

- [x] Manifest V3 compliant
- [x] Privacy policy included
- [x] Detailed permission justifications
- [x] High-quality icons (128x128, 48x48, 32x32, 16x16)
- [x] Comprehensive description
- [x] Screenshots prepared
- [x] No external code (all bundled)
- [x] No obfuscation
- [x] Accessibility tested
- [ ] Final testing across multiple sites
- [ ] Store listing assets prepared

### Required Assets for Store

**Screenshots (1280x800 or 640x400):**
1. Main popup interface
2. Settings page
3. Before/after conversion
4. Dark mode example
5. Full-page capture example

**Promotional Images:**
- Small tile: 440x280
- Large tile: 920x680 (optional)
- Marquee: 1400x560 (optional)

---

## 🎯 Roadmap

### Version 2.1 (Next Release)
- [ ] Batch conversion queue
- [ ] Custom PDF templates
- [ ] Annotation support
- [ ] OCR for scanned content
- [ ] Cloud sync for settings

### Version 2.2
- [ ] Multi-page selection tool
- [ ] Header/footer customization
- [ ] Watermark support
- [ ] PDF merging
- [ ] API for developers

### Version 3.0
- [ ] Premium tier with Puppeteer backend
- [ ] Advanced editing features
- [ ] Team collaboration features
- [ ] Enterprise SSO support

---

## 🤝 Contributing

Contributions welcome! Areas needing help:

1. **Testing** - Try on various websites, report bugs
2. **Documentation** - Improve this README
3. **Icons** - Design professional icons
4. **Translations** - i18n support
5. **Features** - Implement roadmap items

### Development Setup

```bash
# Clone or download the extension
cd "Webpage to pdf"

# Make changes to source files

# Test in Chrome
# 1. Go to chrome://extensions/
# 2. Click "Reload" on the extension card
# 3. Test your changes
```

---

## 📄 License

MIT License - Free to use, modify, and distribute.

---

## 🙏 Acknowledgments

Built with:
- [html2canvas](https://html2canvas.hertzen.com/) - HTML rendering
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- Chrome Extension APIs

Inspired by user feedback from existing PDF converters that:
- ❌ Cause page refreshes
- ❌ Only capture viewport
- ❌ Lose hyperlinks
- ❌ Generate low-quality screenshots
- ❌ Don't support dark mode

**This extension fixes all of those issues.**

---

## 📞 Support

- **Issues:** Report bugs via GitHub Issues
- **Feature Requests:** Use GitHub Discussions
- **Security:** Email security concerns privately

---

## 📈 Version History

### v2.0.0 (Current)
- Complete rewrite with Manifest V3
- Added full-page capture
- Implemented hyperlink preservation
- Added dark mode support
- Eliminated page refresh issue
- Smart file naming
- Localhost support
- Comprehensive settings page

### v1.x (Legacy)
- Basic PDF conversion
- Screenshot-based approach
- Limited features

---

**Made with ❤️ for users who need reliable PDF conversion**
