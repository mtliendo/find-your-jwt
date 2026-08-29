import Phaser from "phaser";
import { OfficeScene } from "@/game/office-scene";
import type { GameBridge } from "@/lib/game-types";

export function createGame(parent: HTMLElement, bridge: GameBridge) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1100,
    height: 640,
    backgroundColor: "#0b0908",
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    banner: false,
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent,
    },
    scene: [OfficeScene],
    callbacks: {
      preBoot: (booting) => {
        booting.registry.set("bridge", bridge);
      },
    },
  });

  return game;
}

export function getOfficeScene(game: Phaser.Game) {
  return game.scene.getScene("OfficeScene") as OfficeScene | null;
}
