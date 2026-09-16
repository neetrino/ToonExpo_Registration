export {};

declare global {
  interface Window {
    ym?: ((...args: unknown[]) => void) & { a?: unknown[]; l?: number };
    fbq?: (...args: unknown[]) => void;
  }
}
