import Phaser from "phaser";
import { decodeJwt } from "@/lib/jwt";
import {
  OFFICE,
  getCabinets,
  getChairs,
  getConferenceTable,
  getDesks,
  getLamps,
  getPlants,
  getWalls,
} from "@/lib/office-layout";
import type { GameBridge, HaystackToken } from "@/lib/game-types";
import { generateOfficeTextures } from "@/game/textures";

type DirectionKeys = {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
};

const TOKEN_SCALE = 1.7;

export class OfficeScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: DirectionKeys;
  private playerLight!: Phaser.GameObjects.Light;
  private pointerLight!: Phaser.GameObjects.Light;
  private magGlass!: Phaser.GameObjects.Container;
  private tokens = new Map<string, Phaser.GameObjects.Sprite>();
  private inspectedId: string | null = null;
  private failUntil = 0;
  private inspectKey?: Phaser.Input.Keyboard.Key;
  private inspectAltKey?: Phaser.Input.Keyboard.Key;
  private enterKey?: Phaser.Input.Keyboard.Key;
  private spaceKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: "OfficeScene" });
  }

  preload() {
    generateOfficeTextures(this);
  }

  create() {
    this.physics.world.setBounds(0, 0, OFFICE.width, OFFICE.height);
    this.lights.enable();
    this.lights.setAmbientColor(0x16110d);

    this.add
      .tileSprite(0, 0, OFFICE.width, OFFICE.height, "floor")
      .setOrigin(0)
      .setPipeline("Light2D");

    this.add
      .tileSprite(980, 120, 280, 1360, "carpet")
      .setOrigin(0)
      .setPipeline("Light2D")
      .setAlpha(0.88);

    const furniture = this.physics.add.staticGroup();

    for (const wall of getWalls()) {
      const sprite = this.add
        .tileSprite(wall.x, wall.y, wall.w, wall.h, "wall")
        .setOrigin(0)
        .setPipeline("Light2D");
      furniture.add(sprite);
    }

    for (const desk of getDesks()) {
      const sprite = this.add
        .image(desk.x, desk.y, "desk")
        .setOrigin(0)
        .setPipeline("Light2D");
      furniture.add(sprite);
    }

    for (const chair of getChairs()) {
      const sprite = this.add
        .image(chair.x, chair.y, "chair")
        .setOrigin(0)
        .setPipeline("Light2D");
      furniture.add(sprite);
    }

    for (const cabinet of getCabinets()) {
      const sprite = this.add
        .image(cabinet.x, cabinet.y, "cabinet")
        .setOrigin(0)
        .setPipeline("Light2D");
      furniture.add(sprite);
    }

    const table = getConferenceTable();
    furniture.add(
      this.add
        .image(table.x, table.y, "conference")
        .setOrigin(0)
        .setPipeline("Light2D"),
    );

    for (const plant of getPlants()) {
      this.add.image(plant.x, plant.y, "plant").setPipeline("Light2D");
    }

    for (const lamp of getLamps()) {
      this.add.image(lamp.x, lamp.y, "lamp").setPipeline("Light2D").setDepth(4);
      this.lights.addLight(lamp.x, lamp.y - 6, 140, 0xf3d48a, 1.1);
    }

    this.player = this.physics.add.sprite(
      OFFICE.spawn.x,
      OFFICE.spawn.y,
      "player",
    );
    this.player.setCollideWorldBounds(true);
    this.player.setPipeline("Light2D");
    this.player.setDepth(12);
    this.player.setSize(18, 16).setOffset(7, 12);
    this.physics.add.collider(this.player, furniture);

    this.playerLight = this.lights.addLight(
      this.player.x,
      this.player.y,
      230,
      0xffe6a8,
      2.4,
    );
    this.pointerLight = this.lights.addLight(0, 0, 88, 0xcde8ff, 1.35);

    this.spawnTokens();
    this.createMagnifier();

    this.cameras.main.setBounds(0, 0, OFFICE.width, OFFICE.height);
    this.cameras.main.startFollow(this.player, true, 0.14, 0.14);
    this.cameras.main.setBackgroundColor("#070605");
    this.cameras.main.setZoom(1);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
        up: "W",
        down: "S",
        left: "A",
        right: "D",
      }) as DirectionKeys;
      this.inspectKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.E,
      );
      this.inspectAltKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.I,
      );
      this.enterKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.ENTER,
      );
      this.spaceKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE,
      );
      this.input.keyboard.addCapture([
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        Phaser.Input.Keyboard.KeyCodes.ENTER,
      ]);
    }

    if (this.sys.game.device.input.touch) {
      this.input.setDefaultCursor("default");
    } else {
      this.input.setDefaultCursor("none");
    }
  }

  private bridge(): GameBridge {
    return this.game.registry.get("bridge") as GameBridge;
  }

  private spawnTokens() {
    for (const token of this.bridge().tokens) {
      const sprite = this.add
        .sprite(token.x, token.y, "jwt")
        .setPipeline("Light2D")
        .setDepth(6)
        .setScale(TOKEN_SCALE)
        .setData("token", token)
        .setInteractive(
          new Phaser.Geom.Rectangle(-18, -18, 58, 50),
          Phaser.Geom.Rectangle.Contains,
        );

      this.tweens.add({
        targets: sprite,
        y: token.y - 2,
        duration: 1400 + Math.random() * 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      sprite.on("pointerdown", () => this.handleChipPointerDown(token, sprite));
      this.tokens.set(token.id, sprite);
    }
  }

  private createMagnifier() {
    const ring = this.add.circle(0, 0, 18, 0x000000, 0);
    ring.setStrokeStyle(3, 0xf5c16c, 0.95);
    const glass = this.add.circle(0, 0, 14, 0xcde8ff, 0.08);
    const handle = this.add.rectangle(16, 16, 16, 4, 0xc4a06a).setAngle(40);
    this.magGlass = this.add.container(0, 0, [glass, ring, handle]);
    this.magGlass.setDepth(40);
  }

  private handleChipPointerDown(
    token: HaystackToken,
    sprite: Phaser.GameObjects.Sprite,
  ) {
    if (this.inspectedId === token.id) {
      this.claim(token, sprite);
      return;
    }
    this.selectInspect(token, sprite);
  }

  private selectInspect(token: HaystackToken, sprite: Phaser.GameObjects.Sprite) {
    if (this.inspectedId && this.inspectedId !== token.id) {
      this.unhighlight(this.inspectedId);
    }
    this.inspectedId = token.id;
    sprite.setTint(0xfff1b8);
    sprite.setScale(TOKEN_SCALE * 1.25);
    this.bridge().onInspect({ token, decoded: decodeJwt(token.raw) });
  }

  private unhighlight(id: string) {
    const sprite = this.tokens.get(id);
    if (!sprite || this.time.now < this.failUntil) return;
    sprite.clearTint();
    sprite.setScale(TOKEN_SCALE);
  }

  private inspectNearest() {
    let nearest: Phaser.GameObjects.Sprite | null = null;
    let best = Number.POSITIVE_INFINITY;
    for (const sprite of this.tokens.values()) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        sprite.x,
        sprite.y,
      );
      if (distance < best) {
        best = distance;
        nearest = sprite;
      }
    }
    if (!nearest) return;
    const token = nearest.getData("token") as HaystackToken;
    this.selectInspect(token, nearest);
  }

  private claimInspected() {
    if (!this.inspectedId) return;
    const sprite = this.tokens.get(this.inspectedId);
    if (!sprite) return;
    this.claim(sprite.getData("token") as HaystackToken, sprite);
  }

  private claim(token: HaystackToken, sprite: Phaser.GameObjects.Sprite) {
    this.tweens.add({
      targets: sprite,
      scale: TOKEN_SCALE * 1.35,
      duration: 80,
      yoyo: true,
    });
    this.bridge().onClaim(token);
  }

  flashFail(tokenId: string) {
    const sprite = this.tokens.get(tokenId);
    if (!sprite) return;
    this.failUntil = this.time.now + 700;
    sprite.setTint(0xff6b6b);
    this.tweens.add({
      targets: sprite,
      x: sprite.x + 4,
      duration: 50,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        if (this.inspectedId === tokenId) {
          sprite.setTint(0xfff1b8);
          sprite.setScale(TOKEN_SCALE * 1.25);
          return;
        }
        sprite.clearTint();
        sprite.setScale(TOKEN_SCALE);
      },
    });
  }

  update() {
    const speed = 180;
    let vx = 0;
    let vy = 0;
    const pad = this.bridge().move ?? { x: 0, y: 0 };
    if (this.cursors?.left.isDown || this.wasd?.left.isDown || pad.x < 0) vx -= 1;
    if (this.cursors?.right.isDown || this.wasd?.right.isDown || pad.x > 0) {
      vx += 1;
    }
    if (this.cursors?.up.isDown || this.wasd?.up.isDown || pad.y < 0) vy -= 1;
    if (this.cursors?.down.isDown || this.wasd?.down.isDown || pad.y > 0) vy += 1;

    const body = this.player.body;
    if (vx !== 0 && vy !== 0) {
      const inv = Math.SQRT1_2;
      body.setVelocity(vx * speed * inv, vy * speed * inv);
    } else {
      body.setVelocity(vx * speed, vy * speed);
    }

    if (
      (this.inspectKey && Phaser.Input.Keyboard.JustDown(this.inspectKey)) ||
      (this.inspectAltKey && Phaser.Input.Keyboard.JustDown(this.inspectAltKey))
    ) {
      this.inspectNearest();
    }
    if (
      (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) ||
      (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey))
    ) {
      if (this.inspectedId) {
        this.claimInspected();
      } else {
        this.inspectNearest();
      }
    }

    this.playerLight.x = this.player.x;
    this.playerLight.y = this.player.y;

    const pointer = this.input.activePointer;
    const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    this.pointerLight.x = world.x;
    this.pointerLight.y = world.y;
    this.magGlass.setPosition(world.x, world.y);
  }
}
