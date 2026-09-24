import { TILE_COUNT, tileFileName } from "../map/tiles.js";

export async function loadTiles() {
  const entries = await Promise.all(
    Array.from({ length: TILE_COUNT }, (_, id) =>
      loadImage(
        new URL(`./tiles/${tileFileName(id)}`, import.meta.url).href,
      ).then((img) => [id, img]),
    ),
  );

  return Object.fromEntries(entries);
}

export async function loadEnemySprites(basePath = "/src/assets/sprites/") {
  const ENEMY_FILES = {
    dummy: "dummy/dummy.png",
    soldier: "soldier/soldier.png",
    slime: "slime/slime.png"
  };

  const entries = await Promise.all(
    Object.entries(ENEMY_FILES).map(([key, file]) =>
      loadImage(basePath + file).then((img) => [key, img]),
    ),
  );

  return Object.fromEntries(entries);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
