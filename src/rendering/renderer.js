import { TILE_SIZE } from "../core/constants.js"

export class Renderer {
    constructor(canvas, ctx, tiles) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.tiles = tiles;

        this.ctx.imageSmoothingEnabled = false; // Stops browser blurring scaled pixel graphics
    }

    render(map) {
        this.clear();
        this.drawGrid(map);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid(map) {
        map.grid.forEach((row, rowIndex) => {
            row.forEach((tileKey, colIndex) => {
                const img = this.tiles[tileKey];
                this.ctx.drawImage(img, colIndex * TILE_SIZE, rowIndex * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            })
        })
    }

    drawPath(map) {
        const { start, end } = map.path;

        this.ctx.fillStyle = "#555";
        this.ctx.fillRect(start.x, start.y - 30, end.x - start.x, 60);
    }

    drawKeep(map) {
        const { x, y } = map.keep;

        this.ctx.fillStyle = "#777";
        this.ctx.fillRect(x, y - 80, 100, 160);
    }
}