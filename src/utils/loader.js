export async function loadEnemySprites(basePath = "/assets/sprites/") {
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

const TILESET_FILES = [
    "plains", "grass", "fences", "House", "Maple Tree",
    "tilemap_packed", "dungeon_tilemap_packed", "Tileset Grass Spring",
];

export async function loadTilesetImages(basePath = "/src/assets/tilesets/") {
    const entries = await Promise.all(
        TILESET_FILES.map((name) => loadImage(`${basePath}${name}.png`).then((img) => [name, img]))
    );
    return Object.fromEntries(entries);
}