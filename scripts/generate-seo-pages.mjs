import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const siteUrl = (process.env.VITE_SITE_URL || "https://tools.jiandengcun.com").replace(/\/$/, "");
const distDir = "dist";
const baseHtml = readFileSync(join(distDir, "index.html"), "utf8");

const tools = [
  ["salary", "Salary Calculator", "Calculate annual, monthly, and take-home salary with tax and deduction estimates."],
  ["hourly", "Hourly to Salary Calculator", "Hourly to salary calculator for any hourly rate. At 40 hours a week and 52 weeks, 20 hourly to salary is $41,600 a year. Free, in your browser."],
  ["percentage", "Percentage Calculator", "Calculate percentages, percentage increase, and percentage decrease online."],
  ["discount", "Discount Calculator", "Discount calculator for an original price and a percent off. See the sale price and how much you save. Free, in your browser."],
  ["margin", "Profit Margin Calculator", "Calculate profit, margin, markup, revenue, and cost."],
  ["roi", "ROI Calculator", "ROI calculator for an initial investment and a final value. See the net return and ROI percentage. Free, in your browser."],
  ["compound", "Compound Interest Calculator", "Estimate compound interest with monthly contributions and annual rates."],
  ["loan", "Loan Calculator", "Estimate monthly loan payments, total paid, and interest cost."],
  ["meeting", "Meeting Cost Calculator", "Meeting cost calculator for attendees, hourly rate, and minutes. This cost of meeting calculator shows the total cost and the cost per minute. Free, no signup."],
  ["timezone", "UTC to EST Converter", "UTC to EST converter for any date and time. Convert UTC to Eastern Time, shown as EST or EDT for that date. Free, in your browser."],
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
  ["uuid", "UUID Generator", "Online UUID generator for random UUID v4 values. Create a new random UUID in your browser, with no signup."],
  ["regex", "Regex Tester", "Test regular expressions and find matches in text."],
  ["timestamp", "Unix Date Converter", "Unix date converter for timestamps in seconds. See the current Unix time plus the local date and ISO date. Free, in your browser."],
  ["url", "URL Encoder and Decoder", "Encode and decode URL strings safely."],
  ["qr-code", "QR Code Generator", "Create downloadable QR codes from URLs or text."],
  ["csv-json", "CSV to JSON Converter", "Convert CSV data into formatted JSON."],
  ["color", "HEX to RGB Converter", "HEX to RGB converter for a hex code. Turn a HEX color into RGB and HSL in your browser. Free, no signup."],
  ["meta-tags", "Meta Tag Generator", "Generate SEO meta tags, Open Graph tags, and Twitter card tags."],
  ["compress", "Image Compressor", "Compress JPG, PNG, WebP, and AVIF images online."],
  ["resize", "Image Resizer", "Resize images for YouTube, Instagram, TikTok, Facebook, LinkedIn, Open Graph, and favicons."],
  ["jpg-png", "JPG to PNG Converter", "JPG to PNG converter online and free. Convert one image or batch convert JPG to PNG in your browser. No signup."],
  ["png-jpg", "PNG to JPG Converter", "How to convert PNG to JPG on a Mac, iPhone, or any browser. Batch convert PNG files to JPG for free. Transparent areas become white."],
  ["webp-jpg", "WebP to JPG Converter", "WebP to JPG converter free in your browser. Save a WebP as JPG, or batch convert several files at once. No signup."],
  ["heic-jpg", "HEIC File Convert to JPG", "HEIC file convert to JPG in your browser. Turn iPhone HEIC photos into a smaller JPEG for free, with no signup."],
  ["image-pdf", "JPG to PDF Converter", "Combine JPG to PDF in your browser. Convert one JPG, or merge several JPG files into one PDF. Free, no signup."],
  ["pdf-word", "PDF to Word Converter", "Extract text from PDF and convert it to a downloadable Word document."],
  ["pdf-text", "PDF to Text Converter", "Extract readable text from PDF files online."],
  ["pdf-info", "PDF Metadata Viewer", "View PDF page count, file size, title, author, creator, and producer metadata."],
  ["pdf-merge", "PDF Merger", "Merge multiple PDF files into one PDF online."],
  ["pdf-compress", "PDF Compressor", "Optimize PDF files in your browser."],
  ["pdf-jpg", "PDF to JPG Converter", "PDF format to JPG in your browser. Turn each PDF page into a JPG file, including on a Mac. Free, no signup."]
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
  ["/all-tools", "All Online Tools - QuickTools", "Browse every QuickTools calculator, converter, image utility, PDF tool, work tool, and developer tool."],
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
