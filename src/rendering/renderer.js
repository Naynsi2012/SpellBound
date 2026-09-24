import { TILE_SIZE } from "../core/constants.js";
import { PREFABS, getPrefabSize } from "../map/prefabs.js";
import { getAnimState } from "../entities/animation.js";

const OBJECT_SCALE = 2;
const ENEMY_SCALE = 2;
const PLATFORM_SCALE = 2;

const SPELL_COLORS = {
    none: "#aaaaaa",
    slow: "#4fa8e0",
    burn: "#e0703f",
    paralyze: "#e0dd4f",
}

const SPELL_LABELS = {
    none: "No Spell",
    slow: "Slow",
    burn: "Burn",
    paralyze: "Paralyze"
}

// Fill this in once you have real sprite sheets — one entry per
// spriteId, with frame count + speed per animation state. Until an
// entry exists here, enemies just draw as a single static image.
const ANIMATIONS = {
    // ghost: {
    //     walk:   { frames: 4, frameDuration: 150 },
    //     attack: { frames: 3, frameDuration: 120 },
    //     hit:    { frames: 1, frameDuration: 240 },
    //     death:  { frames: 4, frameDuration: 150 }
    // }
};

export class Renderer {
    constructor(canvas, ctx, tiles, enemySprites) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.tiles = tiles;
        this.enemySprites = enemySprites;
        this.ctx.imageSmoothingEnabled = false;
    }

    render(options){
        const { map, enemies, typedBuffer, matchedSequence, lockedEnemy,
                platform, state, mana, maxMana, combo, activeSpell,
                menuOptions, selectedIndex, trainingMode, waveNumber, waveCount
            } = options;

        this.clear();

        if (state === "menu"){
            this.drawMenuScreen(menuOptions, selectedIndex);
            return;
        }

        this.drawGrid(map);
        this.drawObjects(map);
        this.drawPlatform(platform);
        this.drawEnemies(enemies, matchedSequence, lockedEnemy);
        this.drawInputBox(typedBuffer);

        if (!trainingMode){
            this.drawManaBar(mana, maxMana);
            this.drawComboIndicator(combo);
        }

        this.drawSpellIndicator(activeSpell);
        if (!trainingMode) this.drawBaseHudBar(platform);

        if (state === "ready") this.drawReadyScreen();
        if (state === "gameover") this.drawGameOverScreen();
        if (state === "victory") this.drawVictoryScreen();
        if (state === "waveComplete") this.drawWaveCompleteScreen(waveNumber, waveCount);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawMenuScreen(options, selectedIndex){
        this.ctx.fillStyle = "#1a1a2e";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        this.ctx.font = "bold 28px monospace";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText("Spellbound Keep", this.canvas.width / 2, 140);

        this.ctx.font = "12px monospace";
        this.ctx.fillStyle = "#8888aa";
        this.ctx.fillText("Arrow keys to move, Enter to select", this.canvas.width / 2, 175);

        const startY = 250;
        const spacing = 44;

        options.forEach((option, index) => {
            const y = startY + index * spacing;
            const isSelected = index === selectedIndex;

            if (isSelected){
                this.ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
                this.ctx.fillRect(this.canvas.width / 2 - 140, y - 18, 280, 36);
                this.ctx.strokeStyle = "#ffffff";
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(this.canvas.width / 2 - 140, y - 18, 280, 36);
            }

            this.ctx.font = "bold 16px monospace";
            this.ctx.fillStyle = isSelected ? "#ffffff" : "#888888";
            this.ctx.fillText((isSelected ? "> " : "") + option.label, this.canvas.width / 2, y);
        })
    }

    drawGrid(map) {
        map.grid.forEach((row, rowIndex) => {
            row.forEach((tileId, colIndex) => {
                const img = this.tiles[tileId];
                if (!img) return;
                this.ctx.drawImage(img, colIndex * TILE_SIZE, rowIndex * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            });
        });
    }

    drawPrefab(type, col, row, scale) {
        const prefab = PREFABS[type];
        if (!prefab) return;

        const size = TILE_SIZE * scale;
        const originX = col * TILE_SIZE;
        const originY = row * TILE_SIZE;

        for (const tile of prefab) {
            const img = this.tiles[tile.tileId];
            if (!img) continue;

            const x = originX + tile.dcol * size;
            const y = originY + tile.drow * size;

            this.ctx.drawImage(img, x, y, size, size);
        }
    }

    drawObjects(map) {
        for (const object of map.objects) {
            this.drawPrefab(object.kind, object.col, object.row, OBJECT_SCALE);
        }
    }

    drawPlatform(platform) {
        if (!platform) return;

        this.drawPrefab(platform.type, platform.col, platform.row, PLATFORM_SCALE);

        const size = getPrefabSize(platform.type);
        const width = size.cols * TILE_SIZE * PLATFORM_SCALE;

        this.drawPlatformHealthBar(platform, platform.col * TILE_SIZE, platform.row * TILE_SIZE, width);
    }

    drawEnemies(enemies, matchedSequence, lockedEnemy) {
        const visible = enemies.filter((enemy) => !isFlickering(enemy));

        for (const enemy of enemies) {
            const img = this.enemySprites[enemy.spriteId];
            if (!img) continue;

            const width = img.width * ENEMY_SCALE;
            const height = img.height * ENEMY_SCALE;

            const x = enemy.x - width / 2;
            const y = enemy.y - height / 2;

            this.drawEnemySprite(enemy, img, x, y, width, height);

            const barRect = this.getHealthBarRect(Math.round(enemy.x), Math.round(y));
            this.drawEnemyHealthBar(enemy, barRect);
            this.drawStatusIcons(enemy, barRect);
        }

        const placedBubbles = [];

        for (const enemy of visible) {
            const img = this.enemySprites[enemy.spriteId];
            if (!img) continue;

            const height = img.height * ENEMY_SCALE;
            const y = enemy.y - height / 2;

            this.drawEnemyWord(enemy, matchedSequence, Math.round(enemy.x), Math.round(y), enemy === lockedEnemy, placedBubbles);
        }
    }

    drawEnemySprite(enemy, img, x, y, width, height) {
        const animState = getAnimState(enemy);
        const animConfig = ANIMATIONS[enemy.spriteId]?.[animState];

        if (animConfig) {
            const frameIndex = Math.floor(enemy.animTimer / animConfig.frameDuration) % animConfig.frames;
            const frameWidth = img.width / animConfig.frames;
            this.ctx.drawImage(img, frameIndex * frameWidth, 0, frameWidth, img.height, x, y, width, height);
        } else {
            this.ctx.drawImage(img, x, y, width, height);
        }
    }

    getHealthBarRect(centerX, enemyTopY) {
        const width = 30;
        const height = 4;
        const x = Math.round(centerX - width / 2);
        const y = Math.round(enemyTopY - 10);
        return { x, y, width, height };
    }

    drawEnemyHealthBar(enemy, rect) {
        const healthRatio = Math.max(0, Math.min(1, enemy.health / enemy.maxHealth));

        this.ctx.fillStyle = "#171717";
        this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

        this.ctx.fillStyle = "#65d85a";
        this.ctx.fillRect(rect.x + 1, rect.y + 1, Math.round((rect.width - 2) * healthRatio), rect.height - 2);

        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
    }

    drawStatusIcons(enemy, rect) {
        const dots = [];

        if (enemy.slowTimer > 0) dots.push(SPELL_COLORS.slow);
        if (enemy.burnTimer > 0) dots.push(SPELL_COLORS.burn);
        if (enemy.paralyzedTimer > 0) dots.push(SPELL_COLORS.paralyze);

        if (dots.length === 0) return;

        const radius = 2.5;
        const gap = 3;
        const startX = rect.x + rect.width + gap + radius;
        const y = rect.y + rect.height / 2;

        dots.forEach((color, i) => {
            this.ctx.beginPath();
            this.ctx.arc(startX + i * (radius * 2 + gap), y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
        })
    }

    drawEnemyWord(enemy, matchedSequence, centerX, enemyTopY, isLocked, placedBubbles) {
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

        const barRect = this.getHealthBarRect(centerX, enemyTopY);
        const margin = 4;

        const bubbleCenterX = Math.round(centerX);
        const bubbleX = Math.round(bubbleCenterX - bubbleWidth / 2);
        let bubbleY = barRect.y - bubbleHeight - margin;

        let attempts = 0;
        while (attempts < 20 && overlapsAny(bubbleX, bubbleY, bubbleWidth, bubbleHeight, placedBubbles)) {
            bubbleY -= bubbleHeight + 4;
            attempts++;
        }

        placedBubbles.push({ x: bubbleX, y: bubbleY, width: bubbleWidth, height: bubbleHeight });

        this.ctx.fillStyle = "#252525";
        this.ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);

        this.ctx.strokeStyle = "#111";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(bubbleX + 0.5, bubbleY + 0.5, bubbleWidth - 1, bubbleHeight - 1);

        this.ctx.fillStyle = "#252525";
        this.ctx.beginPath();
        this.ctx.moveTo(bubbleCenterX - 4, bubbleY + bubbleHeight);
        this.ctx.lineTo(bubbleCenterX, bubbleY + bubbleHeight + 4);
        this.ctx.lineTo(bubbleCenterX + 4, bubbleY + bubbleHeight);
        this.ctx.fill();

        const textX = Math.round(bubbleX + paddingX);
        const textY = Math.round(bubbleY + bubbleHeight / 2);
        const typeWidth = this.ctx.measureText(typed).width;

        this.ctx.fillStyle = "#6dff6d";
        this.ctx.fillText(typed, textX, textY);

        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText(remaining, textX + typeWidth, textY);
    }

    drawInputBox(buffer) {
        const boxWidth = 300;
        const boxHeight = 30;
        const x = (this.canvas.width - boxWidth) / 2;
        const y = this.canvas.height - boxHeight - 10;

        this.ctx.font = "16px monospace";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText(buffer, x + boxWidth / 2, y + boxHeight / 2);
    }

    drawManaBar(mana, maxMana){
        const x = 12, y = 12, width = 160, height = 14;
        const ratio = Math.max(0, mana / maxMana);

        this.ctx.fillStyle = "#171717";
        this.ctx.fillRect(x, y, width, height);

        this.ctx.fillStyle = "#4f8fe0";
        this.ctx.fillRect(x + 1, y + 1, (width - 2) * ratio, height - 2);

        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);

        this.ctx.font = "10px monospace";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(`Mana ${Math.floor(mana)}/${maxMana}`, x + width + 8, y + height / 2);
    }

    drawComboIndicator(combo){
        if (combo <= 0) return;

        this.ctx.font = "bold 12px monospace";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = combo >= 10 ? "#ffcf4f" : "#ffffff";
        this.ctx.fillText(`Combo x${combo}`, 12, 40);
    }

    drawSpellIndicator(activeSpell){
        const label = SPELL_LABELS[activeSpell] ?? activeSpell;
        const color = SPELL_COLORS[activeSpell] ?? "#ffffff";

        const width = 130, height = 22;
        const x = this.canvas.width - width - 12, y = 12;

        this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.fillRect(x, y, width, height);

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);

        this.ctx.beginPath();
        this.ctx.arc(x + 14, y + height / 2, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();

        this.ctx.font = "11px monospace";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(label + " (Tab)", x + 26, y + height / 2 + 1);
    }

    drawPlatformHealthBar(platform, x, y, width) {
        const barHeight = 10;
        const barY = y - barHeight - 8;
        const ratio = Math.max(0, platform.health / platform.maxHealth);

        this.ctx.fillStyle = "#0a0a0a";
        this.ctx.fillRect(x - 2, barY - 2, width + 4, barHeight + 4);

        this.ctx.fillStyle = "#3a1a1a";
        this.ctx.fillRect(x, barY, width, barHeight);

        const fillWidth = (width - 2) * ratio;
        this.ctx.fillStyle = "#c0392b";
        this.ctx.fillRect(x + 1, barY + barHeight / 2, fillWidth, barHeight / 2 - 1);
        this.ctx.fillStyle = "#e74c3c";
        this.ctx.fillRect(x + 1, barY + 1, fillWidth, barHeight / 2 - 1);

        this.ctx.strokeStyle = "#d4af37";
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(x + 0.5, barY + 0.5, width - 1, barHeight - 1);
    }

    drawBaseHudBar(platform) {
        const width = 200, height = 16;
        const x = (this.canvas.width - width) / 2, y = 10;
        const ratio = Math.max(0, platform.health / platform.maxHealth);

        this.ctx.font = "bold 10px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#d4af37";
        this.ctx.fillText("KEEP", x + width / 2, y - 4);

        this.ctx.fillStyle = "#3a1a1a";
        this.ctx.fillRect(x, y, width, height);

        this.ctx.fillStyle = "#e74c3c";
        this.ctx.fillRect(x + 1, y + 1, (width - 2) * ratio, height - 2);

        this.ctx.strokeStyle = "#d4af37";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
    }

    drawReadyScreen() {
        this.drawOverlay("Press ENTER to start the wave");
    }

    drawGameOverScreen() {
        this.drawOverlay("Game Over - Press ENTER to restart");
    }

    drawVictoryScreen() {
        this.drawOverlay("Victory! All waves cleared - Press ENTER to return to menu");
    }

    drawWaveCompleteScreen(waveNumber, waveCount) {
        this.drawOverlay(`Wave ${waveNumber} cleared! Press ENTER for wave ${waveNumber + 1}/${waveCount}`)
    }

    drawOverlay(promptText) {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        this.ctx.font = "bold 14px monospace";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText(promptText, this.canvas.width / 2, this.canvas.height / 2);
    }
}

function matchedPrefixLength(buffer, word) {
    let i = 0;
    while (i < buffer.length && i < word.length && buffer[i] === word[i]) i++;
    return i;
}

function isFlickering(enemy) {
    if (enemy.flashTimer <= 0) return false;
    return Math.floor(enemy.flashTimer / 60) % 2 === 0;
}

function overlapsAny(x, y, width, height, rects) {
    return rects.some((r) =>
        x < r.x + r.width &&
        x + width > r.x &&
        y < r.y + r.height &&
        y + height > r.y
    );
}