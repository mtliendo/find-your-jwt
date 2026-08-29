"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { claimTokenAction } from "@/app/actions";
import { DecodePanel } from "@/components/game/decode-panel";
import { WinScreen } from "@/components/game/win-screen";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { placeOnAnchors } from "@/lib/office-layout";
import type {
  ClaimResult,
  HaystackToken,
  InspectedToken,
  PlayerProfile,
} from "@/lib/game-types";
import { cn } from "@/lib/utils";

const GameCanvas = dynamic(() => import("@/components/game/game-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(64vh,640px)] items-center justify-center rounded-xl border border-amber-200/10 bg-stone-950 text-sm text-amber-100/70">
      Opening the office…
    </div>
  ),
});

export function GameShell({
  player,
  initialTokens,
}: {
  player: PlayerProfile;
  initialTokens: HaystackToken[];
}) {
  const [tokens, setTokens] = useState(initialTokens);
  const [inspected, setInspected] = useState<InspectedToken | null>(null);
  const [fail, setFail] = useState<string | null>(null);
  const [failTokenId, setFailTokenId] = useState<string | null>(null);
  const [win, setWin] = useState<Extract<ClaimResult, { ok: true }> | null>(
    null,
  );
  const [canvasKey, setCanvasKey] = useState(0);

  const onInspect = useCallback((value: InspectedToken | null) => {
    setInspected(value);
  }, []);

  const onClaim = useCallback(async (token: HaystackToken) => {
    const result = await claimTokenAction(token.raw);
    if (result.ok) {
      setWin(result);
      setFail(null);
      return;
    }
    setFail(result.reason);
    setFailTokenId(token.id);
    window.setTimeout(() => {
      setFail(null);
      setFailTokenId(null);
    }, 1600);
  }, []);

  const replay = () => {
    setWin(null);
    setFail(null);
    setInspected(null);
    setTokens(placeOnAnchors(tokens));
    setCanvasKey((key) => key + 1);
  };

  return (
    <main className="relative flex min-h-full flex-1 flex-col gap-4 px-4 py-4 md:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.24em] text-teal-200/70 uppercase">
            Focus Otter · Find Your JWT
          </p>
          <h1 className="text-2xl font-semibold text-amber-50">
            One token is yours. The rest are lookalikes.
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{player.email ?? player.sub}</Badge>
          <a href="/auth/logout" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Log out
          </a>
        </div>
      </header>

      <p className="text-sm text-stone-300">
        WASD or arrows to walk. Magnifying glass to inspect. Click to claim.
        Decode is free — identity is the <code className="text-amber-200">sub</code>.
      </p>

      <div className="relative">
        <GameCanvas
          key={canvasKey}
          tokens={tokens}
          onInspect={onInspect}
          onClaim={onClaim}
          failTokenId={failTokenId}
        />
        {win ? <WinScreen result={win} onReplay={replay} /> : null}
      </div>

      {fail ? (
        <div className="rounded-md border border-rose-400/30 bg-rose-950/60 px-4 py-2 text-sm text-rose-100">
          {fail}
        </div>
      ) : null}

      <DecodePanel inspected={inspected} />
    </main>
  );
}
