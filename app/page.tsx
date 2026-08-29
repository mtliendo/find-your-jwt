import { GameShell } from "@/components/game/game-shell";
import { isAuth0Configured } from "@/lib/auth-config";
import { buildHaystack } from "@/lib/haystack";
import { getGameSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getGameSession();
  const tokens = buildHaystack(session.idToken, {
    email: session.player.email,
    name: session.player.name,
  });

  return (
    <GameShell
      player={session.player}
      initialTokens={tokens}
      mode={session.mode}
      auth0Configured={isAuth0Configured()}
    />
  );
}
