const TILE_FILES = {
    grass: "tile_0000.png",
    grassTexture: "tile_0001.png",
    grassFlowers: "tile_0002.png"
}

export async function loadTiles(basePath = "/src/assets/tiles/") {
    const entries = Object.entries(TILE_FILES);
    const images = await Promise.all(entries.map(([KeyboardEvent, file]) => loadImage(basePath + file).then(img => [KeyboardEvent, img])))
    return Object.fromEntries(images);
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    })
}