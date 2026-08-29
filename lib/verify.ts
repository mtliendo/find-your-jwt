import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { decodeJwt, readClaim } from "@/lib/jwt";
import type { ClaimResult } from "@/lib/game-types";

function issuerFromDomain(domain: string) {
  const trimmed = domain.replace(/\/$/, "");
  return trimmed.startsWith("https://") ? `${trimmed}/` : `https://${trimmed}/`;
}

export async function verifyOwnedToken(
  raw: string,
  expectedSub: string,
): Promise<ClaimResult> {
  const decoded = decodeJwt(raw);
  const claimedSub = readClaim(decoded.payload, "sub");

  if (!claimedSub) {
    return {
      ok: false,
      reason: "That token has no `sub`. Decode is free. Identity is not.",
    };
  }

  if (claimedSub !== expectedSub) {
    return {
      ok: false,
      reason: "Wrong token. That `sub` is not you. Keep hunting.",
      sub: claimedSub,
    };
  }

  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  let signatureVerified = false;
  let verifyNote =
    "The `sub` matches you. Signature check was skipped (Auth0 domain missing).";

  if (domain && clientId) {
    try {
      const JWKS = createRemoteJWKSet(
        new URL(`https://${domain.replace(/^https?:\/\//, "")}/.well-known/jwks.json`),
      );
      await jwtVerify(raw, JWKS, {
        issuer: issuerFromDomain(domain),
        audience: clientId,
      });
      signatureVerified = true;
      verifyNote =
        "Auth0 JWKS verified the signature. Decode showed the claims; the signature is what makes this token actually yours.";
    } catch (error) {
      const message = error instanceof Error ? error.message : "verify failed";
      verifyNote = `The \`sub\` matches, but JWKS verification failed: ${message}`;
    }
  }

  return {
    ok: true,
    sub: claimedSub,
    email: readClaim(decoded.payload, "email"),
    iss: readClaim(decoded.payload, "iss"),
    signatureVerified,
    verifyNote,
  };
}
