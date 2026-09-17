import { GRID_COLS, GRID_ROWS, TILE_SIZE } from "../core/constants.js";

export function createPath(pathData){
    if (!pathData || !Array.isArray(pathData.points)){
        throw new Error("Map path must contain a 'points' array")
    }

    const centerline = rasterizeWaypoints(pathData.points)

    const radius = pathData.width === undefined ? 1 : Math.floor((pathData.width - 1) / 2);

    const cells = thickenPath(centerline, Math.max(0, radius));
    const cellSet = new Set(cells.map(({col, row}) => `${col},${row}`))

    // Enemies move along the centerline
    const points = centerline.map(({col, row}) => ({
        x: col * TILE_SIZE + TILE_SIZE / 2,
        y: row * TILE_SIZE + TILE_SIZE / 2
    }))

    if (points.length === 0){
        throw new Error("Map path contains no usable points")
    }

    return {
        waypoints: pathData.points,
        centerline,
        cells,
        cellSet,
        points,
        start: points[0],
        end: points[points.length - 1]
    }
}

// Convert waypoint to waypoint segments into individual grid cells
function rasterizeWaypoints(waypoints){
    const cells = [];

    for (let i = 0; i < waypoints.length - 1; i++){
        const start = waypoints[i];
        const end = waypoints[i+1];

        const horizontal = start.row === end.row;
        const vertical = start.col === end.col;

        if (!horizontal && !vertical){
            throw new Error(`Invalid path segment between (${start.col}, ${start.row}) and (${end.col}, ${end.row}). ` + `Path points must connect horizontally or vertically.`)
        }

        validatePoint(start);
        validatePoint(end);

        const stepCol = Math.sign(end.col - start.col);
        const stepRow = Math.sign(end.row - start.row);

        let col = start.col;
        let row = start.row;

        // Adding the first point for only once
        if (i === 0) cells.push({col, row})
        
        while (col !== end.col || row !== end.row){
            col += stepCol;
            row += stepRow;

            cells.push({col, row})
        }
    }

    // If there is only one waypoint then still allow it as a a valid starting point.
    if (waypoints.length === 1){
        validatePoint(waypoints[0])

        cells.push({
            col: waypoints[0].col,
            row: waypoints[0].row
        })
    }
    
    return cells;
}

function thickenPath(centerline, radius){
    const cells = new Map();

    for (const point of centerline){
        for (let dy = -radius; dy <= radius; dy++){
            for (let dx = -radius; dx <= radius; dx++){
                const col = point.col + dx;
                const row = point.row + dy;

                if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) continue;

                cells.set(`${col},${row}`, {col, row})
            }
        }
    }

    return [...cells.values()]
}

function validatePoint(point){
    if (point.col < 0 || point.col >= GRID_COLS || point.row < 0 || point.row >= GRID_ROWS){
        throw new Error(`Path point (${point.col}, ${point.row}) is outside the map`)
    }
}