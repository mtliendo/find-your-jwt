import "server-only";
import { cookies, headers } from "next/headers";
import { isAuth0Configured } from "@/lib/auth-config";
import { auth0 } from "@/lib/auth0";
import { mintGuestToken } from "@/lib/guest";
import {
  GUEST_COOKIE,
  GUEST_HEADER,
  mintGuestIdentity,
  parseGuestIdentity,
  type GuestIdentity,
} from "@/lib/guest-identity";
import type { PlayMode, PlayerProfile } from "@/lib/game-types";

export type GameSession = {
  mode: PlayMode;
  player: PlayerProfile;
  idToken: string;
};

async function readGuestIdentity(): Promise<GuestIdentity> {
  const jar = await cookies();
  const fromCookie = parseGuestIdentity(jar.get(GUEST_COOKIE)?.value);
  if (fromCookie) return fromCookie;

  const headerStore = await headers();
  const fromHeader = parseGuestIdentity(headerStore.get(GUEST_HEADER));
  if (fromHeader) return fromHeader;

  return mintGuestIdentity();
}

export async function getGameSession(): Promise<GameSession> {
  if (isAuth0Configured()) {
    try {
      const session = await auth0.getSession();
      if (session?.user?.sub && session.tokenSet?.idToken) {
        return {
          mode: "auth0",
          player: {
            sub: session.user.sub,
            email: session.user.email,
            name: session.user.name ?? session.user.nickname,
          },
          idToken: session.tokenSet.idToken,
        };
      }
    } catch {
      // Fall through to guest play.
    }
  }

  const guest = await readGuestIdentity();
  return {
    mode: "guest",
    player: guest,
    idToken: mintGuestToken(guest),
  };
}
