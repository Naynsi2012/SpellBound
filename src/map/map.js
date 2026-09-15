import { GRID_COLS, GRID_ROWS, TILE_SIZE } from "../core/constants.js";

const GRASS_IDS = [0, 0, 0, 1, 2]; // mostly plain grass, sparse variation

// path border tiles (see the 9-slice legend)
const PATH_TOP = 13, PATH_MID = 25, PATH_BOTTOM = 37;
const PATH_TOP_LEFT = 12, PATH_TOP_RIGHT = 14;
const PATH_MID_LEFT = 24, PATH_MID_RIGHT = 26;
const PATH_BOTTOM_LEFT = 36, PATH_BOTTOM_RIGHT = 38;

const PATH_ROW_START = 15;
const PATH_COL_START = 4;
const PATH_COL_END = GRID_COLS - 5;

export function createMap() {
    const grid = [];

    for (let row = 0; row < GRID_ROWS; row++) {
        const rowTiles = [];
        for (let col = 0; col < GRID_COLS; col++) {
            rowTiles.push(getTileForCell(row, col));
        }
        grid.push(rowTiles);
    }

    const path = {
        start: { x: PATH_COL_START * TILE_SIZE, y: (PATH_ROW_START + 1) * TILE_SIZE + TILE_SIZE / 2 },
        end: { x: (PATH_COL_END + 1) * TILE_SIZE, y: (PATH_ROW_START + 1) * TILE_SIZE + TILE_SIZE / 2 }
    }

    const objects = createObjects();
    return { grid, path, objects };
}

function getTileForCell(row, col) {
    const rowOffset = row - PATH_ROW_START; 
    const isPathRow = rowOffset >= 0 && rowOffset <= 2;
    const isPathCol = col >= PATH_COL_START && col <= PATH_COL_END;

    if (isPathRow && isPathCol){
        const isFirstCol = col === PATH_COL_START;
        const isLastCol = col === PATH_COL_END;

        if (rowOffset === 0) return isFirstCol ? PATH_TOP_LEFT : isLastCol ? PATH_TOP_RIGHT : PATH_TOP;
        if (rowOffset === 1) return isFirstCol ? PATH_MID_LEFT : isLastCol ? PATH_MID_RIGHT : PATH_MID;
        return isFirstCol ? PATH_BOTTOM_LEFT : isLastCol ? PATH_BOTTOM_RIGHT : PATH_BOTTOM;
    }

    return GRASS_IDS[Math.floor(Math.random() * GRASS_IDS.length)];
}

function createObjects() {
  const objects = [];

  addStackedTree(objects, 6, PATH_ROW_START - 2, 3, 15);
  addStackedTree(objects, 10, PATH_ROW_START - 2, 4, 16);
  addStackedTree(objects, 20, PATH_ROW_START - 2, 4, 16);
  addStackedTree(objects, 30, PATH_ROW_START - 2, 3, 15);
  addStackedTree(objects, 8, PATH_ROW_START + 5, 4, 16);
  addStackedTree(objects, 25, PATH_ROW_START + 5, 3, 15);

  objects.push({ tileId: 27, col: 15, row: PATH_ROW_START - 2 });
  objects.push({ tileId: 5, col: 18, row: PATH_ROW_START + 5 });
  objects.push({ tileId: 29, col: 22, row: PATH_ROW_START - 1 });
  objects.push({ tileId: 43, col: 12, row: PATH_ROW_START + 4 });

  return objects;
}

function addStackedTree(objects, col, topRow, topTileId, trunkTileId) {
  objects.push({ tileId: topTileId, col, row: topRow });
  objects.push({ tileId: trunkTileId, col, row: topRow + 1 });
}