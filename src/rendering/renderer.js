import { TILE_SIZE } from "../core/constants.js";
import { TILE } from "../map/tiles.js";

const OBJECT_SCALE = 2;
const ENEMY_SCALE = 2;

export class Renderer {
    constructor(canvas, ctx, tiles, enemySprites) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.tiles = tiles;
        this.enemySprites = enemySprites;
        this.ctx.imageSmoothingEnabled = false;
    }

    render(map, enemies, typedBuffer) {
        this.clear();
        this.drawGrid(map);
        this.drawObjects(map);
        this.drawEnemies(enemies, typedBuffer);
        this.drawInputBox(typedBuffer);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid(map) {
        map.grid.forEach(
            (row, rowIndex) => {
                row.forEach(
                    (tileId, colIndex) => {
                        const img = this.tiles[tileId];
                        if (!img) return;

                        this.ctx.drawImage(img, colIndex * TILE_SIZE, rowIndex * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    }
                );
            }
        );
    }

    drawObjects(map) {
        for (const object of map.objects) {
            this.drawObject(object);
        }
    }

    drawObject(object) {
        const tileIds = this.getObjectTiles(object);
        if (!tileIds) return;

        for (const item of tileIds){
            const img = this.tiles[item.tileId];
            if (!img) continue;

            const width = TILE_SIZE * OBJECT_SCALE;
            const height = TILE_SIZE *OBJECT_SCALE;

            this.ctx.drawImage(img, item.col * TILE_SIZE - TILE_SIZE / 2, item.row * TILE_SIZE - TILE_SIZE, width, height);
        }
    }

    getObjectTiles(object) {
        const {kind, col, row} = object;

        switch (kind) {
            case "greenTree":
                return [
                    {
                        tileId: TILE.objects.greenTreeTop,
                        col,
                        row: row - 2
                    },
                    {
                        tileId: TILE.objects.greenTreeTrunk,
                        col,
                        row: row
                    }
                ];

            case "orangeTree":
                return [
                    {
                        tileId: TILE.objects.orangeTreeTop,
                        col,
                        row: row - 2
                    },
                    {
                        tileId: TILE.objects.orangeTreeTrunk,
                        col,
                        row
                    }
                ];

            case "singleTree":
                return [
                    {
                        tileId: TILE.objects.singleTree,
                        col,
                        row
                    }
                ];

            case "greenBush":
                return [
                    {
                        tileId: TILE.objects.greenBush,
                        col,
                        row
                    }
                ];

            case "orangeBush":
                return [
                    {
                        tileId: TILE.objects.orangeBush,
                        col,
                        row
                    }
                ];

            case "mushroom":
                return [
                    {
                        tileId: TILE.objects.mushroom,
                        col,
                        row
                    }
                ];

            case "vine":
                return [
                    {
                        tileId: TILE.objects.vine,
                        col,
                        row
                    }
                ];

            case "pebbles":
                return [
                    {
                        tileId: TILE.objects.pebbles,
                        col,
                        row
                    }
                ];

            default: return null;
        }
    }

    drawEnemies(enemies, typedBuffer) {
        for (const enemy of enemies) {
            const img = this.enemySprites[enemy.spriteId];
            if (!img) continue;

            const width = img.width * ENEMY_SCALE;
            const height = img.height * ENEMY_SCALE;

            // Draw the enemy at 2x
            this.ctx.drawImage(img, enemy.x - width / 2, enemy.y - height / 2, width, height);

            this.drawEnemyWord(enemy, typedBuffer, enemy.y - height / 2 - 6)
        }
    }

    drawEnemyWord(enemy, typedBuffer, textY){
        const word = enemy.word
        const matched = matchedPrefixLength(typedBuffer, word)

        const typed = word.slice(0, matched)
        const remaining = word.slice(matched)

        this.ctx.font = "bold 12px monospace"
        this.ctx.textAlign = "left"
        this.ctx.textBaseline = "bottom"

        const totalWidth = this.ctx.measureText(word).width;
        const startX = enemy.x - totalWidth / 2;

        this.ctx.fillStyle = "rgba(0, 0, 0, 0.65)"
        this.ctx.fillRect(startX - 3, textY - 12, totalWidth + 6, 14)

        const typedWidth = this.ctx.measureText(typed).width

        this.ctx.fillStyle = "#6dff6d"
        this.ctx.fillText(typed, startX, textY)

        this.ctx.fillStyle = "#ffffff"
        this.ctx.fillText(remaining, startX + typedWidth, textY);
    }

    drawInputBox(buffer){
        const boxWidth = 300;
        const boxHeight = 30;
        const x = (this.canvas.width - boxWidth) / 2;
        const y = this.canvas.height - boxHeight - 10;

        this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        this.ctx.fillRect(x, y, boxWidth, boxHeight);

        this.ctx.strokeStyle = "#ffffff"
        this.ctx.lineWidth = 1
        this.ctx.strokeRect(x, y, boxWidth, boxHeight)

        this.ctx.font = "16px monospace"
        this.ctx.textAlign = "left"
        this.ctx.textBaseline = "middle"

        if (buffer.length === 0){
            this.ctx.filLStyle = "#888888"
            this.ctx.fillText("type the enemy's word...", x + 8, y + boxHeight / 2)
        } else{
            this.ctx.fillStyle = "#ffffff"
            this.ctx.fillText(buffer, x + 8, y + boxHeight / 2)
        }
    }
}

function matchedPrefixLength(buffer, word){
    let i = 0;
    while (i < buffer.length && i < word.length && buffer[i] === word[i]) i++

    return i;
}