# 🚀 Quick Start Guide

## Get Started in 5 Minutes!

### Step 1: Generate Icons (2 minutes)
**This is REQUIRED - the extension won't load without icons.**

```bash
cd icons/
# Open generate-icons.html in Chrome
open generate-icons.html
```

In your browser:
1. You'll see 4 canvas images
2. Right-click each one → "Save image as..."
3. Save as: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
4. Save them in the `icons/` folder

**Shortcut:** If you have any 4 square PNG images, rename them and use as placeholders for testing.

---

### Step 2: Load Extension (1 minute)

1. Open Chrome and go to: **`chrome://extensions/`**
2. Enable **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `Webpage to pdf` folder
5. ✅ Extension appears in toolbar!

---

### Step 3: Test It (2 minutes)

1. Navigate to any website (try https://example.com)
2. Click the PDF Pro icon in your toolbar
3. Click the big **"Convert to PDF"** button
4. ✅ PDF downloads without page refresh!

---

## 🎯 That's It!

You're ready to use the extension. Want to customize settings?

- Click the **⚙️ gear icon** in the popup
- Or right-click extension icon → **Options**

---

## 🐛 Troubleshooting

### Extension won't load?
- ✅ Make sure all 4 icon PNG files exist in `icons/` folder
- ✅ Check `manifest.json` is valid JSON
- ✅ Reload the extension on chrome://extensions/

### PDF isn't downloading?
- ✅ Check browser console for errors (F12)
- ✅ Try on a different website
- ✅ Export diagnostics (click "Diagnostics" in popup)

### Images missing in PDF?
- ✅ Enable "Wait for Images" toggle
- ✅ Let page fully load before converting
- ✅ Scroll through page first to trigger lazy-loading

---

## 📖 Next Steps

### For Testing
Read **`TESTING_GUIDE.md`** - 20+ test scenarios

### For Deployment
Read **`CHROME_STORE_SUBMISSION.md`** - Store submission guide

### For Development
Read **`README.md`** - Complete documentation

---

## 🎉 Key Features to Try

1. **Dark Mode** - Toggle in popup, converts page to dark theme
2. **Full Page** - Captures entire page, not just viewport
3. **Preserve Links** - Keeps hyperlinks clickable in PDF
4. **Quality Settings** - Try Medium/High/Ultra quality
5. **Smart Naming** - Automatic filename from page title

---

## 💬 Need Help?

- Check **`README.md`** for detailed documentation
- See **`TESTING_GUIDE.md`** for common issues
- Review **`PROJECT_SUMMARY.md`** for architecture overview

---

**Happy PDF Converting! 📄✨**
