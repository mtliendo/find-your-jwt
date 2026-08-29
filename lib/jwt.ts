export type JsonRecord = Record<string, unknown>;

export type DecodedJwt = {
  header: JsonRecord | null;
  payload: JsonRecord | null;
  headerText: string;
  payloadText: string;
  parseError?: string;
};

function padBase64(value: string) {
  const rem = value.length % 4;
  return rem === 0 ? value : value + "=".repeat(4 - rem);
}

export function base64UrlToUtf8(part: string): string {
  const normalized = padBase64(part.replace(/-/g, "+").replace(/_/g, "/"));
  if (typeof atob === "function") {
    return decodeURIComponent(
      Array.from(atob(normalized), (c) =>
        `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`,
      ).join(""),
    );
  }
  return Buffer.from(normalized, "base64").toString("utf8");
}

function prettyUnknown(value: unknown) {
  if (value === null || value === undefined) return String(value);
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function decodeJwt(raw: string): DecodedJwt {
  const parts = raw.split(".");
  if (parts.length < 2) {
    return {
      header: null,
      payload: null,
      headerText: "",
      payloadText: "",
      parseError: "Not a JWT-shaped string (need at least header.payload).",
    };
  }

  let header: JsonRecord | null = null;
  let payload: JsonRecord | null = null;
  let headerText = "";
  let payloadText = "";
  let parseError: string | undefined;

  try {
    headerText = base64UrlToUtf8(parts[0] ?? "");
    header = JSON.parse(headerText) as JsonRecord;
    headerText = prettyUnknown(header);
  } catch {
    parseError = "Header is not valid JSON.";
    headerText = parts[0] ?? "";
  }

  try {
    payloadText = base64UrlToUtf8(parts[1] ?? "");
    payload = JSON.parse(payloadText) as JsonRecord;
    payloadText = prettyUnknown(payload);
  } catch {
    parseError = parseError
      ? `${parseError} Payload is not valid JSON.`
      : "Payload is not valid JSON.";
    payloadText = parts[1] ?? "";
  }

  return { header, payload, headerText, payloadText, parseError };
}

export function readClaim(payload: JsonRecord | null, key: string) {
  if (!payload) return undefined;
  const value = payload[key];
  return typeof value === "string" ? value : undefined;
}
