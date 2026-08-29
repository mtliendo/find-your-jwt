import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { placeOnAnchors, shuffleInPlace } from "@/lib/office-layout";
import type { HaystackToken } from "@/lib/game-types";

export const HAYSTACK_SIZE = 108;

const GIVEN_NAMES = [
  "Amina",
  "Diego",
  "Priya",
  "Noah",
  "Sofia",
  "Kenji",
  "Leila",
  "Mateo",
  "Hannah",
  "Omar",
  "Elena",
  "Jonas",
  "Nia",
  "Luca",
  "Farah",
  "Theo",
];

const FAMILY_NAMES = [
  "Okoro",
  "Nguyen",
  "Silva",
  "Berg",
  "Khan",
  "Walsh",
  "Ito",
  "Moreau",
  "Patel",
  "Costa",
  "Ali",
  "Novak",
];

const EMAIL_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "icloud.com",
  "proton.me",
  "company.com",
  "alumni.edu",
];

export type HaystackLookalike = {
  email?: string;
  name?: string;
};

function encodePart(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function pick<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function auth0Kid() {
  return randomBytes(20).toString("base64url");
}

function auth0ClientId() {
  return randomBytes(24).toString("base64url").replace(/[-_]/g, "A").slice(0, 32);
}

function auth0Sid() {
  return randomBytes(24).toString("base64url");
}

function auth0Nonce() {
  return randomBytes(16).toString("base64url");
}

function rs256Signature() {
  return randomBytes(256).toString("base64url");
}

function randomSub() {
  const issuers = ["auth0", "google-oauth2", "github", "windowslive"] as const;
  const issuer = pick(issuers);
  return `${issuer}|${randomBytes(12).toString("hex")}`;
}

function randomPerson() {
  const given = pick(GIVEN_NAMES) ?? "Alex";
  const family = pick(FAMILY_NAMES) ?? "Reed";
  const name = `${given} ${family}`;
  const local = `${given}.${family}${randomBytes(1).toString("hex")}`
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "");
  const email = `${local}@${pick(EMAIL_DOMAINS)}`;
  const initials = `${given[0] ?? "a"}${family[0] ?? "r"}`.toLowerCase();
  return {
    name,
    nickname: given.toLowerCase(),
    email,
    picture: `https://cdn.auth0.com/avatars/${initials}.png`,
  };
}

function auth0Payload(
  iss: string,
  aud: string,
  now: number,
  overrides: Record<string, unknown> = {},
) {
  const person = randomPerson();
  const iat = now - 120 - Math.floor(Math.random() * 2_400);
  return {
    nickname: person.nickname,
    name: person.name,
    picture: person.picture,
    updated_at: new Date(iat * 1000).toISOString(),
    email: person.email,
    email_verified: true,
    iss,
    aud,
    iat,
    exp: iat + 36_000,
    sub: randomSub(),
    sid: auth0Sid(),
    nonce: auth0Nonce(),
    at_hash: randomBytes(16).toString("base64url"),
    ...overrides,
  };
}

function decoyJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  signature?: string,
) {
  const head = encodePart(header);
  const body = encodePart(payload);
  if (signature === undefined) {
    return `${head}.${body}`;
  }
  return `${head}.${body}.${signature}`;
}

function withLookalike(
  payload: Record<string, unknown>,
  lookalike: HaystackLookalike | undefined,
  apply: boolean,
) {
  if (!apply || !lookalike) return payload;
  return {
    ...payload,
    ...(lookalike.email ? { email: lookalike.email } : {}),
    ...(lookalike.name ? { name: lookalike.name } : {}),
  };
}

export function buildDecoyRawTokens(lookalike?: HaystackLookalike): string[] {
  const domain = (process.env.AUTH0_DOMAIN ?? "contoso.auth0.com")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const clientId = process.env.AUTH0_CLIENT_ID ?? auth0ClientId();
  const iss = `https://${domain}/`;
  const now = Math.floor(Date.now() / 1000);
  const decoys: string[] = [];

  for (let i = 0; i < 22; i += 1) {
    const iat = now - 90_000 - i * 60;
    decoys.push(
      decoyJwt(
        { alg: "RS256", typ: "JWT", kid: auth0Kid() },
        withLookalike(
          auth0Payload(iss, clientId, now, {
            iat,
            exp: iat + 3_600,
            updated_at: new Date(iat * 1000).toISOString(),
          }),
          lookalike,
          i < 4,
        ),
        rs256Signature(),
      ),
    );
  }

  for (let i = 0; i < 26; i += 1) {
    decoys.push(
      decoyJwt(
        { alg: "RS256", typ: "JWT", kid: auth0Kid() },
        withLookalike(
          auth0Payload(iss, auth0ClientId(), now),
          lookalike,
          i < 5,
        ),
        rs256Signature(),
      ),
    );
  }

  for (let i = 0; i < 32; i += 1) {
    decoys.push(
      decoyJwt(
        { alg: "RS256", typ: "JWT", kid: auth0Kid() },
        withLookalike(auth0Payload(iss, clientId, now), lookalike, i < 8),
        rs256Signature(),
      ),
    );
  }

  for (let i = 0; i < 21; i += 1) {
    decoys.push(
      decoyJwt(
        { alg: "none", typ: "JWT" },
        withLookalike(auth0Payload(iss, clientId, now), lookalike, i < 4),
        "",
      ),
    );
  }

  for (let i = 0; i < 6; i += 1) {
    decoys.push(
      decoyJwt(
        { alg: "none", typ: "JWT" },
        withLookalike(auth0Payload(iss, clientId, now), lookalike, i < 2),
      ),
    );
  }

  return decoys;
}

export function scatterTokens(rawTokens: string[]): HaystackToken[] {
  return placeOnAnchors(
    rawTokens.map((raw, index) => ({
      id: `jwt-${index}-${randomUUID().slice(0, 8)}`,
      raw,
    })),
  );
}

export function buildHaystack(
  realIdToken: string,
  lookalike?: HaystackLookalike,
): HaystackToken[] {
  const decoys = buildDecoyRawTokens(lookalike);
  const raws = shuffleInPlace([realIdToken, ...decoys]).slice(0, HAYSTACK_SIZE);
  if (!raws.includes(realIdToken)) {
    raws[0] = realIdToken;
    shuffleInPlace(raws);
  }
  return scatterTokens(raws);
}
