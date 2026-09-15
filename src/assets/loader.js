const TILE_IDS = [
    0, 1, 2,        // grass variants
    12, 13, 14,     // path: top-left, top, top-right
    24, 25, 26,     // path: mid-left, mid-fill, mid-right
    36, 37, 38,     // path: bottom-left, bottom, bottom-right
    3, 15,          // orange tree: top + trunk
    4, 16,          // green tree: top + trunk
    5, 27, 28,      // single-tile trees/bush
    29, 17, 43      // decorations: mushroom, vine, pebbles
];

export async function loadTiles(basePath = "/src/assets/tiles/") {
    const entries = await Promise.all(TILE_IDS.map((id) => loadImage(basePath + tileFileName(id)).then((img) => [id, img])));
    return Object.fromEntries(entries);
}

function tileFileName(id) {
    return `tile_${String(id).padStart(4, "0")}.png`;
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    })
}