import { TILE_IDS, tileFileName } from "../map/tiles.js";

export async function loadTiles(basePath = "/src/assets/tiles/"){
    const entries = await Promise.all(
        TILE_IDS.map(id =>
            loadImage(basePath + tileFileName(id)).then(img => [id, img])
        )
    );

    return Object.fromEntries(entries);
}

export async function loadEnemySprites(basePath = "/src/assets/sprites/"){
    const ENEMY_FILES = {
        ghost: "enemy_0.png",
        cyclops: "enemy_1.png"
    };

    const entries = await Promise.all(
        Object.entries(ENEMY_FILES).map(([key, file]) =>
            loadImage(basePath + file).then(img => [key, img])
        )
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