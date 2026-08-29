"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import type { GameBridge, HaystackToken } from "@/lib/game-types";
import type { OfficeScene } from "@/game/office-scene";

type GameCanvasProps = {
  tokens: HaystackToken[];
  onInspect: GameBridge["onInspect"];
  onClaim: GameBridge["onClaim"];
  failTokenId: string | null;
};

export default function GameCanvas({
  tokens,
  onInspect,
  onClaim,
  failTokenId,
}: GameCanvasProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const handlersRef = useRef({ onInspect, onClaim, tokens });

  handlersRef.current = { onInspect, onClaim, tokens };

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;
    let cancelled = false;

    const start = async () => {
      const [{ createGame }] = await Promise.all([import("@/game/create-game")]);
      if (cancelled || !parentRef.current || gameRef.current) return;

      const bridge: GameBridge = {
        get tokens() {
          return handlersRef.current.tokens;
        },
        onInspect: (value) => handlersRef.current.onInspect(value),
        onClaim: (token) => handlersRef.current.onClaim(token),
      };

      gameRef.current = createGame(parentRef.current, bridge);
    };

    void start();

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!failTokenId || !gameRef.current) return;
    const scene = gameRef.current.scene.getScene("OfficeScene") as OfficeScene | null;
    scene?.flashFail(failTokenId);
  }, [failTokenId]);

  return (
    <div
      ref={parentRef}
      className="game-canvas h-[min(64vh,640px)] w-full overflow-hidden rounded-xl border border-amber-200/10 bg-stone-950"
    />
  );
}
