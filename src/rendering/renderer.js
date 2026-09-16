import { TILE_SIZE } from "../core/constants.js"

export class Renderer {
    constructor(canvas, ctx, tiles, enemySprites) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.tiles = tiles;
        this.enemySprites = enemySprites;
        this.ctx.imageSmoothingEnabled = false; // Stops browser blurring scaled pixel graphics
    }

    render(map, enemies) {
        this.clear();
        this.drawGrid(map);
        this.drawObjects(map);
        this.drawEnemies(enemies);
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

    drawObjects(map) {
        map.objects.forEach(({ tileId, col, row }) => {
            const img = this.tiles[tileId];
            this.ctx.drawImage(img, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        })
    }

    drawEnemies(enemies) {
        enemies.forEach((enemy) => {
            const img = this.enemySprites[enemy.spriteId];
            this.ctx.drawImage(img, enemy.x - img.width / 2, enemy.y - img.height / 2);
        })
    }
}