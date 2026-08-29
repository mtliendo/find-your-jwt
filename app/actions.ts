"use server";

import { getGameSession } from "@/lib/session";
import { verifyOwnedToken } from "@/lib/verify";
import type { ClaimResult } from "@/lib/game-types";

export async function claimTokenAction(raw: string): Promise<ClaimResult> {
  const session = await getGameSession();
  if (!session) {
    return { ok: false, reason: "You need to sign in before you can claim." };
  }
  if (!session.idToken) {
    return { ok: false, reason: "Wrong token. Keep hunting." };
  }
  if (!raw || raw.length > 16_000) {
    return { ok: false, reason: "That does not look like a token." };
  }
  return verifyOwnedToken(raw, session.player.sub);
}
