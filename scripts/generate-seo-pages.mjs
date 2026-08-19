import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const siteUrl = (process.env.VITE_SITE_URL || "https://tools.jiandengcun.com").replace(/\/$/, "");
const distDir = "dist";
const baseHtml = readFileSync(join(distDir, "index.html"), "utf8");

const tools = [
  ["salary", "Salary Calculator", "Calculate annual, monthly, and take-home salary with tax and deduction estimates."],
  ["hourly", "Hourly to Salary Calculator", "Convert hourly pay to annual, monthly, weekly, and daily salary."],
  ["percentage", "Percentage Calculator", "Calculate percentages, percentage increase, and percentage decrease online."],
  ["discount", "Discount Calculator", "Find sale price, savings, and discount percentage instantly."],
  ["margin", "Profit Margin Calculator", "Calculate profit, margin, markup, revenue, and cost."],
  ["roi", "ROI Calculator", "Calculate return on investment, net return, and ROI percentage."],
  ["compound", "Compound Interest Calculator", "Estimate compound interest with monthly contributions and annual rates."],
  ["loan", "Loan Calculator", "Estimate monthly loan payments, total paid, and interest cost."],
  ["meeting", "Meeting Cost Calculator", "Estimate meeting cost by attendees, hourly rate, and duration."],
  ["timezone", "Time Zone Converter", "Convert time between international time zones."],
  ["hours", "Work Hours Calculator", "Calculate work hours, break time, and total minutes."],
  ["words", "Word Counter", "Count words, characters, sentences, paragraphs, and lines."],
  ["chars", "Character Counter", "Count characters with spaces and without spaces."],
  ["reading", "Reading Time Calculator", "Estimate reading time from word count."],
  ["deadline", "Deadline Calculator", "Calculate deadlines using calendar days or business days."],
  ["case-converter", "Case Converter", "Convert text to uppercase, lowercase, title case, sentence case, snake case, kebab case, and camel case."],
  ["json-format", "JSON Formatter", "Format and beautify JSON online in your browser."],
  ["json-validate", "JSON Validator", "Validate JSON and find parse errors instantly."],
  ["jwt", "JWT Decoder", "Decode JWT header and payload locally in your browser."],
  ["base64", "Base64 Encoder and Decoder", "Encode and decode Base64 strings online."],
  ["uuid", "UUID Generator", "Generate secure random UUIDs in your browser."],
  ["regex", "Regex Tester", "Test regular expressions and find matches in text."],
  ["timestamp", "Timestamp Converter", "Convert Unix timestamps to local and ISO dates."],
  ["url", "URL Encoder and Decoder", "Encode and decode URL strings safely."],
  ["qr-code", "QR Code Generator", "Create downloadable QR codes from URLs or text."],
  ["csv-json", "CSV to JSON Converter", "Convert CSV data into formatted JSON."],
  ["color", "Color Converter", "Convert HEX colors to RGB and HSL values."],
  ["meta-tags", "Meta Tag Generator", "Generate SEO meta tags, Open Graph tags, and Twitter card tags."],
  ["compress", "Image Compressor", "Compress JPG, PNG, WebP, and AVIF images online."],
  ["resize", "Image Resizer", "Resize images for YouTube, Instagram, TikTok, Facebook, LinkedIn, Open Graph, and favicons."],
  ["jpg-png", "JPG to PNG Converter", "Convert JPG images to PNG in your browser."],
  ["png-jpg", "PNG to JPG Converter", "Convert PNG images to JPG in your browser."],
  ["webp-jpg", "WebP to JPG Converter", "Convert WebP images to JPG online."],
  ["heic-jpg", "HEIC to JPG Converter", "Convert HEIC photos to JPG when supported by your browser."],
  ["image-pdf", "Image to PDF Converter", "Convert one or more images into a PDF file."],
  ["pdf-word", "PDF to Word Converter", "Extract text from PDF and convert it to a downloadable Word document."],
  ["pdf-text", "PDF to Text Converter", "Extract readable text from PDF files online."],
  ["pdf-info", "PDF Metadata Viewer", "View PDF page count, file size, title, author, creator, and producer metadata."],
  ["pdf-merge", "PDF Merger", "Merge multiple PDF files into one PDF online."],
  ["pdf-compress", "PDF Compressor", "Optimize PDF files in your browser."],
  ["pdf-jpg", "PDF to JPG Converter", "Convert PDF pages to downloadable JPG images."]
];

const categories = [
  ["finance", "Finance Calculators", "Free finance calculators for salary, hourly pay, percentage, discount, profit margin, ROI, compound interest, and loans."],
  ["work", "Work Tools", "Useful work tools for meetings, time zones, work hours, word counts, reading time, deadlines, and text case conversion."],
  ["developer", "Developer Tools", "Browser-based developer tools for JSON, JWT, Base64, UUID, regex, timestamps, URLs, QR codes, CSV, colors, and meta tags."],
  ["image", "Image Tools", "Image compressor, image resizer, JPG, PNG, WebP, HEIC, and image to PDF converters."],
  ["pdf", "PDF Tools", "PDF to Word, PDF to text, PDF metadata, PDF merge, PDF compress, and PDF to JPG tools."]
];

const pages = [
  ["/", "QuickTools - Free Online Calculators, PDF, Image and Developer Tools", "Use free online tools for PDF conversion, image compression, calculators, text utilities, JSON formatting, QR codes, and SEO meta tags."],
  ["/popular", "Popular Tools - QuickTools", "Explore popular online tools including PDF to Word, image compressor, QR code generator, JSON formatter, and word counter."],
  ["/new", "New Online Tools - QuickTools", "Try newly added tools for PDF conversion, PDF compression, CSV to JSON, color conversion, and SEO meta tags."],
  ["/blog", "Tool Guides and Tips - QuickTools", "Read practical guides for calculators, PDF tools, image optimization, developer utilities, and SEO workflows."],
  ["/about", "About QuickTools", "QuickTools is a free online toolbox for fast, private browser-based calculations, conversions, and file utilities."],
  ["/privacy-policy", "Privacy Policy - QuickTools", "Read the QuickTools privacy policy for analytics, cookies, advertising, uploaded files, and contact information."],
  ["/terms", "Terms of Service - QuickTools", "Review the terms for using QuickTools calculators, converters, image tools, PDF tools, and developer utilities."],
  ["/contact", "Contact QuickTools", "Contact QuickTools for feedback, bug reports, feature requests, privacy questions, and advertising inquiries."],
  ...categories.map(([slug, title, description]) => [`/category/${slug}`, `${title} - QuickTools`, description]),
  ...tools.map(([slug, title, description]) => [`/tools/${slug}`, `${title} - QuickTools`, description])
];

function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function pageHtml(path, title, description) {
  const canonical = `${siteUrl}${path}`;
  return baseHtml
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`);
}

for (const [path, title, description] of pages) {
  const output = path === "/" ? join(distDir, "index.html") : join(distDir, path, "index.html");
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, pageHtml(path, title, description));
}

writeFileSync(join(distDir, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
writeFileSync(join(distDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(([path]) => `  <url><loc>${siteUrl}${path}</loc><changefreq>weekly</changefreq><priority>${path === "/" ? "1.0" : path.startsWith("/tools/") ? "0.8" : "0.7"}</priority></url>`).join("\n")}\n</urlset>\n`);

console.log(`Generated SEO pages for ${pages.length} routes.`);
