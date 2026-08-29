import "server-only";
import { auth0 } from "@/lib/auth0";
import type { PlayerProfile } from "@/lib/game-types";

export type GameSession = {
  player: PlayerProfile;
  idToken: string | null;
};

export async function getGameSession(): Promise<GameSession | null> {
  try {
    const session = await auth0.getSession();
    if (!session?.user?.sub) return null;
    return {
      player: {
        sub: session.user.sub,
        email: session.user.email,
        name: session.user.name ?? session.user.nickname,
      },
      idToken: session.tokenSet?.idToken ?? null,
    };
  } catch {
    return null;
  }
}
