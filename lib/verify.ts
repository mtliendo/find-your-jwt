import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { decodeJwt, readClaim } from "@/lib/jwt";
import type { ClaimResult, PlayMode } from "@/lib/game-types";

const MISS: ClaimResult = {
  ok: false,
  reason: "Wrong token. Keep hunting.",
};

function issuerFromDomain(domain: string) {
  const trimmed = domain.replace(/\/$/, "");
  return trimmed.startsWith("https://") ? `${trimmed}/` : `https://${trimmed}/`;
}

function miss(sub?: string): ClaimResult {
  return sub ? { ...MISS, sub } : { ...MISS };
}

function headerAlg(raw: string) {
  const decoded = decodeJwt(raw);
  const alg = decoded.header?.alg;
  return typeof alg === "string" ? alg : "";
}

export async function verifyOwnedToken(
  raw: string,
  expectedSub: string,
  mode: PlayMode = "auth0",
): Promise<ClaimResult> {
  if (mode === "guest") {
    const decoded = decodeJwt(raw);
    const claimedSub = readClaim(decoded.payload, "sub");
    if (claimedSub && claimedSub === expectedSub) {
      return {
        ok: true,
        sub: claimedSub,
        email: readClaim(decoded.payload, "email"),
        iss: readClaim(decoded.payload, "iss"),
        signatureVerified: false,
        verifyNote:
          "Guest play: you found the token whose sub is yours. Auth0 JWKS is the gate when a real session is signed in.",
      };
    }
    return miss(claimedSub);
  }

  const parts = raw.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    return miss(readClaim(decodeJwt(raw).payload, "sub"));
  }

  const alg = headerAlg(raw);
  if (!alg || alg.toLowerCase() === "none") {
    return miss(readClaim(decodeJwt(raw).payload, "sub"));
  }

  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  if (!domain || !clientId) {
    return miss();
  }

  try {
    const host = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const JWKS = createRemoteJWKSet(
      new URL(`https://${host}/.well-known/jwks.json`),
    );
    const { payload } = await jwtVerify(raw, JWKS, {
      issuer: issuerFromDomain(host),
      audience: clientId,
    });
    const verifiedSub = typeof payload.sub === "string" ? payload.sub : undefined;
    if (!verifiedSub || verifiedSub !== expectedSub) {
      return miss(verifiedSub);
    }

    return {
      ok: true,
      sub: verifiedSub,
      email: typeof payload.email === "string" ? payload.email : undefined,
      iss: typeof payload.iss === "string" ? payload.iss : undefined,
      signatureVerified: true,
      verifyNote:
        "Auth0 JWKS verified the signature. Decode showed the claims; the signature is what makes this token actually yours.",
    };
  } catch {
    return miss(readClaim(decodeJwt(raw).payload, "sub"));
  }
}
