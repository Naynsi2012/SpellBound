export async function loadTmxMap(url) {
    const response = await fetch(url);
    const text = await response.text();

    const xml = new DOMParser().parseFromString(text, "application/xml");
    const mapEl = xml.querySelector("map");

    const cols = parseInt(mapEl.getAttribute("width"));
    const rows = parseInt(mapEl.getAttribute("height"));
    const tileSize = parseInt(mapEl.getAttribute("tilewidth"));

    const tilesets = [...xml.querySelectorAll("tileset")].map((el) => ({
        firstGid: parseInt(el.getAttribute("firstgid")),
        name: el.getAttribute("name"),
        columns: parseInt(el.getAttribute("columns")),
    })).sort((a, b) => a.firstGid - b.firstGid);

    const layers = [...xml.querySelectorAll("layer")].map((el) => {
        const csv = el.querySelector("data").textContent.trim();
        const gids = csv.split(",").map((n) => parseInt(n.trim()) & 0x1fffffff);

        return {
            name: el.getAttribute("name"),
            gids,
        };
    });

    const path = extractPolyline(xml, "path");
    const platform = extractRectangle(xml, "platform");

    return { cols, rows, tileSize, tilesets, layers, path, platform };
}

function extractPolyline(xml, objectName) {
    const obj = [...xml.querySelectorAll("object")].find((o) => o.getAttribute("name") === objectName);
    if (!obj) return null;

    const originX = parseFloat(obj.getAttribute("x"));
    const originY = parseFloat(obj.getAttribute("y"));

    const shape = obj.querySelector("polyline") || obj.querySelector("polygon");
    if (!shape) return null;

    const points = shape.getAttribute("points").trim().split(" ").map((pair) => {
        const [dx, dy] = pair.split(",").map(Number);
        return { x: originX + dx, y: originY + dy };
    });

    return { points };
}
function extractRectangle(xml, objectName) {
    const obj = [...xml.querySelectorAll("object")].find((o) => o.getAttribute("name") === objectName);
    if (!obj) return null;

    const x = parseFloat(obj.getAttribute("x"));
    const y = parseFloat(obj.getAttribute("y"));
    const width = parseFloat(obj.getAttribute("width"));
    const height = parseFloat(obj.getAttribute("height"));

    const properties = {};
    obj.querySelectorAll("property").forEach((p) => {
        properties[p.getAttribute("name")] = p.getAttribute("value");
    });

    return { x, y, width, height, ...properties };
}

export function resolveTile(gid, tilesets) {
    if (gid === 0) return null;

    let match = tilesets[0];
    for (const ts of tilesets) {
        if (ts.firstGid <= gid) match = ts;
        else break;
    }

    return { tileset: match, localId: gid - match.firstGid };
}