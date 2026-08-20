declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

export function initAnalytics() {
  window.dataLayer ||= [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  }
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
