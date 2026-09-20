export const PREFABS = {
    orangeTree: [
        { tileId: 3, dcol: 0, drow: 0 },
        { tileId: 15, dcol: 0, drow: 1 }
    ],
    greenTree: [
        { tileId: 4, dcol: 0, drow: 0 },
        { tileId: 16, dcol: 0, drow: 1 }
    ],
    singleTree: [
        { tileId: 5, dcol: 0, drow: 0 }
    ],
    forestGreen: [
        { tileId: 18, dcol: 0, drow: 0 },
        { tileId: 19, dcol: 1, drow: 0 },
        { tileId: 20, dcol: 2, drow: 0 }
    ],
    forestOrange: [
        { tileId: 21, dcol: 0, drow: 0 },
        { tileId: 22, dcol: 1, drow: 0 },
        { tileId: 23, dcol: 2, drow: 0 }
    ],
    orangeBush: [{ tileId: 27, dcol: 0, drow: 0 }],
    greenBush: [{ tileId: 28, dcol: 0, drow: 0 }],
    mushroom: [{ tileId: 29, dcol: 0, drow: 0 }],
    vine: [{ tileId: 17, dcol: 0, drow: 0 }],
    pebbles: [{ tileId: 43, dcol: 0, drow: 0 }],
    fence: [{ tileId: 81, dcol: 0, drow: 0 }],
    fencePost: [{ tileId: 82, dcol: 0, drow: 0 }],
    signpost: [{ tileId: 83, dcol: 0, drow: 0 }],
    houseStone: [
        { tileId: 60, dcol: 0, drow: 0 }, { tileId: 63, dcol: 1, drow: 0 }, { tileId: 62, dcol: 2, drow: 0 },
        { tileId: 48, dcol: 0, drow: 1 }, { tileId: 49, dcol: 1, drow: 1 }, { tileId: 50, dcol: 2, drow: 1 },
        { tileId: 48, dcol: 0, drow: 2 }, { tileId: 89, dcol: 1, drow: 2 }, { tileId: 50, dcol: 2, drow: 2 }
    ],
    houseOrange: [
        { tileId: 64, dcol: 0, drow: 0 }, { tileId: 67, dcol: 1, drow: 0 }, { tileId: 66, dcol: 2, drow: 0 },
        { tileId: 52, dcol: 0, drow: 1 }, { tileId: 53, dcol: 1, drow: 1 }, { tileId: 54, dcol: 2, drow: 1 },
        { tileId: 52, dcol: 0, drow: 2 }, { tileId: 85, dcol: 1, drow: 2 }, { tileId: 54, dcol: 2, drow: 2 }
    ],
    castle: [
        { tileId: 111, dcol: 0, drow: 0 }, { tileId: 111, dcol: 1, drow: 0 }, { tileId: 111, dcol: 2, drow: 0 }, { tileId: 111, dcol: 3, drow: 0 }, { tileId: 111, dcol: 4, drow: 0 },
        { tileId: 126, dcol: 0, drow: 1 }, { tileId: 126, dcol: 1, drow: 1 }, { tileId: 126, dcol: 2, drow: 1 }, { tileId: 126, dcol: 3, drow: 1 }, { tileId: 126, dcol: 4, drow: 1 },
        { tileId: 126, dcol: 0, drow: 2 }, { tileId: 125, dcol: 1, drow: 2 }, { tileId: 126, dcol: 2, drow: 2 }, { tileId: 125, dcol: 3, drow: 2 }, { tileId: 126, dcol: 4, drow: 2 },
        { tileId: 126, dcol: 0, drow: 3 }, { tileId: 126, dcol: 1, drow: 3 }, { tileId: 123, dcol: 2, drow: 3 }, { tileId: 126, dcol: 3, drow: 3 }, { tileId: 126, dcol: 4, drow: 3 },
        { tileId: 108, dcol: 0, drow: 4 }, { tileId: 109, dcol: 1, drow: 4 }, { tileId: 110, dcol: 2, drow: 4 }, { tileId: 108, dcol: 3, drow: 4 }, { tileId: 109, dcol: 4, drow: 4 }
    ]
};

export function getPrefabFootprint(type, col, row) {
    const prefab = PREFABS[type];
    if (!prefab) throw new Error(`Unknown prefab: '${type}'`);

    const seen = new Set();
    const cells = [];

    for (const tile of prefab) {
        const c = col + tile.dcol;
        const r = row + tile.drow;
        const key = `${c},${r}`;

        if (!seen.has(key)) {
            seen.add(key);
            cells.push({ col: c, row: r });
        }
    }

    return cells;
}

export function getPrefabSize(type) {
    const prefab = PREFABS[type];
    if (!prefab) throw new Error(`Unknown prefab: '${type}'`);

    const maxCol = Math.max(...prefab.map((t) => t.dcol));
    const maxRow = Math.max(...prefab.map((t) => t.drow));

    return { cols: maxCol + 1, rows: maxRow + 1 };
}