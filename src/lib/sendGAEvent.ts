export type GAEventParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | GAEventParamValue[]
  | { [key: string]: GAEventParamValue };

export type GAEventParams = Record<string, GAEventParamValue>;

export function sendGAEvent(eventName: string, params?: GAEventParams): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}
