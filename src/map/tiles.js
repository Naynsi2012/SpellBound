export const TILE = {
    grass: {
        base: 0,
        variants: [0, 0, 0, 0, 0, 0, 0, 1, 1, 2]
    },

    path: {
        topLeft: 12, top: 13, topRight: 14,
        left: 24, fill: 25, right: 26,
        bottomLeft: 36, bottom: 37, bottomRight: 38
    },

    objects: {
        orangeTreeTop: 3, orangeTreeTrunk: 15,
        greenTreeTop: 4, greenTreeTrunk: 16,
        singleTree: 5,
        orangeBush: 27, greenBush: 28,
        mushroom: 29,
        vine: 17,
        pebbles: 43
    }
};

export const TILE_IDS = [
    0, 1, 2,
    12, 13, 14,
    24, 25, 26,
    36, 37, 38,
    3, 15,
    4, 16,
    5,
    27, 28,
    29, 17, 43,
    108, 109, 110, 111, 123, 125, 126,
    48, 49, 50, 52, 53, 54,
    60, 61, 62, 64, 66, 67,
    80, 81, 82, 83, 85, 89
];

export function tileFileName(id) {
    return `tile_${String(id).padStart(4, "0")}.png`;
}

export function getPathTile(cell, pathCellSet) {
    const { col, row } = cell;

    const has = (dx, dy) => {
        return pathCellSet.has(`${col + dx},${row + dy}`);
    };

    const left = has(-1, 0);
    const right = has(1, 0);
    const up = has(0, -1);
    const down = has(0, 1);

    // Surrounded
    if (left && right && up && down) return TILE.path.fill;

    // Horizontal path with connection upward
    if (left && right && up) return TILE.path.bottom;

    // Horizontal path with connection downward
    if (left && right && down) return TILE.path.top;

    // Vertical path with connection to the right
    if (up && down && right) return TILE.path.left;

    // Vertical path with connection to the left
    if (up && down && left) return TILE.path.right;

    // Corner: right + down
    if (right && down) return TILE.path.topLeft;

    // Corner: left + down
    if (left && down) return TILE.path.topRight;

    // Corner: right + up
    if (right && up) return TILE.path.bottomLeft;

    // Corner: left + up
    if (left && up) return TILE.path.bottomRight;

    // Any single connection
    if (left || right || up || down) return TILE.path.fill;

    return TILE.path.fill;
}

