import { GameShell } from "@/components/game/game-shell";
import { LoginWall } from "@/components/login-wall";
import { MissingIdToken } from "@/components/missing-token";
import { buildHaystack } from "@/lib/haystack";
import { getGameSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getGameSession();

  if (!session) {
    return <LoginWall />;
  }

  if (!session.idToken) {
    return <MissingIdToken player={session.player} />;
  }

  const tokens = buildHaystack(session.idToken, {
    email: session.player.email,
    name: session.player.name,
  });
  return <GameShell player={session.player} initialTokens={tokens} />;
}
