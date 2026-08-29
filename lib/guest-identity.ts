export const GUEST_COOKIE = "fyj_guest";
export const GUEST_HEADER = "x-fyj-guest";

export type GuestIdentity = {
  sub: string;
  email: string;
  name: string;
};

export const guestCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
  secure: process.env.NODE_ENV === "production",
};

function randomId() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function mintGuestIdentity(): GuestIdentity {
  const id = randomId();
  return {
    sub: `guest|${id}`,
    email: `guest.${id.slice(0, 8)}@focusotter.dev`,
    name: "Focus Guest",
  };
}

export function parseGuestIdentity(value: string | undefined | null) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<GuestIdentity>;
    if (
      typeof parsed.sub === "string" &&
      parsed.sub.startsWith("guest|") &&
      typeof parsed.email === "string" &&
      typeof parsed.name === "string"
    ) {
      return {
        sub: parsed.sub,
        email: parsed.email,
        name: parsed.name,
      } satisfies GuestIdentity;
    }
  } catch {
    return null;
  }
  return null;
}
