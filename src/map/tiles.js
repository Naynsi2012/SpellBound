export const TILE_COUNT = 135;
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
};

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

