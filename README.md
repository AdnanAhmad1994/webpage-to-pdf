# Webpage to PDF 📥

> Convert any webpage to PDF format with ease. Simple, fast, and privacy-focused web tool.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-%23E34F26.svg?logo=html5&logoColor=white)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?logo=javascript&logoColor=black)]()
[![CSS3](https://img.shields.io/badge/CSS3-%231572B6.svg?logo=css3&logoColor=white)]()

## ✨ Features

- 🌐 **URL to PDF** - Convert any webpage by entering its URL
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🔒 **Privacy First** - No server-side processing, everything runs in your browser
- ⚡ **Lightning Fast** - Quick conversion with no waiting
- 🎨 **Clean Interface** - Modern, intuitive UI built with best practices
- 💾 **Save Locally** - Download PDFs directly to your device
- 🎆 **No Registration** - Use instantly without sign-up
- 🔓 **Open Source** - Fully transparent and community-driven

## 🚀 Quick Start

### Online Demo

Visit the live demo: [Webpage to PDF Tool](https://adnanahmad1994.github.io/webpage-to-pdf/)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/AdnanAhmad1994/webpage-to-pdf.git
   cd webpage-to-pdf
   ```

2. Open `index.html` in your browser:
   ```bash
   # On macOS
   open index.html
   
   # On Linux
   xdg-open index.html
   
   # On Windows
   start index.html
   ```

   Or use a local server:
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Node.js (npx)
   npx serve
   ```

   Then visit `http://localhost:8000` in your browser.

## 📖 Usage

1. **Enter URL**: Type or paste the webpage URL you want to convert
2. **Click Convert**: Press the "Convert to PDF" button
3. **Wait for Preview**: The tool will load and render the webpage
4. **Download**: Click "Download PDF" to save the file to your device

### Example

```
URL: https://example.com/article
→ Renders webpage content
→ Generates PDF
→ Downloads as: webpage.pdf
```

## 🛠️ Tech Stack

- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with Flexbox/Grid
- **Vanilla JavaScript** - No framework dependencies
- **jsPDF** - Client-side PDF generation library
- **html2canvas** - HTML to canvas conversion

## 📁 Project Structure

```
webpage-to-pdf/
├── index.html           # Main HTML file
├── css/
│   └── styles.css        # Stylesheet
├── js/
│   ├── app.js            # Main application logic
│   └── pdf-generator.js  # PDF generation utilities
├── assets/
│   └── images/           # Icons and images
├── LICENSE              # MIT License
├── README.md            # This file
└── .gitignore           # Git ignore rules
```

## 💻 Development

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Basic knowledge of HTML/CSS/JavaScript
- Text editor or IDE

### Building Features

This project uses pure JavaScript with no build process required. To add features:

1. Edit `js/app.js` for application logic
2. Modify `css/styles.css` for styling
3. Update `index.html` for structure changes

### Testing

Test the tool with various URLs:
- Simple HTML pages
- Complex web applications
- Pages with images and media
- Responsive layouts

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. 🐞 **Report Bugs** - Open an issue describing the bug
2. 💡 **Suggest Features** - Share your ideas for improvements
3. 📝 **Improve Documentation** - Help make docs clearer
4. 🛠️ **Submit Pull Requests** - Contribute code improvements

### Development Workflow

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

### Code Style

- Use 2 spaces for indentation
- Follow ESLint recommended rules
- Write clear, descriptive commit messages
- Comment complex logic

## ⚠️ Known Limitations

- Some websites may block cross-origin requests (CORS)
- Dynamic content loaded via JavaScript may not render completely
- Password-protected pages cannot be converted
- Very large pages may take longer to process

## 🔐 Privacy & Security

This tool prioritizes your privacy:

✅ All processing happens in your browser
✅ No data is sent to external servers
✅ No tracking or analytics
✅ No cookies or local storage (unless explicitly needed)
✅ Open source code - verify yourself!

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Adnan Ahmad**
- GitHub: [@AdnanAhmad1994](https://github.com/AdnanAhmad1994)
- Project Link: [https://github.com/AdnanAhmad1994/webpage-to-pdf](https://github.com/AdnanAhmad1994/webpage-to-pdf)

## 🙏 Acknowledgments

- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation library
- [html2canvas](https://html2canvas.hertzen.com/) - HTML to canvas conversion
- [Font Awesome](https://fontawesome.com/) - Icons (if used)
- All contributors who help improve this tool

## 🔗 Related Projects

- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering in browsers
- [Puppeteer](https://pptr.dev/) - Headless Chrome for advanced PDF generation
- [wkhtmltopdf](https://wkhtmltopdf.org/) - Command-line PDF generation

## 📊 Roadmap

- [ ] Add custom page size options (A4, Letter, etc.)
- [ ] Support for batch URL conversion
- [ ] Dark mode toggle
- [ ] PDF customization (margins, orientation)
- [ ] Browser extension version
- [ ] Offline mode with Service Workers
- [ ] QR code generation for sharing

## ❓ FAQ

**Q: Why isn't my webpage converting?**
A: The website may have CORS restrictions. Try using a publicly accessible URL.

**Q: Can I convert password-protected pages?**
A: No, you'll need to be logged in on that website first.
**Q: Is this tool really free?**
A: Yes! It's completely free and open source.

**Q: Can I use this commercially?**
A: Yes, the MIT license allows commercial use.

---

⭐ If you find this tool helpful, please star the repository!

🐛 Found a bug? [Open an issue](https://github.com/AdnanAhmad1994/webpage-to-pdf/issues/new)

💬 Questions? [Start a discussion](https://github.com/AdnanAhmad1994/webpage-to-pdf/discussions)
