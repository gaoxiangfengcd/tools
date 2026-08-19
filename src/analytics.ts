declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

export function initAnalytics() {
  if (!GA_ID || GA_ID === "G-XXXXXXXXXX") return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, {
    anonymize_ip: true
  });
}

export function trackToolOpen(toolName: string, category: string) {
  if (!window.gtag) return;

  window.gtag("event", "select_tool", {
    tool_name: toolName,
    tool_category: category
  });
}
