import { TILE_SIZE } from "../core/constants.js";
import { TILE } from "../map/tiles.js";

const OBJECT_SCALE = 2;
const ENEMY_SCALE = 2;
const PLATFORM_SCALE = 3;

export class Renderer {
    constructor(canvas, ctx, tiles, enemySprites) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.tiles = tiles;
        this.enemySprites = enemySprites;
        this.ctx.imageSmoothingEnabled = false;
    }

    render(map, enemies, typedBuffer, matchedSequence, lockedEnemy, platform, state) {
        this.clear();
        this.drawGrid(map);
        this.drawObjects(map);
        this.drawPlatform(platform);
        this.drawEnemies(enemies, matchedSequence, lockedEnemy);
        this.drawInputBox(typedBuffer);

        if (state === "ready") this.drawReadyScreen();
        if (state === "gameover") this.drawGameOverScreen();
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

            case "houseStone":
                return [
                    { tileId: 60, col: col - 1, row: row - 2 },
                    { tileId: 63, col, row: row - 2 },
                    { tileId: 62, col: col + 1, row: row - 2 },
                    { tileId: 48, col: col - 1, row: row - 1 },
                    { tileId: 49, col, row: row - 1 },
                    { tileId: 50, col: col + 1, row: row - 1 },
                    { tileId: 48, col: col - 1, row },
                    { tileId: 89, col, row },
                    { tileId: 50, col: col + 1, row }
                ];

            case "houseOrange":
                return [
                    { tileId: 64, col: col - 1, row: row - 2 },
                    { tileId: 67, col, row: row - 2 },
                    { tileId: 66, col: col + 1, row: row - 2 },
                    { tileId: 52, col: col - 1, row: row - 1 },
                    { tileId: 53, col, row: row - 1 },
                    { tileId: 54, col: col + 1, row: row - 1 },
                    { tileId: 52, col: col - 1, row },
                    { tileId: 85, col, row },
                    { tileId: 54, col: col + 1, row }
                ];

            case "fence":
                return [{ tileId: 81, col, row }]

            case "fencePost":
                return [{ tileId: 82, col, row }]

            case "signpost":
                return [{ tileId: 83, col, row }]

            default: return null;
        }
    }

    drawEnemies(enemies, matchedSequence, lockedEnemy) {
        for (const enemy of enemies) {
            if (isFlickering(enemy)) continue;

            const img = this.enemySprites[enemy.spriteId];
            if (!img) continue;

            const width = img.width * ENEMY_SCALE;
            const height = img.height * ENEMY_SCALE;

            const x = enemy.x - width / 2;
            const y = enemy.y - height / 2;

            this.ctx.drawImage(img, x, y, width, height);

            const uiX = Math.round(enemy.x);
            const uiY = Math.round(y);

            this.drawEnemyHealthBar(enemy, uiX, uiY)
            this.drawEnemyWord(enemy, matchedSequence, uiX, uiY, enemy === lockedEnemy);
        }
    }

    drawEnemyHealthBar(enemy, centerX, enemyTopY){
        const barWidth = 30;
        const barHeight = 4;

        const x = Math.round(centerX - barWidth / 2);
        const y = Math.round(enemyTopY - 6);

        const healthRatio = Math.max(0, Math.min(1, enemy.health / enemy.maxHealth));

        this.ctx.fillStyle = "#171717";
        this.ctx.fillRect(x, y, barWidth, barHeight);

        this.ctx.fillStyle = "#65d85a";
        this.ctx.fillRect(x + 1, y + 1, Math.round((barWidth - 2) * healthRatio), barHeight - 2);

        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 0.5, y + 0.5, barWidth - 1, barHeight - 1);
    }
    
    drawEnemyWord(enemy, matchedSequence, centerX, enemyTopY, isLocked){
        const word = enemy.getCurrentWord();
        const matched = isLocked ? matchedPrefixLength(matchedSequence, word) : 0;

        const typed = word.slice(0, matched);
        const remaining = word.slice(matched);

        this.ctx.font = "bold 12px monospace";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "middle";

        const paddingX = 5;
        const textWidth = this.ctx.measureText(word).width;

        const bubbleWidth = Math.ceil(textWidth + paddingX * 2);
        const bubbleHeight = 18;

        const bubbleCenterX = Math.round(centerX);
        const bubbleX = Math.round(bubbleCenterX - bubbleWidth / 2);
        const bubbleY = Math.round(enemyTopY - 30);

        // bubble background
        this.ctx.fillStyle = "#252525";
        this.ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);

        // bubble border
        this.ctx.strokeStyle = "#111";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(bubbleX + 0.5, bubbleY + 0.5, bubbleWidth - 1, bubbleHeight - 1);

        // small bubble pointer
        this.ctx.fillStyle = "#252525";
        this.ctx.beginPath();
        this.ctx.moveTo(bubbleCenterX - 4, bubbleY + bubbleHeight);
        this.ctx.lineTo(bubbleCenterX, bubbleY + bubbleHeight + 4);
        this.ctx.lineTo(bubbleCenterX + 4, bubbleY + bubbleHeight);
        this.ctx.fill();

        // word
        const textX = Math.round(bubbleX + paddingX);
        const textY = Math.round(bubbleY + bubbleHeight / 2);
        const typeWidth = this.ctx.measureText(typed).width;

        this.ctx.fillStyle = "#6dff6d";
        this.ctx.fillText(typed, textX, textY)

        this.ctx.fillStyle = "#ffffff"
        this.ctx.fillText(remaining, textX + typeWidth, textY)
    }

    drawInputBox(buffer){
        const boxWidth = 300;
        const boxHeight = 30;
        const x = (this.canvas.width - boxWidth) / 2;
        const y = this.canvas.height - boxHeight - 10;

        this.ctx.font = "16px monospace"
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
 
        this.ctx.fillStyle = "#ffffff"
        this.ctx.fillText(buffer, x + boxWidth / 2, y + boxHeight / 2) 
    }

    drawPlatform(platform){
        if (!platform) return;

        const size = TILE_SIZE * PLATFORM_SCALE;
        let maxCol = 0, maxRow = 0;

        for (const t of platform.tiles){
            const img = this.tiles[t.tileId];
            if (!img) continue;

            const x = platform.x + t.dcol * size;
            const y = platform.y + t.drow * size;

            this.ctx.drawImage(img, x, y, size, size);

            maxCol = Math.max(maxCol, t.dcol);
            maxRow = Math.max(maxRow, t.drow);
        }

        const width = (maxCol + 1) * size;
        const height = (maxRow + 1) * size;

        this.drawPlatformHealthBar(platform, platform.x, platform.y, width);
    }

    drawPlatformHealthBar(platform, x, y, width){
        const barWidth = width;
        const barHeight = 8;
        const barY = y - barHeight - 6;
        
        const ratio = Math.max(0, platform.health / platform.maxHealth);

        this.ctx.fillStyle = "#171717";
        this.ctx.fillRect(x, barY, barWidth, barHeight);

        this.ctx.fillStyle = "#e05a4e";
        this.ctx.fillRect(x + 1, barY + 1, (barWidth - 2) * ratio, barHeight - 2);

        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 0.5, barY + 0.5, barWidth - 1, barHeight - 1);
    }

    drawReadyScreen(){
        this.drawOverlay("Press ENTER to start the wave");
    }

    drawGameOverScreen(){
        this.drawOverlay("Game Over - Press ENTER to restart");
    }

    drawOverlay(promptText){
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        this.ctx.font = "bold 14px monospace";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText(promptText, this.canvas.width / 2, this.canvas.height / 2);
    }
}

function matchedPrefixLength(buffer, word){
    let i = 0;
    while (i < buffer.length && i < word.length && buffer[i] === word[i]) i++

    return i;
}

function isFlickering(enemy){
    if (enemy.flashTimer <= 0) return false;
    return Math.floor(enemy.flashTimer / 60) % 2 === 0;
}