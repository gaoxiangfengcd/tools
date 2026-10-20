import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Calculator,
  BriefcaseBusiness,
  Code2,
  Image as ImageIcon,
  Search,
  Copy,
  Download,
  RefreshCw,
  Check,
  AlertTriangle,
  Star,
  Moon,
  Grid3X3,
  List,
  Flame,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Gift,
  Zap,
  ArrowRight,
  Bookmark,
  Clock3,
  FileText,
  QrCode,
  Palette,
  Tags,
  Mail
} from "lucide-react";
import jsPDF from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";
import { initAnalytics, trackPageView, trackToolOpen } from "./analytics";
import "./styles.css";

type Category = "Finance" | "Work" | "Developer" | "Image" | "PDF";

type Tool = {
  id: string;
  name: string;
  category: Category;
  description: string;
};

const categories: Category[] = ["Finance", "Work", "Developer", "Image", "PDF"];
type PageMode = "all-tools" | "categories" | "popular" | "new" | "bookmarks" | "blog" | "about" | "privacy-policy" | "terms" | "contact";

const tools: Tool[] = [
  ["salary", "Salary Calculator", "Finance", "Estimate take-home pay after taxes and deductions."],
  ["hourly", "Hourly to Salary Calculator", "Finance", "Hourly to salary calculator for any hourly rate, hours per week, and weeks per year."],
  ["percentage", "Percentage Calculator", "Finance", "Find percentage values, changes, and totals."],
  ["discount", "Discount Calculator", "Finance", "Discount calculator for a price and a percent off. See the sale price and how much you save."],
  ["margin", "Profit Margin Calculator", "Finance", "Work out profit, markup, and margin."],
  ["roi", "ROI Calculator", "Finance", "ROI calculator for an initial investment and a final value. See net return and the ROI percentage."],
  ["compound", "Compound Interest", "Finance", "Forecast savings with recurring contributions."],
  ["loan", "Loan Calculator", "Finance", "Estimate monthly payments and total interest."],
  ["meeting", "Meeting Cost Calculator", "Work", "Meeting cost calculator for people, average hourly cost, and duration in minutes."],
  ["timezone", "UTC to EST Converter", "Work", "UTC to EST converter for a date and time. Eastern Time is EST or EDT, depending on the date."],
  ["hours", "Work Hours Calculator", "Work", "Calculate hours worked between start and end times."],
  ["words", "Word Counter", "Work", "Count words, sentences, and paragraphs."],
  ["chars", "Character Counter", "Work", "Count characters with and without spaces."],
  ["reading", "Reading Time Calculator", "Work", "Estimate reading time from text length."],
  ["deadline", "Deadline Calculator", "Work", "Add days or workdays to a start date."],
  ["case-converter", "Case Converter", "Work", "Convert text to title, sentence, upper, lower, kebab, snake, and camel case."],
  ["json-format", "JSON Formatter", "Developer", "Pretty-print compact or messy JSON."],
  ["json-validate", "JSON Validator", "Developer", "Validate JSON and show parse errors."],
  ["jwt", "JWT Decoder", "Developer", "Decode JWT header and payload locally."],
  ["base64", "Base64 Encoder", "Developer", "Encode and decode Base64 text."],
  ["uuid", "UUID Generator", "Developer", "Online UUID generator for random UUID v4 values. New identifiers are created in your browser."],
  ["regex", "Regex Tester", "Developer", "Test a regular expression against text."],
  ["timestamp", "Unix Date Converter", "Developer", "Unix date converter for timestamps in seconds. See the current Unix time, a local date, and an ISO date."],
  ["url", "URL Encoder", "Developer", "Encode and decode URL strings."],
  ["qr-code", "QR Code Generator", "Developer", "Create downloadable QR codes from text or URLs."],
  ["csv-json", "CSV to JSON", "Developer", "Convert CSV rows into formatted JSON."],
  ["color", "HEX to RGB Converter", "Developer", "HEX to RGB converter for a hex code. Enter a color and see the RGB and HSL values."],
  ["meta-tags", "Meta Tag Generator", "Developer", "Generate SEO title, description, Open Graph, and Twitter tags."],
  ["compress", "Image Compressor", "Image", "Compress images to JPG or WebP."],
  ["resize", "Image Resizer", "Image", "Resize images by width and height."],
  ["jpg-png", "JPG to PNG Converter", "Image", "JPG to PNG converter online. Convert one JPG, or batch convert several, free in your browser."],
  ["png-jpg", "PNG to JPG Converter", "Image", "How to convert PNG to JPG on a Mac or in any browser. Batch convert several PNG files."],
  ["webp-jpg", "WebP to JPG Converter", "Image", "WebP to JPG converter free in your browser. Save a WebP as JPG, or batch convert several files."],
  ["heic-jpg", "HEIC File Convert to JPG", "Image", "HEIC file convert to JPG in your browser. iPhone photos download as a smaller JPEG."],
  ["image-pdf", "JPG to PDF Converter", "Image", "Combine JPG to PDF in your browser. One JPG becomes one page, and several JPGs merge into one PDF."],
  ["pdf-word", "PDF -> Word", "PDF", "Extract text from a PDF and save it as a Word document."],
  ["pdf-text", "PDF -> Text", "PDF", "Extract readable text from a PDF file."],
  ["pdf-info", "PDF Info", "PDF", "Check page count, title, author, and metadata."],
  ["pdf-merge", "PDF Merge", "PDF", "Combine multiple PDFs into one file."],
  ["pdf-compress", "PDF Compress", "PDF", "Rewrite and optimize a PDF file in your browser."],
  ["pdf-jpg", "PDF to JPG Converter", "PDF", "PDF format to JPG in your browser. Each page downloads as its own JPG file."]
].map(([id, name, category, description]) => ({ id, name, category: category as Category, description }));

const categoryMeta = {
  Finance: { icon: Calculator, color: "#f48a22", soft: "#fff0df" },
  Work: { icon: BriefcaseBusiness, color: "#2c7be5", soft: "#eaf3ff" },
  Developer: { icon: Code2, color: "#6b4df6", soft: "#f0ecff" },
  Image: { icon: ImageIcon, color: "#43b95f", soft: "#eaf8ef" },
  PDF: { icon: FileText, color: "#ef4444", soft: "#feecec" }
};

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const sidebarItems = [
  { label: "All Tools", icon: Grid3X3, count: tools.length },
  { label: "Popular", icon: Star, count: 20 },
  { label: "New Tools", icon: Sparkles, count: "New" },
  { label: "Bookmarks", icon: Bookmark, count: 0 }
];

function updatePath(path: string) {
  window.history.pushState({}, "", path);
}

function toolPath(tool: Tool) {
  return `/tools/${tool.id}`;
}

function stateFromPath() {
  const path = window.location.pathname.length > 1 ? window.location.pathname.replace(/\/$/, "") : window.location.pathname;
  if (path.startsWith("/tools/")) {
    return { active: tools.find((tool) => tool.id === path.replace("/tools/", "")) || null, mode: "categories" as PageMode, cat: "All" as Category | "All" };
  }
  if (path.startsWith("/category/")) {
    const category = categories.find((item) => item.toLowerCase() === path.replace("/category/", "").toLowerCase());
    return { active: null, mode: "categories" as PageMode, cat: (category || "All") as Category | "All" };
  }
  if (path === "/all-tools") return { active: null, mode: "all-tools" as PageMode, cat: "All" as Category | "All" };
  if (path === "/popular") return { active: null, mode: "popular" as PageMode, cat: "All" as Category | "All" };
  if (path === "/new") return { active: null, mode: "new" as PageMode, cat: "All" as Category | "All" };
  if (path === "/bookmarks") return { active: null, mode: "bookmarks" as PageMode, cat: "All" as Category | "All" };
  if (path === "/blog") return { active: null, mode: "blog" as PageMode, cat: "All" as Category | "All" };
  if (path === "/about") return { active: null, mode: "about" as PageMode, cat: "All" as Category | "All" };
  if (path === "/privacy-policy") return { active: null, mode: "privacy-policy" as PageMode, cat: "All" as Category | "All" };
  if (path === "/terms") return { active: null, mode: "terms" as PageMode, cat: "All" as Category | "All" };
  if (path === "/contact") return { active: null, mode: "contact" as PageMode, cat: "All" as Category | "All" };
  return { active: null, mode: "categories" as PageMode, cat: "All" as Category | "All" };
}

function money(n: number) {
  return Number.isFinite(n) ? n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }) : "-";
}

function num(n: number, digits = 2) {
  return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: digits }) : "-";
}

function Field({ label, value, onChange, type = "number", step, min, max }: { label: string; value: string; onChange: (v: string) => void; type?: string; step?: string; min?: string; max?: string }) {
  return <label className="field"><span>{label}</span><input type={type} step={step} min={min} max={max} value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}

function TextBox({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <label className="field wide"><span>{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}

function Result({ items }: { items: Array<[string, string]> }) {
  return <div className="result">{items.map(([k, v]) => <div className="result-row" key={k}><span>{k}</span><strong>{v}</strong></div>)}</div>;
}

function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return <button className="icon-btn" title="Copy" onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1200); }}>{ok ? <Check size={18} /> : <Copy size={18} />}</button>;
}

function FinanceTool({ id }: { id: string }) {
  const [a, setA] = useState(id === "hourly" ? "20" : "5000"), [b, setB] = useState(id === "hourly" ? "40" : "20"), [c, setC] = useState(id === "hourly" ? "52" : "5"), [d, setD] = useState("12");
  const A = +a, B = +b, C = +c, D = +d;
  if (id === "salary") return <Panel inputs={<><Field label="Gross annual salary" value={a} onChange={setA} /><Field label="Tax rate %" value={b} onChange={setB} /><Field label="Annual deductions" value={c} onChange={setC} /></>} result={<Result items={[["Annual take-home", money(A * (1 - B / 100) - C)], ["Monthly", money((A * (1 - B / 100) - C) / 12)], ["Biweekly", money((A * (1 - B / 100) - C) / 26)]]} />} />;
  if (id === "hourly") return <Panel inputs={<><Field label="Hourly rate" value={a} onChange={setA} /><Field label="Hours per week" value={b} onChange={setB} /><Field label="Weeks per year" value={c} onChange={setC} /></>} result={<Result items={[["Annual salary", money(A * B * C)], ["Monthly", money(A * B * C / 12)], ["Weekly", money(A * B)]]} />} />;
  if (id === "percentage") return <Panel inputs={<><Field label="Value" value={a} onChange={setA} /><Field label="Percentage %" value={b} onChange={setB} /></>} result={<Result items={[["Percentage value", num(A * B / 100)], ["Value after increase", num(A * (1 + B / 100))], ["Value after decrease", num(A * (1 - B / 100))]]} />} />;
  if (id === "discount") return <Panel inputs={<><Field label="Original price" value={a} onChange={setA} /><Field label="Discount %" value={b} onChange={setB} /></>} result={<Result items={[["Sale price", money(A * (1 - B / 100))], ["You save", money(A * B / 100)]]} />} />;
  if (id === "margin") return <Panel inputs={<><Field label="Revenue" value={a} onChange={setA} /><Field label="Cost" value={b} onChange={setB} /></>} result={<Result items={[["Profit", money(A - B)], ["Margin", `${num((A - B) / A * 100)}%`], ["Markup", `${num((A - B) / B * 100)}%`]]} />} />;
  if (id === "roi") return <Panel inputs={<><Field label="Initial investment" value={a} onChange={setA} /><Field label="Final value" value={b} onChange={setB} /></>} result={<Result items={[["Net return", money(B - A)], ["ROI", `${num((B - A) / A * 100)}%`]]} />} />;
  if (id === "compound") {
    const monthly = C / 100 / 12, months = D * 12;
    const value = A * Math.pow(1 + monthly, months) + B * ((Math.pow(1 + monthly, months) - 1) / monthly);
    return <Panel inputs={<><Field label="Initial amount" value={a} onChange={setA} /><Field label="Monthly contribution" value={b} onChange={setB} /><Field label="Annual rate %" value={c} onChange={setC} /><Field label="Years" value={d} onChange={setD} /></>} result={<Result items={[["Future value", money(value)], ["Contributions", money(A + B * months)], ["Interest earned", money(value - A - B * months)]]} />} />;
  }
  const r = B / 100 / 12, n = C * 12, payment = A * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  return <Panel inputs={<><Field label="Loan amount" value={a} onChange={setA} /><Field label="APR %" value={b} onChange={setB} /><Field label="Years" value={c} onChange={setC} /></>} result={<Result items={[["Monthly payment", money(payment)], ["Total paid", money(payment * n)], ["Interest", money(payment * n - A)]]} />} />;
}

function WorkTool({ id }: { id: string }) {
  const [a, setA] = useState("4"), [b, setB] = useState("75"), [c, setC] = useState("60"), [text, setText] = useState("Paste or type text here.");
  if (id === "meeting") return <Panel inputs={<><Field label="People" value={a} onChange={setA} /><Field label="Average hourly cost" value={b} onChange={setB} /><Field label="Duration minutes" value={c} onChange={setC} /></>} result={<Result items={[["Meeting cost", money(+a * +b * (+c / 60))], ["Cost per minute", money(+a * +b / 60)]]} />} />;
  if (id === "timezone") return <Timezone />;
  if (id === "hours") return <WorkHours />;
  if (id === "deadline") return <Deadline />;
  if (id === "case-converter") return <CaseConverter />;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0, chars = text.length, charsNo = text.replace(/\s/g, "").length, sentences = (text.match(/[.!?。！？]+/g) || []).length, paras = text.split(/\n\s*\n/).filter(Boolean).length;
  if (id === "reading") return <Panel inputs={<TextBox label="Text" value={text} onChange={setText} />} result={<Result items={[["Words", String(words)], ["Reading time", `${Math.max(1, Math.ceil(words / 225))} min`]]} />} />;
  return <Panel inputs={<TextBox label="Text" value={text} onChange={setText} />} result={<Result items={id === "chars" ? [["Characters", String(chars)], ["Without spaces", String(charsNo)], ["Lines", String(text.split("\n").length)]] : [["Words", String(words)], ["Characters", String(chars)], ["Sentences", String(sentences)], ["Paragraphs", String(paras)]]} />} />;
}

function CaseConverter() {
  const [text, setText] = useState("Quick tools make daily work faster.");
  const words = text.trim().toLowerCase().split(/[\s_-]+/).filter(Boolean);
  const title = words.map(capitalize).join(" ");
  const sentence = text ? capitalize(text.trim().toLowerCase()) : "";
  const output = [
    `UPPERCASE\n${text.toUpperCase()}`,
    `lowercase\n${text.toLowerCase()}`,
    `Title Case\n${title}`,
    `Sentence case\n${sentence}`,
    `kebab-case\n${words.join("-")}`,
    `snake_case\n${words.join("_")}`,
    `camelCase\n${words.map((word, index) => index === 0 ? word : capitalize(word)).join("")}`
  ].join("\n\n");
  return <Panel inputs={<TextBox label="Text" value={text} onChange={setText} />} result={<Output title="Converted text" text={output} />} />;
}

function DeveloperTool({ id }: { id: string }) {
  const [text, setText] = useState(id.includes("json") ? "{\"hello\":\"world\"}" : "Hello world"), [aux, setAux] = useState("");
  if (id === "json-format" || id === "json-validate") {
    let out = "", error = "";
    try { out = JSON.stringify(JSON.parse(text), null, 2); } catch (e) { error = e instanceof Error ? e.message : "Invalid JSON"; }
    return <Panel inputs={<TextBox label="JSON" value={text} onChange={setText} />} result={<Output title={error ? "Invalid JSON" : id === "json-format" ? "Formatted JSON" : "Valid JSON"} text={error || out} error={!!error} />} />;
  }
  if (id === "jwt") {
    const decode = (part: string) => { try { return JSON.stringify(JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))), null, 2); } catch { return "Unable to decode"; } };
    const parts = text.split(".");
    return <Panel inputs={<TextBox label="JWT" value={text} onChange={setText} placeholder="Paste JWT" />} result={<Output title="Decoded" text={`Header:\n${decode(parts[0] || "")}\n\nPayload:\n${decode(parts[1] || "")}`} />} />;
  }
  if (id === "base64") return <Panel inputs={<TextBox label="Text" value={text} onChange={setText} />} result={<Output title="Encoded / decoded" text={`Base64:\n${btoa(unescape(encodeURIComponent(text)))}\n\nDecoded input if valid:\n${safeBase64(text)}`} />} />;
  if (id === "uuid") {
    const ids = Array.from({ length: 6 }, () => crypto.randomUUID()).join("\n");
    return <Panel inputs={<button className="primary" onClick={() => setAux(String(Date.now()))}><RefreshCw size={16} /> Generate again</button>} result={<Output title="UUIDs" text={ids + aux.slice(0, 0)} />} />;
  }
  if (id === "regex") {
    const matches = [...text.matchAll(new RegExp(aux || "\\w+", "g"))].map((m) => `${m[0]} at ${m.index}`).join("\n") || "No matches";
    return <Panel inputs={<><Field label="Pattern" value={aux} onChange={setAux} type="text" /><TextBox label="Test text" value={text} onChange={setText} /></>} result={<Output title="Matches" text={matches} />} />;
  }
  if (id === "timestamp") {
    const now = Math.floor(Date.now() / 1000), t = Number(text) || now;
    return <Panel inputs={<Field label="Unix timestamp" value={text} onChange={setText} type="text" />} result={<Result items={[["Now", String(now)], ["Local date", new Date(t * 1000).toLocaleString()], ["ISO date", new Date(t * 1000).toISOString()]]} />} />;
  }
  if (id === "qr-code") return <QrTool />;
  if (id === "csv-json") return <CsvJsonTool />;
  if (id === "color") return <ColorTool />;
  if (id === "meta-tags") return <MetaTagTool />;
  return <Panel inputs={<TextBox label="URL text" value={text} onChange={setText} />} result={<Output title="Encoded / decoded" text={`Encoded:\n${encodeURIComponent(text)}\n\nDecoded input if valid:\n${safeDecode(text)}`} />} />;
}

function QrTool() {
  const [value, setValue] = useState("https://example.com");
  const [size, setSize] = useState("512");
  const [url, setUrl] = useState("");

  async function generate() {
    setUrl(await QRCode.toDataURL(value || " ", { width: clamp(+size || 512, 128, 2048), margin: 2 }));
  }

  return <Panel inputs={<><TextBox label="Text or URL" value={value} onChange={setValue} /><Field label="Size px" value={size} onChange={setSize} min="128" max="2048" /><button className="primary" onClick={generate}><QrCode size={16} /> Generate QR Code</button></>} result={<div className="preview-box">{url ? <><img src={url} alt="Generated QR code" /><a className="download" href={url} download="qr-code.png"><Download size={18} /> Download PNG</a></> : <p className="muted">Your QR code will appear here.</p>}</div>} />;
}

function CsvJsonTool() {
  const [csv, setCsv] = useState("name,email\nJane,jane@example.com\nAlex,alex@example.com");
  let output = "";
  try {
    output = JSON.stringify(csvToJson(csv), null, 2);
  } catch (error) {
    output = error instanceof Error ? error.message : "Unable to parse CSV";
  }
  return <Panel inputs={<TextBox label="CSV" value={csv} onChange={setCsv} />} result={<Output title="JSON" text={output} />} />;
}

function ColorTool() {
  const [hex, setHex] = useState("#6b4df6");
  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  return <Panel inputs={<><label className="field"><span>Color</span><input type="color" value={rgb ? hex : "#6b4df6"} onChange={(event) => setHex(event.target.value)} /></label><Field label="HEX" value={hex} onChange={setHex} type="text" /></>} result={<div className="color-result"><div className="swatch" style={{ background: rgb ? hex : "#fff" }} />{rgb ? <Result items={[["HEX", hex.toUpperCase()], ["RGB", `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`], ["HSL", `hsl(${hsl?.h}, ${hsl?.s}%, ${hsl?.l}%)`]]} /> : <p className="warning">Enter a valid HEX color.</p>}</div>} />;
}

function MetaTagTool() {
  const [title, setTitle] = useState("QuickTools - Practical Browser Tools");
  const [description, setDescription] = useState("Fast tools for finance, work, development, images, and PDFs.");
  const [url, setUrl] = useState("https://example.com/");
  const tags = `<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${escapeHtml(url)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${escapeHtml(url)}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />`;
  return <Panel inputs={<><Field label="Page title" value={title} onChange={setTitle} type="text" /><TextBox label="Description" value={description} onChange={setDescription} /><Field label="Canonical URL" value={url} onChange={setUrl} type="url" /></>} result={<Output title="Meta tags" text={tags} />} />;
}

function ImageTool({ id }: { id: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]), [quality, setQuality] = useState("0.75"), [w, setW] = useState("1200"), [h, setH] = useState(""), [format, setFormat] = useState("image/webp");
  const [links, setLinks] = useState<Array<{ name: string; url: string; original: number; output: number }>>([]), [msg, setMsg] = useState("");
  const outputFormats = [
    ["image/webp", "WebP"],
    ["image/jpeg", "JPG"],
    ["image/png", "PNG"],
    ["image/avif", "AVIF"]
  ];
  const sizePresets = [
    ["YouTube Thumbnail", 1280, 720],
    ["Instagram Square", 1080, 1080],
    ["Instagram Story", 1080, 1920],
    ["TikTok Cover", 1080, 1920],
    ["Facebook Cover", 1640, 924],
    ["X Header", 1500, 500],
    ["LinkedIn Banner", 1584, 396],
    ["Open Graph", 1200, 630],
    ["Website Favicon", 512, 512]
  ];
  async function run() {
    setMsg(""); setLinks([]);
    if (!files.length) return setMsg("Choose at least one image.");
    try {
      const outputQuality = clamp(+quality || 0.75, 0.1, 1);
      setQuality(String(outputQuality));
      if (id === "image-pdf") {
        const pdf = new jsPDF();
        for (let i = 0; i < files.length; i++) {
          const data = await fileToDataUrl(files[i]);
          const img = await loadImage(data);
          if (i) pdf.addPage();
          const pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight();
          const ratio = Math.min(pageW / img.width, pageH / img.height);
          pdf.addImage(data, "JPEG", (pageW - img.width * ratio) / 2, 10, img.width * ratio, img.height * ratio);
        }
        const url = URL.createObjectURL(pdf.output("blob"));
        return setLinks([{ name: "images.pdf", url, original: files.reduce((sum, file) => sum + file.size, 0), output: pdf.output("blob").size }]);
      }
      const mime = id === "jpg-png" ? "image/png" : id === "compress" ? format : "image/jpeg";
      const converted = await Promise.all(files.map(async (file) => {
        const data = await fileToDataUrl(file);
        const img = await loadImage(data);
        const shouldResize = id === "resize" || id === "compress";
        const maxWidth = +w || img.width;
        const width = id === "resize" ? maxWidth : shouldResize ? Math.min(maxWidth, img.width) : img.width;
        const height = shouldResize && +h ? +h : Math.round(img.height * (width / img.width));
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas is unavailable.");
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, width, height); ctx.drawImage(img, 0, 0, width, height);
        const blob = await canvasToBlob(canvas, mime, outputQuality);
        if (!blob || blob.type !== mime) throw new Error(`${mime} is not supported by this browser.`);
        const url = URL.createObjectURL(blob);
        const ext = mime.split("/")[1];
        return { name: `${file.name.replace(/\.[^.]+$/, "")}.${ext}`, url, original: file.size, output: blob.size };
      }));
      setLinks(converted);
    } catch (error) {
      setMsg(id === "heic-jpg" ? "This browser cannot decode HEIC. Try Safari or add a server converter later." : error instanceof Error ? error.message : "Unable to process this image.");
    }
  }
  return <div className="tool-grid"><section className="panel"><input ref={inputRef} type="file" multiple accept="image/*,.heic,.heif" onChange={(e) => setFiles(Array.from(e.target.files || []))} /><button className="upload" onClick={() => inputRef.current?.click()}><ImageIcon size={22} /> Choose images</button><p className="muted">{files.length ? files.map((f) => f.name).join(", ") : "No image selected"}</p>{id === "compress" && <label className="field"><span>Output format</span><select value={format} onChange={(e) => setFormat(e.target.value)}>{outputFormats.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>}{id === "resize" && <div className="preset-grid">{sizePresets.map(([label, width, height]) => <button className={+w === width && +h === height ? "preset active" : "preset"} key={label} onClick={() => { setW(String(width)); setH(String(height)); }}><strong>{label}</strong><small>{width} x {height}</small></button>)}</div>}{(id === "compress" || id === "resize") && <div className="two"><Field label={id === "compress" ? "Quality 0.1 - 1" : "Width"} value={id === "compress" ? quality : w} onChange={id === "compress" ? (value) => setQuality(clamp(Number(value), 0.1, 1).toString()) : setW} step="0.05" min={id === "compress" ? "0.1" : "1"} max={id === "compress" ? "1" : undefined} /><Field label={id === "compress" ? "Max width" : "Height"} value={id === "compress" ? w : h} onChange={id === "compress" ? setW : setH} min="1" /><Field label={id === "compress" ? "Height optional" : "Quality"} value={id === "compress" ? h : quality} onChange={id === "compress" ? setH : (value) => setQuality(clamp(Number(value), 0.1, 1).toString())} step="0.05" min={id === "compress" ? "1" : "0.1"} max={id === "compress" ? undefined : "1"} /></div>}<button className="primary" onClick={run}>Process</button></section><section className="panel">{msg && <p className="warning"><AlertTriangle size={16} /> {msg}</p>}{links.map((link) => <div className="download-row" key={link.url}><a className="download" href={link.url} download={link.name}><Download size={18} /> {link.name}</a><small>{compressionSummary(link.original, link.output)}</small></div>)}</section></div>;
}

function PdfTool({ id }: { id: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("Choose a PDF file to begin.");
  const [text, setText] = useState("");
  const [downloads, setDownloads] = useState<Array<{ name: string; url: string; note?: string }>>([]);

  async function mergePdfs() {
    setDownloads([]);
    setText("");
    if (files.length < 2) return setStatus("Choose at least two PDF files.");
    try {
      setStatus("Merging PDFs...");
      const merged = await PDFDocument.create();
      for (const pdfFile of files) {
        const source = await PDFDocument.load(await pdfFile.arrayBuffer());
        const copied = await merged.copyPages(source, source.getPageIndices());
        copied.forEach((page) => merged.addPage(page));
      }
      const bytes = await merged.save({ useObjectStreams: true });
      setDownloads([{ name: "merged.pdf", url: URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })), note: `${files.length} PDFs combined` }]);
      setStatus("PDFs merged successfully.");
    } catch {
      setStatus("Unable to merge these PDFs. Password-protected files are not supported.");
    }
  }

  async function compressPdf() {
    setDownloads([]);
    setText("");
    if (!file) return setStatus("Choose a PDF file first.");
    try {
      setStatus("Optimizing PDF...");
      const source = await PDFDocument.load(await file.arrayBuffer());
      const bytes = await source.save({ useObjectStreams: true, addDefaultPage: false });
      const blob = new Blob([bytes], { type: "application/pdf" });
      setDownloads([{ name: `${file.name.replace(/\.pdf$/i, "") || "compressed"}-optimized.pdf`, url: URL.createObjectURL(blob), note: compressionSummary(file.size, blob.size) }]);
      setStatus("PDF optimized. This browser version rewrites the file structure; image-heavy PDFs may need server compression for stronger results.");
    } catch {
      setStatus("Unable to optimize this PDF. Password-protected files are not supported.");
    }
  }

  async function pdfToJpg() {
    setDownloads([]);
    setText("");
    if (!file) return setStatus("Choose a PDF file first.");
    try {
      setStatus("Rendering PDF pages...");
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const rendered: Array<{ name: string; url: string; note?: string }> = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas is unavailable.");
        await page.render({ canvasContext: context, viewport }).promise;
        const blob = await canvasToBlob(canvas, "image/jpeg", 0.9);
        if (!blob) throw new Error("Unable to render JPG.");
        rendered.push({ name: `${file.name.replace(/\.pdf$/i, "")}-page-${pageNumber}.jpg`, url: URL.createObjectURL(blob), note: formatBytes(blob.size) });
      }
      setDownloads(rendered);
      setStatus(`Rendered ${pdf.numPages} page${pdf.numPages === 1 ? "" : "s"}.`);
    } catch {
      setStatus("Unable to convert this PDF to JPG.");
    }
  }

  async function readPdf() {
    setDownloads([]);
    setText("");
    if (!file) {
      setStatus("Choose a PDF file first.");
      return;
    }

    try {
      setStatus("Reading PDF...");
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const pages: string[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => "str" in item ? item.str : "").join(" ").replace(/\s+/g, " ").trim();
        pages.push(pageText);
      }

      const fullText = pages.map((page, index) => `Page ${index + 1}\n${page}`).join("\n\n");
      setText(fullText || "No selectable text found. This may be a scanned PDF.");
      setStatus(`Read ${pdf.numPages} page${pdf.numPages === 1 ? "" : "s"}.`);

      if (id === "pdf-word") {
        const doc = new Document({
          sections: [{
            children: fullText.split("\n").map((line) => new Paragraph({ children: [new TextRun(line || " ")] }))
          }]
        });
        const blob = await Packer.toBlob(doc);
        setDownloads([{ name: `${file.name.replace(/\.pdf$/i, "") || "converted"}.docx`, url: URL.createObjectURL(blob), note: formatBytes(blob.size) }]);
      }

      if (id === "pdf-text") {
        const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
        setDownloads([{ name: `${file.name.replace(/\.pdf$/i, "") || "extracted"}.txt`, url: URL.createObjectURL(blob), note: formatBytes(blob.size) }]);
      }
    } catch {
      setStatus("Unable to read this PDF. Password-protected, scanned, or damaged PDFs may need a server/OCR converter.");
    }
  }

  async function inspectPdf() {
    setDownloads([]);
    setText("");
    if (!file) {
      setStatus("Choose a PDF file first.");
      return;
    }

    try {
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const meta = await pdf.getMetadata().catch(() => null);
      const info = meta && "info" in meta ? meta.info as Record<string, unknown> : {};
      setStatus("PDF metadata loaded.");
      setText([
        `File: ${file.name}`,
        `Size: ${formatBytes(file.size)}`,
        `Pages: ${pdf.numPages}`,
        `Title: ${String(info.Title || "-")}`,
        `Author: ${String(info.Author || "-")}`,
        `Creator: ${String(info.Creator || "-")}`,
        `Producer: ${String(info.Producer || "-")}`
      ].join("\n"));
    } catch {
      setStatus("Unable to inspect this PDF.");
    }
  }

  const isMulti = id === "pdf-merge";
  const action = id === "pdf-info" ? inspectPdf : id === "pdf-merge" ? mergePdfs : id === "pdf-compress" ? compressPdf : id === "pdf-jpg" ? pdfToJpg : readPdf;
  const actionLabel = id === "pdf-word" ? "Convert to Word" : id === "pdf-text" ? "Extract Text" : id === "pdf-info" ? "Read PDF Info" : id === "pdf-merge" ? "Merge PDFs" : id === "pdf-compress" ? "Optimize PDF" : "Convert to JPG";
  return <div className="tool-grid"><section className="panel"><input ref={inputRef} type="file" multiple={isMulti} accept="application/pdf,.pdf" onChange={(event) => { const selected = Array.from(event.target.files || []); setFiles(selected); setFile(selected[0] || null); }} /><button className="upload" onClick={() => inputRef.current?.click()}><FileText size={22} /> Choose PDF{isMulti ? "s" : ""}</button><p className="muted">{files.length ? files.map((item) => `${item.name} · ${formatBytes(item.size)}`).join(", ") : "No PDF selected"}</p><button className="primary" onClick={action}>{actionLabel}</button><p className="muted">Text-based PDFs work best for Word/Text extraction. Scanned PDFs need OCR, which can be added later with a backend service.</p></section><section className="panel"><p className={status.startsWith("Unable") ? "warning" : "muted"}>{status}</p>{downloads.map((item) => <div className="download-row" key={item.url}><a className="download" href={item.url} download={item.name}><Download size={18} /> {item.name}</a>{item.note && <small>{item.note}</small>}</div>)}{text && <Output title={id === "pdf-info" ? "PDF Info" : "Extracted text"} text={text} />}</section></div>;
}

function Panel({ inputs, result }: { inputs: React.ReactNode; result: React.ReactNode }) {
  return <div className="tool-grid"><section className="panel">{inputs}</section><section className="panel">{result}</section></div>;
}

function Output({ title, text, error = false }: { title: string; text: string; error?: boolean }) {
  return <div><div className="output-head"><strong>{title}</strong><CopyButton text={text} /></div><pre className={error ? "error" : ""}>{text}</pre></div>;
}

function Timezone() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16)), [from, setFrom] = useState("UTC"), [to, setTo] = useState("America/New_York");
  const d = new Date(date);
  return <Panel inputs={<><Field label="Date and time" type="datetime-local" value={date} onChange={setDate} /><Field label="From timezone" value={from} onChange={setFrom} type="text" /><Field label="To timezone" value={to} onChange={setTo} type="text" /></>} result={<Result items={[["Source", d.toLocaleString(undefined, { timeZone: from })], ["Converted", d.toLocaleString(undefined, { timeZone: to })]]} />} />;
}

function WorkHours() {
  const [start, setStart] = useState("09:00"), [end, setEnd] = useState("18:00"), [breaks, setBreaks] = useState("60");
  const mins = (Number(end.slice(0, 2)) * 60 + Number(end.slice(3))) - (Number(start.slice(0, 2)) * 60 + Number(start.slice(3))) - Number(breaks);
  return <Panel inputs={<><Field label="Start" type="time" value={start} onChange={setStart} /><Field label="End" type="time" value={end} onChange={setEnd} /><Field label="Break minutes" value={breaks} onChange={setBreaks} /></>} result={<Result items={[["Total hours", `${num(mins / 60)} h`], ["Total minutes", `${mins} min`]]} />} />;
}

function Deadline() {
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10)), [days, setDays] = useState("14"), [work, setWork] = useState("true");
  let d = new Date(start), left = Number(days);
  while (left > 0) { d.setDate(d.getDate() + 1); if (work !== "true" || (d.getDay() !== 0 && d.getDay() !== 6)) left--; }
  return <Panel inputs={<><Field label="Start date" type="date" value={start} onChange={setStart} /><Field label="Days to add" value={days} onChange={setDays} /><label className="check"><input type="checkbox" checked={work === "true"} onChange={(e) => setWork(String(e.target.checked))} /> Workdays only</label></>} result={<Result items={[["Deadline", d.toLocaleDateString()], ["Mode", work === "true" ? "Workdays" : "Calendar days"]]} />} />;
}

function safeBase64(value: string) { try { return decodeURIComponent(escape(atob(value))); } catch { return "Input is not valid Base64"; } }
function safeDecode(value: string) { try { return decodeURIComponent(value); } catch { return "Input is not valid encoded URL text"; } }
function capitalize(value: string) { return value ? value.charAt(0).toUpperCase() + value.slice(1) : ""; }
function csvToJson(csv: string) {
  const rows = csv.trim().split(/\r?\n/).filter(Boolean).map(parseCsvLine);
  const headers = rows.shift();
  if (!headers?.length) return [];
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
}
function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index++) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}
function hexToRgb(hex: string) {
  const normalized = hex.trim().replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
  const number = parseInt(value, 16);
  return { r: (number >> 16) & 255, g: (number >> 8) & 255, b: number & 255 };
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function fileToDataUrl(file: File) { return new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(file); }); }
function loadImage(src: string) { return new Promise<HTMLImageElement>((res, rej) => { const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = src; }); }
function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}
function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024 * 1024) return `${num(bytes / 1024, 1)} KB`;
  return `${num(bytes / 1024 / 1024, 2)} MB`;
}
function compressionSummary(original: number, output: number) {
  const change = (1 - output / original) * 100;
  const label = change >= 0 ? `${num(change)}% smaller` : `${num(Math.abs(change))}% larger`;
  return `${formatBytes(original)} to ${formatBytes(output)} (${label})`;
}

function App() {
  const initial = stateFromPath();
  const [query, setQuery] = useState(""), [active, setActive] = useState<Tool | null>(initial.active), [cat, setCat] = useState<Category | "All">(initial.cat);
  const [mode, setMode] = useState<PageMode>(initial.mode);
  const popular = ["pdf-word", "pdf-merge", "compress", "qr-code", "json-format"].map((id) => tools.find((tool) => tool.id === id)!).filter(Boolean);
  const recent = ["pdf-jpg", "pdf-compress", "csv-json", "color", "meta-tags"].map((id) => tools.find((tool) => tool.id === id)!).filter(Boolean);
  const visible = useMemo(() => {
    const modeTools = mode === "popular" ? popular : mode === "new" ? recent : mode === "bookmarks" ? [] : tools;
    return modeTools.filter((t) => (cat === "All" || t.category === cat) && `${t.name} ${t.description}`.toLowerCase().includes(query.toLowerCase()));
  }, [query, cat, mode]);
  const grouped = useMemo(() => categories.map((category) => ({
    category,
    items: visible.filter((tool) => tool.category === category)
  })).filter((group) => group.items.length > 0), [visible]);
  const openTool = (tool: Tool) => {
    setActive(tool);
    const path = toolPath(tool);
    updatePath(path);
    document.title = `${tool.name} - QuickTools`;
    trackPageView(path);
    trackToolOpen(tool.name, tool.category);
  };
  const showHome = (nextMode: PageMode = "categories", nextCat: Category | "All" = "All") => {
    setActive(null);
    setMode(nextMode);
    setCat(nextCat);
    const path = nextMode === "categories" && nextCat !== "All" ? `/category/${nextCat.toLowerCase()}` : nextMode === "categories" ? "/" : `/${nextMode}`;
    updatePath(path);
    document.title = "QuickTools - Finance, Work, Developer and Image Tools";
    trackPageView(path);
  };
  useEffect(() => {
    const syncRoute = () => {
      const next = stateFromPath();
      setActive(next.active);
      setMode(next.mode);
      setCat(next.cat);
      document.title = next.active ? `${next.active.name} - QuickTools` : "QuickTools - Finance, Work, Developer and Image Tools";
      trackPageView();
    };
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  const pageTitle = mode === "all-tools" ? "All Tools" : mode === "popular" ? "Popular Tools" : mode === "new" ? "New Tools" : mode === "bookmarks" ? "Bookmarks" : mode === "blog" ? "Blog" : mode === "about" ? "About Toolly" : mode === "privacy-policy" ? "Privacy Policy" : mode === "terms" ? "Terms of Service" : mode === "contact" ? "Contact" : "Categories";
  const pageDescription = mode === "all-tools" ? "Browse every calculator, converter, image, PDF, work, and developer tool." : mode === "blog" ? "Product notes and practical workflow ideas." : mode === "about" ? "A fast, private toolbox for everyday browser work." : mode === "privacy-policy" ? "How Toolly handles analytics, cookies, advertising, and uploaded files." : mode === "terms" ? "Usage terms for Toolly calculators, converters, and file tools." : mode === "contact" ? "Get in touch about Toolly, feedback, or support." : "Find tools by category.";
  const isInfoMode = mode === "blog" || mode === "about" || mode === "privacy-policy" || mode === "terms" || mode === "contact";

  if (active) {
    const renderer = active.category === "Finance" ? <FinanceTool key={active.id} id={active.id} /> : active.category === "Work" ? <WorkTool id={active.id} /> : active.category === "Developer" ? <DeveloperTool id={active.id} /> : active.category === "Image" ? <ImageTool id={active.id} /> : <PdfTool id={active.id} />;
    const Icon = categoryMeta[active.category].icon;
    return <Shell query={query} setQuery={setQuery} cat={cat} setCat={setCat} grouped={grouped} active={active} openTool={openTool} mode={mode} showHome={showHome}><section className="tool-workspace"><header className="tool-header"><button className="ghost-btn" onClick={() => showHome()}><Grid3X3 size={16} /> Categories</button><div><p className="eyebrow">{active.category}</p><h2><Icon size={28} /> {active.name}</h2><p>{active.description}</p></div></header>{renderer}<ToolGuide id={active.id} /></section></Shell>;
  }

  return <Shell query={query} setQuery={setQuery} cat={cat} setCat={setCat} grouped={grouped} active={active} openTool={openTool} mode={mode} showHome={showHome}><section className="home-content"><div className="page-title"><div><h2>{pageTitle}</h2><p>{pageDescription}</p></div><div className="view-tools"><button className="active"><Grid3X3 size={17} /></button><button><List size={17} /></button></div></div>{isInfoMode ? <InfoPage mode={mode} /> : <><label className="wide-search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools..." /></label><div className="filter-row">{["All", "Popular", "New", "Free", "No Sign Up", "AI Powered", "Mobile Friendly"].map((item) => <button className={(item === "All" && mode === "all-tools") || (item === "Popular" && mode === "popular") || (item === "New" && mode === "new") ? "active" : ""} onClick={() => item === "Popular" ? showHome("popular") : item === "New" ? showHome("new") : showHome("all-tools")} key={item}>{item === "Popular" && <Flame size={14} />}{item === "New" && <Sparkles size={14} />}{item}</button>)}</div><SectionTitle title={mode === "categories" && cat === "All" ? "Popular Categories" : cat === "All" ? "All Tools" : `${cat} Tools`} />{cat === "All" && mode === "categories" ? <div className="category-grid">{categories.map((category) => { const meta = categoryMeta[category]; const Icon = meta.icon; const count = tools.filter((tool) => tool.category === category).length; return <button className="category-card" key={category} onClick={() => showHome("categories", category)}><span className="category-icon" style={{ background: meta.soft, color: meta.color }}><Icon size={30} /></span><strong>{category} Tools</strong><small>{count} tools</small><p>{category === "Finance" ? "Calculate salary, loans and returns" : category === "Work" ? "Plan time and improve productivity" : category === "Developer" ? "Format, decode and convert code data" : category === "PDF" ? "Convert, extract and inspect PDF files" : "Edit, convert and optimize images"}</p></button>; })}</div> : <ToolCardGrid tools={visible} openTool={openTool} />}{cat === "All" && mode === "categories" && <button className="center-link" onClick={() => showHome("all-tools")}>View all {tools.length} tools <ArrowRight size={16} /></button>}<SectionTitle title="Recently Added Tools" action="View all new tools" onAction={() => showHome("new")} /><div className="recent-grid">{recent.map((tool) => { const Icon = categoryMeta[tool.category].icon; return <button className="mini-card" key={tool.id} onClick={() => openTool(tool)}><span>New</span><Icon size={23} /><strong>{tool.name}</strong><small>{tool.description}</small></button>; })}</div><div className="feature-strip"><Feature icon={Gift} title="100% Free" text="All tools are completely free" /><Feature icon={Zap} title="No Sign Up Required" text="Use tools instantly" /><Feature icon={ShieldCheck} title="Secure & Private" text="Your data stays in your browser" /><Feature icon={Smartphone} title="Mobile Friendly" text="Works on all devices" /></div></>}</section><RightRail popular={popular} openTool={openTool} showHome={showHome} /></Shell>;
}

function Shell({ children, query, setQuery, cat, setCat, grouped, active, openTool, mode, showHome }: { children: React.ReactNode; query: string; setQuery: (v: string) => void; cat: Category | "All"; setCat: (v: Category | "All") => void; grouped: Array<{ category: Category; items: Tool[] }>; active: Tool | null; openTool: (tool: Tool) => void; mode: PageMode; showHome: (mode?: PageMode, cat?: Category | "All") => void }) {
  const topLinks: Array<{ label: string; mode: PageMode }> = [{ label: "All Tools", mode: "all-tools" }, { label: "Categories", mode: "categories" }, { label: "Blog", mode: "blog" }, { label: "About", mode: "about" }, { label: "Contact", mode: "contact" }];
  const quickAction = (label: string) => label === "Popular" ? showHome("popular") : label === "New Tools" ? showHome("new") : label === "Bookmarks" ? showHome("bookmarks") : showHome("all-tools");
  return <div className="app-shell"><nav className="topbar"><button className="logo" onClick={() => showHome()}><span>T</span><strong>Toolly</strong></button><div className="top-links">{topLinks.map((item) => <button className={(item.label === "Categories" ? mode === "categories" && cat === "All" : mode === item.mode) ? "active" : ""} onClick={() => showHome(item.mode)} key={item.label}>{item.label}</button>)}</div><div className="top-actions"><button className="round-btn" title="Theme"><Moon size={18} /></button><label className="top-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools..." /></label><button className="favorite-btn" onClick={() => showHome("bookmarks")}><Star size={16} /> Favorites</button></div></nav><div className="layout"><aside className="sidebar"><h3>Categories</h3><div className="quick-menu">{sidebarItems.map((item) => { const Icon = item.icon; const isActive = (item.label === "All Tools" && mode === "all-tools") || (item.label === "Popular" && mode === "popular") || (item.label === "New Tools" && mode === "new") || (item.label === "Bookmarks" && mode === "bookmarks"); return <button className={isActive ? "active" : ""} key={item.label} onClick={() => quickAction(item.label)}><Icon size={17} /><span>{item.label}</span><small>{item.count}</small></button>; })}</div><div className="divider" /><div className="tool-list">{grouped.map((group) => { const MetaIcon = categoryMeta[group.category].icon; return <section className="tool-section" key={group.category}><button className={cat === group.category ? "category-row active" : "category-row"} onClick={() => showHome("categories", group.category)}><MetaIcon size={17} /><span>{group.category}</span><small>{group.items.length}</small></button>{group.items.map((tool) => <a href={toolPath(tool)} key={tool.id} className={active?.id === tool.id ? "tool active" : "tool"} onClick={(event) => { event.preventDefault(); openTool(tool); }}><span>{tool.name}</span></a>)}</section>; })}</div><nav className="legal-links"><button onClick={() => showHome("privacy-policy")}>Privacy Policy</button><button onClick={() => showHome("terms")}>Terms</button><button onClick={() => showHome("contact")}>Contact</button></nav><div className="install-card"><Smartphone size={32} /><strong>Add Toolly to Home Screen</strong><p>Quick access to your favorite tools.</p><button onClick={() => showHome("bookmarks")}>Add Now</button></div></aside><main className="main-area">{children}</main></div></div>;
}

function ToolGuide({ id }: { id: string }) {
  if (id === "heic-jpg") {
    return <section className="tool-guide"><h3>How to convert a HEIC file to JPG</h3><ol><li>Choose one or more HEIC photos.</li><li>Click Process. The file stays in your browser.</li><li>Download the JPG.</li></ol><h3>Questions</h3><h4>How do I change a photo from HEIC to JPG?</h4><p>Use this HEIC file convert to JPG tool, choose the iPhone photo, then process and download the JPEG.</p><h4>Can this compress HEIC to JPG?</h4><p>The download is a JPEG saved at reduced quality, so the HEIC photo usually comes out as a smaller JPG.</p><h4>Which browser can open HEIC?</h4><p>Safari decodes HEIC most reliably. If this browser cannot read the file, the tool will tell you.</p></section>;
  }
  if (id === "timezone") {
    return <section className="tool-guide"><h3>How to convert UTC to EST</h3><ol><li>Enter the date and time.</li><li>Set From timezone to UTC.</li><li>Set To timezone to America/New_York.</li></ol><p>This UTC to EST converter uses US Eastern Time. Winter dates show EST (UTC−5). Summer dates show EDT (UTC−4). Type America/New_York, not the abbreviation EST.</p></section>;
  }
  if (id === "timestamp") {
    return <section className="tool-guide"><h3>How to use this Unix date converter</h3><ol><li>Paste a Unix timestamp in seconds.</li><li>Read the local date and the ISO date.</li><li>Leave the field as-is to see the current Unix time.</li></ol><h3>Questions</h3><h4>What does a Unix date converter do?</h4><p>It turns a Unix timestamp, counted in seconds from 1 January 1970 UTC, into a readable local date and an ISO date.</p><h4>Can I paste milliseconds?</h4><p>Use seconds. A millisecond value is 1000 times too large for this converter.</p></section>;
  }
  if (id === "uuid") {
    return <section className="tool-guide"><h3>How to use this UUID generator</h3><ol><li>Six random UUID v4 values appear when the page opens.</li><li>Click Generate again for a new set.</li><li>Copy the identifier you need.</li></ol><h3>Questions</h3><h4>Is this a random UUID generator?</h4><p>Yes. It uses the browser random UUID function, which returns version 4 identifiers.</p><h4>Can it create UUID v5 or v7?</h4><p>No. This online UUID generator only creates random UUID v4 values.</p></section>;
  }
  if (id === "roi") {
    return <section className="tool-guide"><h3>How to use this ROI calculator</h3><ol><li>Enter the initial investment.</li><li>Enter the final value.</li><li>Read the net return and the ROI percentage.</li></ol><p>Net return = final value − initial investment. ROI = net return ÷ initial investment × 100. An investment of $1,000 that becomes $1,250 has a $250 net return and a 25% ROI.</p><h3>Questions</h3><h4>Does this ROI calculator handle a time period?</h4><p>No. It compares two amounts. It does not annualize the return or model website, email, or real-estate costs.</p></section>;
  }
  if (id === "discount") {
    return <section className="tool-guide"><h3>How to use this discount calculator</h3><ol><li>Enter the original price.</li><li>Enter the discount percent.</li><li>Read the sale price and the amount you save.</li></ol><p>Sale price = original price × (1 − discount ÷ 100). Amount saved = original price × discount ÷ 100. A $50 item at 20% off costs $40, so you save $10.</p><h3>Questions</h3><h4>Does this discount calculator add tax?</h4><p>No. It only applies one percent off the original price.</p><h4>Can it stack a double or triple discount?</h4><p>No. Enter one discount percent at a time.</p></section>;
  }
  if (id === "hourly") {
    return <section className="tool-guide"><h3>How to convert hourly to salary</h3><ol><li>Enter the hourly rate.</li><li>Enter hours per week. Full time is usually 40.</li><li>Enter weeks per year. A full year is usually 52.</li></ol><p>Annual salary = hourly rate × hours per week × weeks per year. The page also shows monthly and weekly pay.</p><p>At 40 hours and 52 weeks, 15 hourly to salary is $31,200, 20 hourly to salary is $41,600, 25 hourly to salary is $52,000, 30 hourly to salary is $62,400, 35 hourly to salary is $72,800, and 40.75 hourly to salary is $84,760.</p><h3>Questions</h3><h4>Can this turn a salary into an hourly rate?</h4><p>No. Enter an hourly rate to get annual, monthly, and weekly salary.</p></section>;
  }
  if (id === "pdf-jpg") {
    return <section className="tool-guide"><h3>How to make a PDF a JPG</h3><ol><li>Choose a PDF file.</li><li>Click Convert to JPG. Each page is rendered in your browser.</li><li>Download a separate JPG for every page.</li></ol><h3>Questions</h3><h4>How do I change a PDF to a JPG file on a Mac?</h4><p>Open this PDF format to JPG tool in Chrome or Safari, choose the PDF, and download the JPG pages. It is not an API.</p></section>;
  }
  if (id === "image-pdf") {
    return <section className="tool-guide"><h3>How to combine JPG to PDF</h3><ol><li>Choose one or more JPG files.</li><li>Click Process.</li><li>Download one PDF. Each JPG is placed on its own page.</li></ol><h3>Questions</h3><h4>Can I merge JPG files into one PDF?</h4><p>Yes. Select several JPG files and this JPG to PDF converter puts them into a single PDF.</p></section>;
  }
  if (id === "jpg-png") {
    return <section className="tool-guide"><h3>How to convert JPG to PNG online</h3><ol><li>Choose one JPG, or several for a batch convert.</li><li>Click Process. The files stay in your browser.</li><li>Download each PNG.</li></ol><h3>Questions</h3><h4>Is this JPG to PNG converter online free?</h4><p>Yes. There is no signup and no upload to a server.</p><h4>Can I batch convert JPG to PNG?</h4><p>Yes. Select multiple JPG files and process them together.</p></section>;
  }
  if (id === "png-jpg") {
    return <section className="tool-guide"><h3>How to convert PNG to JPG on a Mac</h3><ol><li>Open this page in Chrome or Safari on a Mac, iPhone, or any other device.</li><li>Choose one PNG, or several to mass convert PNG to JPG.</li><li>Click Process and download the JPG files.</li></ol><h3>Questions</h3><h4>Can I batch convert PNG to JPG?</h4><p>Yes. Select multiple PNG files at once.</p><h4>What happens to a transparent background?</h4><p>JPG does not support transparency. Transparent pixels are saved on a white background.</p></section>;
  }
  if (id === "webp-jpg") {
    return <section className="tool-guide"><h3>How to save a WebP as JPG</h3><ol><li>Choose one WebP, or several for a batch convert.</li><li>Click Process. The files stay in your browser.</li><li>Download each JPG.</li></ol><h3>Questions</h3><h4>Is this WebP to JPG converter free?</h4><p>Yes. There is no signup and no upload to a server.</p><h4>Can I bulk convert WebP to JPG?</h4><p>Yes. Select multiple WebP files and process them together.</p></section>;
  }
  if (id === "color") {
    return <section className="tool-guide"><h3>How to use this HEX to RGB converter</h3><ol><li>Enter a HEX code, such as #6B4DF6, or pick a color.</li><li>Read the RGB values and the HSL values.</li></ol><h3>Questions</h3><h4>How do I convert a hex code to RGB?</h4><p>Paste the hex code into this HEX to RGB converter. It splits the code into red, green, and blue from 0 to 255.</p><h4>Can I type an RGB color to get HEX?</h4><p>No. The input is a HEX code. The result shows RGB and HSL.</p></section>;
  }
  if (id === "meeting") {
    return <section className="tool-guide"><h3>How to use the meeting cost calculator</h3><ol><li>Enter how many people are in the meeting.</li><li>Enter the average hourly cost for one person.</li><li>Enter the length in minutes.</li></ol><p>Cost = people × hourly cost × hours. The page also shows the cost per minute.</p><h3>Questions</h3><h4>What does a cost of meeting calculator measure?</h4><p>It turns attendance, pay, and duration into one number, so you can see what the meeting costs before you book it.</p><h4>Does this connect to Google Calendar?</h4><p>No. Type the people, rate, and minutes yourself. It does not read your calendar.</p></section>;
  }
  return null;
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <div className="section-title"><h3>{title}</h3>{action && <button onClick={onAction}>{action} <ArrowRight size={15} /></button>}</div>;
}

function Feature({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return <div><Icon size={24} /><span><strong>{title}</strong><small>{text}</small></span></div>;
}

function ToolCardGrid({ tools, openTool }: { tools: Tool[]; openTool: (tool: Tool) => void }) {
  if (!tools.length) return <div className="empty-state"><Bookmark size={28} /><strong>No tools here yet</strong><p>Choose another category or clear your search.</p></div>;
  return <div className="tool-card-grid">{tools.map((tool) => { const Icon = categoryMeta[tool.category].icon; return <a href={toolPath(tool)} className="wide-tool-card" key={tool.id} onClick={(event) => { event.preventDefault(); openTool(tool); }}><Icon size={22} /><span><strong>{tool.name}</strong><small>{tool.description}</small></span><ArrowRight size={16} /></a>; })}</div>;
}

function InfoPage({ mode }: { mode: PageMode }) {
  if (mode === "blog") return <div className="info-card"><Clock3 size={32} /><h3>Tool guides are coming soon</h3><p>Later this area can hold SEO articles like salary calculation guides, JSON workflow tips, image compression tutorials, and PDF conversion notes.</p></div>;
  if (mode === "about") return <div className="info-card content-page"><ShieldCheck size={32} /><h3>Simple, private browser tools</h3><p>Toolly is a free online toolbox for calculators, work utilities, developer helpers, image tools, and PDF tools. The goal is to make common daily tasks fast without requiring an account.</p><p>Most calculators and file tools run directly in your browser. That means text, images, and PDFs are processed locally whenever the tool supports it.</p></div>;
  if (mode === "privacy-policy") return <div className="info-card content-page"><ShieldCheck size={32} /><h3>Privacy Policy</h3><p>Toolly provides free online calculators, developer tools, image utilities, and PDF utilities at tools.jiandengcun.com.</p><h4>Analytics and cookies</h4><p>We use Google Analytics to understand traffic, page usage, device types, and tool popularity. Google Analytics may use cookies or similar technologies to collect aggregated usage data.</p><h4>Advertising</h4><p>If Google AdSense or other advertising services are enabled, third-party vendors including Google may use cookies to serve ads based on prior visits to this or other websites. Users can manage personalized advertising in their Google ad settings.</p><h4>Uploaded files</h4><p>Image and PDF tools are designed to process files in the browser where possible. We do not ask users to create accounts or intentionally collect uploaded files for storage.</p><h4>Contact</h4><p>For privacy questions, email gaoxiangfengcd@gmail.com.</p></div>;
  if (mode === "terms") return <div className="info-card content-page"><FileText size={32} /><h3>Terms of Service</h3><p>By using Toolly, you agree to use the tools for lawful, personal, or business productivity purposes.</p><h4>Accuracy</h4><p>Finance calculators, work calculators, converters, and file utilities are provided for general information and convenience. Results may vary and should not be treated as legal, financial, tax, or professional advice.</p><h4>User responsibility</h4><p>You are responsible for checking results before relying on them. Do not upload or process content that you do not have the right to use.</p><h4>Availability</h4><p>We may update, change, or remove tools to improve quality, performance, or reliability.</p><h4>Contact</h4><p>Questions about these terms can be sent to gaoxiangfengcd@gmail.com.</p></div>;
  if (mode === "contact") return <div className="info-card content-page"><Mail size={32} /><h3>Contact Toolly</h3><p>For feedback, bug reports, feature requests, privacy questions, or advertising inquiries, contact us by email.</p><p><strong>Email:</strong> <a href="mailto:gaoxiangfengcd@gmail.com">gaoxiangfengcd@gmail.com</a></p><p>Please include the tool name, browser, device, and a short description if you are reporting a problem.</p></div>;
  return null;
}

function RightRail({ popular, openTool, showHome }: { popular: Tool[]; openTool: (tool: Tool) => void; showHome: (mode?: PageMode, cat?: Category | "All") => void }) {
  return <aside className="right-rail"><section className="rail-card"><h3>Popular Tools</h3>{popular.map((tool) => { const Icon = categoryMeta[tool.category].icon; return <button key={tool.id} onClick={() => openTool(tool)}><Icon size={18} /><span>{tool.name}</span></button>; })}<button className="rail-link" onClick={() => showHome("popular")}>View all popular tools <ArrowRight size={15} /></button></section><section className="rail-card"><h3>Trending Searches</h3><div className="chips">{["salary", "json formatter", "word counter", "jwt decoder", "image compressor", "loan calculator", "base64 encode", "resize image"].map((tag) => <button key={tag}>{tag}</button>)}</div></section></aside>;
}

initAnalytics();
createRoot(document.getElementById("root")!).render(<App />);
