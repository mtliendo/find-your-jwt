import "server-only";
import { randomBytes } from "node:crypto";
import type { GuestIdentity } from "@/lib/guest-identity";

function encodePart(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

export function mintGuestToken(identity: GuestIdentity) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: randomBytes(20).toString("base64url"),
  };
  const payload = {
    nickname: "focus",
    name: identity.name,
    picture: "https://cdn.auth0.com/avatars/fo.png",
    updated_at: new Date(now * 1000).toISOString(),
    email: identity.email,
    email_verified: true,
    iss: "https://guest.find-your-jwt.focusotter.dev/",
    aud: "find-your-jwt-guest",
    iat: now,
    exp: now + 36_000,
    sub: identity.sub,
    sid: randomBytes(24).toString("base64url"),
    nonce: randomBytes(16).toString("base64url"),
    at_hash: randomBytes(16).toString("base64url"),
  };
  return `${encodePart(header)}.${encodePart(payload)}.${randomBytes(256).toString("base64url")}`;
}
