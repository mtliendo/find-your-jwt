import Phaser from "phaser";

function gfx(scene: Phaser.Scene) {
  return scene.make.graphics({ x: 0, y: 0, add: false });
}

export function generateOfficeTextures(scene: Phaser.Scene) {
  const floor = gfx(scene);
  floor.fillStyle(0x3a2f24, 1);
  floor.fillRect(0, 0, 64, 64);
  floor.fillStyle(0x43362a, 1);
  floor.fillRect(0, 0, 32, 32);
  floor.fillRect(32, 32, 32, 32);
  floor.fillStyle(0x2c241c, 0.35);
  floor.fillRect(0, 31, 64, 2);
  floor.fillRect(31, 0, 2, 64);
  floor.generateTexture("floor", 64, 64);
  floor.destroy();

  const carpet = gfx(scene);
  carpet.fillStyle(0x2a1d28, 1);
  carpet.fillRect(0, 0, 64, 64);
  carpet.fillStyle(0x331f30, 1);
  carpet.fillRect(8, 8, 48, 48);
  carpet.lineStyle(2, 0x4a2d3a, 0.6);
  carpet.strokeRect(4, 4, 56, 56);
  carpet.generateTexture("carpet", 64, 64);
  carpet.destroy();

  const wall = gfx(scene);
  wall.fillStyle(0x1b1612, 1);
  wall.fillRect(0, 0, 16, 16);
  wall.fillStyle(0x2a211a, 1);
  wall.fillRect(0, 12, 16, 4);
  wall.generateTexture("wall", 16, 16);
  wall.destroy();

  const desk = gfx(scene);
  desk.fillStyle(0x5a3d24, 1);
  desk.fillRect(0, 8, 176, 66);
  desk.fillStyle(0x7a5533, 1);
  desk.fillRect(0, 0, 176, 22);
  desk.fillStyle(0x2a1c12, 1);
  desk.fillRect(8, 70, 16, 12);
  desk.fillRect(152, 70, 16, 12);
  desk.fillStyle(0x1d2a28, 1);
  desk.fillRect(118, 8, 42, 28);
  desk.fillStyle(0x6ee7c5, 0.55);
  desk.fillRect(122, 12, 34, 20);
  desk.generateTexture("desk", 176, 82);
  desk.destroy();

  const chair = gfx(scene);
  chair.fillStyle(0x1f2a28, 1);
  chair.fillRect(10, 6, 48, 18);
  chair.fillStyle(0x2c3b38, 1);
  chair.fillRect(14, 20, 40, 18);
  chair.fillStyle(0x141a18, 1);
  chair.fillRect(18, 36, 8, 6);
  chair.fillRect(42, 36, 8, 6);
  chair.generateTexture("chair", 68, 42);
  chair.destroy();

  const cabinet = gfx(scene);
  cabinet.fillStyle(0x3f3a36, 1);
  cabinet.fillRect(0, 0, 92, 64);
  cabinet.fillStyle(0x2a2622, 1);
  cabinet.fillRect(6, 8, 80, 18);
  cabinet.fillRect(6, 32, 80, 18);
  cabinet.fillStyle(0xc9a227, 1);
  cabinet.fillCircle(74, 17, 3);
  cabinet.fillCircle(74, 41, 3);
  cabinet.generateTexture("cabinet", 92, 64);
  cabinet.destroy();

  const table = gfx(scene);
  table.fillStyle(0x4a3322, 1);
  table.fillRoundedRect(0, 0, 320, 168, 10);
  table.fillStyle(0x6b4930, 1);
  table.fillRoundedRect(10, 10, 300, 148, 8);
  table.generateTexture("conference", 320, 168);
  table.destroy();

  const plant = gfx(scene);
  plant.fillStyle(0x3f2a18, 1);
  plant.fillRect(14, 28, 16, 12);
  plant.fillStyle(0x2f6b3a, 1);
  plant.fillCircle(22, 18, 12);
  plant.fillStyle(0x3f8f4a, 1);
  plant.fillCircle(14, 16, 8);
  plant.fillCircle(30, 15, 7);
  plant.generateTexture("plant", 44, 44);
  plant.destroy();

  const lamp = gfx(scene);
  lamp.fillStyle(0x2a241c, 1);
  lamp.fillRect(10, 18, 8, 14);
  lamp.fillStyle(0xf3d48a, 1);
  lamp.fillCircle(14, 12, 10);
  lamp.fillStyle(0xfff3c4, 0.8);
  lamp.fillCircle(14, 12, 5);
  lamp.generateTexture("lamp", 28, 32);
  lamp.destroy();

  const token = gfx(scene);
  token.fillStyle(0x8a6a1f, 1);
  token.fillRoundedRect(0, 0, 22, 14, 3);
  token.fillStyle(0xe8c872, 1);
  token.fillRoundedRect(1, 1, 20, 12, 2);
  token.fillStyle(0x5a4310, 1);
  token.fillRect(4, 4, 14, 2);
  token.fillRect(4, 8, 10, 2);
  token.generateTexture("jwt", 22, 14);
  token.destroy();

  const player = gfx(scene);
  player.fillStyle(0x6b4423, 1);
  player.fillEllipse(16, 22, 18, 16);
  player.fillStyle(0xc4a484, 1);
  player.fillEllipse(16, 22, 10, 8);
  player.fillStyle(0x8a5a32, 1);
  player.fillCircle(16, 12, 8);
  player.fillStyle(0x5a3a20, 1);
  player.fillCircle(10, 8, 3);
  player.fillCircle(22, 8, 3);
  player.fillStyle(0x1a120c, 1);
  player.fillCircle(13, 12, 1.4);
  player.fillCircle(19, 12, 1.4);
  player.fillStyle(0xf5c16c, 1);
  player.fillRect(22, 18, 8, 3);
  player.generateTexture("player", 32, 32);
  player.destroy();

  const glow = gfx(scene);
  glow.fillStyle(0xffe6a8, 0.18);
  glow.fillCircle(8, 8, 8);
  glow.generateTexture("glow", 16, 16);
  glow.destroy();
}
