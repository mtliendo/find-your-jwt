import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { placeOnAnchors, shuffleInPlace } from "@/lib/office-layout";
import type { HaystackToken } from "@/lib/game-types";

export const HAYSTACK_SIZE = 108;

function encodePart(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function randomSub() {
  const issuers = ["auth0", "google-oauth2", "github", "windowslive"] as const;
  const issuer = issuers[Math.floor(Math.random() * issuers.length)] ?? "auth0";
  return `${issuer}|${randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

function randomSig() {
  return randomBytes(48).toString("base64url");
}

function decoyPayload(overrides: Record<string, unknown> = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    iss: "https://haystack-idp.example.com/",
    sub: randomSub(),
    aud: "https://api.wrong-audience.dev",
    iat: now - 900,
    exp: now + 3600,
    email: `decoy.${randomBytes(3).toString("hex")}@example.com`,
    name: "Casey Decoy",
    nickname: "lookalike",
    ...overrides,
  };
}

function decoyJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  signature: string,
) {
  return `${encodePart(header)}.${encodePart(payload)}.${signature}`;
}

export function buildDecoyRawTokens(): string[] {
  const domain = process.env.AUTH0_DOMAIN ?? "contoso.auth0.com";
  const clientId = process.env.AUTH0_CLIENT_ID ?? "demo-client-id";
  const now = Math.floor(Date.now() / 1000);
  const decoys: string[] = [];

  for (let i = 0; i < 22; i += 1) {
    decoys.push(
      decoyJwt(
        { alg: "RS256", typ: "JWT", kid: "expired-key" },
        decoyPayload({
          exp: now - 86_400,
          iat: now - 90_000,
          email: `expired.${i}@haystack.invalid`,
        }),
        randomSig(),
      ),
    );
  }

  for (let i = 0; i < 26; i += 1) {
    decoys.push(
      decoyJwt(
        { alg: "RS256", typ: "JWT", kid: "wrong-aud" },
        decoyPayload({
          aud: "https://not-this-app.example.com",
          azp: "some-other-client",
        }),
        randomSig(),
      ),
    );
  }

  for (let i = 0; i < 32; i += 1) {
    decoys.push(
      decoyJwt(
        { alg: "RS256", typ: "JWT", kid: "lookalike" },
        decoyPayload({
          iss: `https://${domain}/`,
          aud: clientId,
          name: "Almost You",
        }),
        randomSig(),
      ),
    );
  }

  for (let i = 0; i < 27; i += 1) {
    decoys.push(
      decoyJwt(
        { alg: "none", typ: "JWT" },
        {
          sub: randomSub(),
          email: "unsigned@haystack.invalid",
          iss: "https://unsigned.invalid/",
          note: "This still decodes as JSON. That does not make it yours.",
          garbage: true,
        },
        "",
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

export function buildHaystack(realIdToken: string): HaystackToken[] {
  const decoys = buildDecoyRawTokens();
  const raws = shuffleInPlace([realIdToken, ...decoys]).slice(0, HAYSTACK_SIZE);
  if (!raws.includes(realIdToken)) {
    raws[0] = realIdToken;
    shuffleInPlace(raws);
  }
  return scatterTokens(raws);
}
