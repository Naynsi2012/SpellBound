import { GRID_COLS, GRID_ROWS } from "../core/constants.js";

export function createMap() {
    const grid = [];
    const grassKeys = ["grass", "grass", "grass", "grass", "grassTexture", "grassFlowers"];

    for (let row = 0; row < GRID_ROWS; row++) {
        const rowTiles = [];
        
        for (let col = 0; col < GRID_COLS; col++) {
            const key = grassKeys[Math.floor(Math.random() * grassKeys.length)];
            rowTiles.push(key);
        }

        grid.push(rowTiles);
    }

    return { grid }
}