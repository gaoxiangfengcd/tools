declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
let initialized = false;

export function initAnalytics() {
  if (!GA_ID || GA_ID === "G-XXXXXXXXXX" || initialized) return;
  initialized = true;

  window.dataLayer ||= [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", GA_ID, {
    anonymize_ip: true,
    send_page_view: false
  });
  trackPageView();
}

export function trackPageView(path = window.location.pathname + window.location.search) {
  if (!GA_ID || !window.gtag) return;

  window.gtag("event", "page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: path
  });
}

export function trackToolOpen(toolName: string, category: string) {
  if (!window.gtag) return;

  window.gtag("event", "select_tool", {
    tool_name: toolName,
    tool_category: category
  });
}
