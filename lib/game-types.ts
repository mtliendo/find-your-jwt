import type { DecodedJwt } from "@/lib/jwt";

export type HaystackToken = {
  id: string;
  raw: string;
  x: number;
  y: number;
};

export type PlayerProfile = {
  sub: string;
  email?: string;
  name?: string;
};

export type ClaimResult =
  | {
      ok: true;
      sub?: string;
      email?: string;
      iss?: string;
      signatureVerified: boolean;
      verifyNote: string;
    }
  | {
      ok: false;
      reason: string;
      sub?: string;
    };

export type InspectedToken = {
  token: HaystackToken;
  decoded: DecodedJwt;
};

export type GameBridge = {
  tokens: HaystackToken[];
  onInspect: (inspected: InspectedToken | null) => void;
  onClaim: (token: HaystackToken) => void;
};
