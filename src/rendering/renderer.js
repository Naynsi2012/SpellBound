import { getAnimState } from "../entities/animation.js";
import { resolveTile } from "../map/tmxLoader.js";

const DEFAULT_ENEMY_SCALE = 1; 

const SPELL_COLORS = {
  none: "#aaaaaa",
  slow: "#4fa8e0",
  burn: "#e0703f",
  paralyze: "#e0dd4f",
};

const SPELL_LABELS = {
  none: "No Spell",
  slow: "Slow",
  burn: "Burn",
  paralyze: "Paralyze",
};

const ANIMATIONS = {
  dummy: {
    frameSize: 32,
    scale: 1.25,
    visualTopRatio: 0.156,
    visualBottomRatio: 0.875,
    idle: { row: 0, frames: 4, frameDuration: 180 },
    hurt: { row: 1, frames: 5, frameDuration: 90 },
    death: { row: 2, frames: 8, frameDuration: 150 },
  },
  soldier: {
    frameSize: 96,
    scale: 1.25,
    visualTopRatio: 0.417,
    visualBottomRatio: 0.625,
    walk: { row: 1, frames: 8, frameDuration: 90 },
    hurt: { row: 6, frames: 4, frameDuration: 90 },
    attack: { row: 5, frames: 8, frameDuration: 90 },
    death: { row: 7, frames: 10, frameDuration: 150 },
  },
  slime: {
    frameSize: 96,
    scale: 1.25,
    visualTopRatio: 0.469,
    visualBottomRatio: 0.625,
    walk: { row: 1, frames: 8, frameDuration: 90 },
    hurt: { row: 6, frames: 4, frameDuration: 90 },
    attack: { row: 4, frames: 8, frameDuration: 90 },
    death: { row: 7, frames: 10, frameDuration: 150 },
  },
};

export class Renderer {
  constructor(canvas, ctx, enemySprites, tilesetImages) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.enemySprites = enemySprites;
    this.tilesetImages = tilesetImages;

    this.ctx.imageSmoothingEnabled = false;
  }

  render(options) {
    const {
      map,
      enemies,
      typedBuffer,
      matchedSequence,
      lockedEnemy,
      platform,
      state,
      mana,
      maxMana,
      combo,
      activeSpell,
      menuOptions,
      selectedIndex,
      trainingMode,
      waveNumber,
      waveCount,
    } = options;

    this.clear();

    if (state === "menu") {
      this.drawMenuScreen(menuOptions, selectedIndex);
      return;
    }

    this.drawTmxLayers(map);
    this.drawPlatform(platform);

    this.drawEnemies(enemies, matchedSequence, lockedEnemy, typedBuffer);
    this.drawInputBox(typedBuffer, matchedSequence);

    if (!trainingMode) {
      this.drawManaBar(mana, maxMana);
      this.drawComboIndicator(combo);
    }

    this.drawSpellIndicator(activeSpell);

    if (!trainingMode) {
      this.drawBaseHudBar(platform);
    }

    if (state === "ready") {
      this.drawReadyScreen();
    }

    if (state === "gameover") {
      this.drawGameOverScreen();
    }

    if (state === "victory") {
      this.drawVictoryScreen();
    }

    if (state === "waveComplete") {
      this.drawWaveCompleteScreen(waveNumber, waveCount);
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawMenuScreen(options, selectedIndex) {
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    this.ctx.font = "bold 28px monospace";
    this.ctx.fillStyle = "#ffffff";

    this.ctx.fillText("Spellbound Keep", this.canvas.width / 2, 140);

    this.ctx.font = "12px monospace";
    this.ctx.fillStyle = "#8888aa";

    this.ctx.fillText(
      "Arrow keys to move, Enter to select",
      this.canvas.width / 2,
      175,
    );

    const startY = 250;
    const spacing = 44;

    options.forEach((option, index) => {
      const y = startY + index * spacing;
      const isSelected = index === selectedIndex;

      if (isSelected) {
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.12)";

        this.ctx.fillRect(this.canvas.width / 2 - 140, y - 18, 280, 36);

        this.ctx.strokeStyle = "#ffffff";
        this.ctx.lineWidth = 1;

        this.ctx.strokeRect(this.canvas.width / 2 - 140, y - 18, 280, 36);
      }

      this.ctx.font = "bold 16px monospace";
      this.ctx.fillStyle = isSelected ? "#ffffff" : "#888888";

      this.ctx.fillText(
        (isSelected ? "> " : "") + option.label,
        this.canvas.width / 2,
        y,
      );
    });
  }

  drawTmxLayers(map) {
    const { cols, tileSize, tilesets, layers } = map;

    for (const layer of layers) {
      layer.gids.forEach((gid, index) => {
        const resolved = resolveTile(gid, tilesets);
        if (!resolved) return;

        const img = this.tilesetImages[resolved.tileset.name];
        if (!img) return;

        const localCol = resolved.localId % resolved.tileset.columns;
        const localRow = Math.floor(
          resolved.localId / resolved.tileset.columns,
        );

        const col = index % cols;
        const row = Math.floor(index / cols);

        this.ctx.drawImage(
          img,
          localCol * tileSize,
          localRow * tileSize,
          tileSize,
          tileSize,
          col * tileSize,
          row * tileSize,
          tileSize,
          tileSize,
        );
      });
    }
  }

  drawPlatform(platform) {
    if (!platform) return;
    this.drawPlatformHealthBar(
      platform,
      platform.x,
      platform.y,
      platform.width,
    );
  }

  drawEnemies(enemies, matchedSequence, lockedEnemy) {
    const visible = enemies;

    const placedBubbles = [];
    const plans = [];

    for (const enemy of visible) {
      const img = this.enemySprites[enemy.spriteId];
      if (!img) continue;

      const animConfig = ANIMATIONS[enemy.spriteId];
      const frameSize = animConfig?.frameSize ?? img.width;
      const scale = animConfig?.scale ?? DEFAULT_ENEMY_SCALE;
      const width = frameSize * scale;
      const height = frameSize * scale;

      const x = enemy.x - width / 2;
      const y = enemy.y - height / 2;

      const visualTopY = y + height * (animConfig?.visualTopRatio ?? 0);
      const visualBottomY = y + height * (animConfig?.visualBottomRatio ?? 1);

      const centerX = Math.round(enemy.x);
      const aboveBarRect = this.getHealthBarRect(
        centerX,
        Math.round(visualTopY),
      );

      // Skip the word bubble entirely while the death animation is playing
      const isLocked = enemy === lockedEnemy;
      const isDead = !enemy.isAlive();

      const layout =
        isDead || getAnimState(enemy) === "death"
          ? null
          : this.measureWordBubble(enemy, matchedSequence, isLocked, scale);

      let barRect = aboveBarRect;
      let bubblePlan = null;

      if (layout) {
        const aboveGap = 6;
        const bubbleX = Math.round(centerX - layout.bubbleWidth / 2);
        const aboveBubbleY = Math.round(
          aboveBarRect.y - aboveGap - layout.bubbleHeight,
        );

        if (
          !overlapsAny(
            bubbleX,
            aboveBubbleY,
            layout.bubbleWidth,
            layout.bubbleHeight,
            placedBubbles,
          )
        ) {
          bubblePlan = { x: bubbleX, y: aboveBubbleY, pointsDown: true };
          barRect = aboveBarRect;
        } else {
          // Flip below: a small gap off the actual feet, then the bar,
          // then the bubble right under it.
          const footGap = 4;
          const barBubbleGap = 6;
          const belowBarY = Math.round(visualBottomY + footGap);

          barRect = {
            x: aboveBarRect.x,
            y: belowBarY,
            width: aboveBarRect.width,
            height: aboveBarRect.height,
          };

          const belowBubbleY = Math.round(
            belowBarY + barRect.height + barBubbleGap,
          );

          bubblePlan = { x: bubbleX, y: belowBubbleY, pointsDown: false };
        }

        placedBubbles.push({
          x: bubblePlan.x,
          y: bubblePlan.y,
          width: layout.bubbleWidth,
          height: layout.bubbleHeight,
        });
      }

      plans.push({
        enemy,
        img,
        x,
        y,
        width,
        height,
        centerX,
        barRect,
        layout,
        bubblePlan,
        isLocked,
      });
    }

    // Draw sprites, health bars and status icons.
    for (const plan of plans) {
      this.drawEnemySprite(
        plan.enemy,
        plan.img,
        plan.x,
        plan.y,
        plan.width,
        plan.height,
      );
      this.drawEnemyHealthBar(plan.enemy, plan.barRect);
      this.drawStatusIcons(plan.enemy, plan.barRect);
    }

    // Draw word bubbles on top of everything.
    for (const plan of plans) {
      if (!plan.layout || !plan.bubblePlan) continue;

      this.drawWordBubble(
        plan.layout,
        plan.bubblePlan.x,
        plan.bubblePlan.y,
        plan.bubblePlan.pointsDown,
        plan.centerX,
        plan.isLocked,
      );
    }
  }

  drawEnemySprite(enemy, img, x, y, width, height) {
    if (isFlickering(enemy)) {
      return;
    }

    const animState = getAnimState(enemy);
    const spriteAnim = ANIMATIONS[enemy.spriteId];
    const animConfig = spriteAnim?.[animState];

    const flip = enemy.facingRight === false;

    this.ctx.save();

    if (flip) {
      this.ctx.translate(x + width, y);
      this.ctx.scale(-1, 1);
    } else {
      this.ctx.translate(x, y);
    }

    if (animConfig) {
      const frameSize = spriteAnim.frameSize;
      const frameIndex =
        Math.floor(enemy.animTimer / animConfig.frameDuration) %
        animConfig.frames;
      const sx = frameIndex * frameSize;
      const sy = animConfig.row * frameSize;

      this.ctx.drawImage(
        img,
        sx,
        sy,
        frameSize,
        frameSize,
        0,
        0,
        width,
        height,
      );
    } else {
      this.ctx.drawImage(img, 0, 0, width, height);
    }

    this.ctx.restore();
  }

  getHealthBarRect(centerX, enemyTopY) {
    const width = 30;
    const height = 4;
    const gap = 6;

    const x = Math.round(centerX - width / 2);
    const y = Math.round(enemyTopY - gap - height);

    return { x, y, width, height };
  }

  drawEnemyHealthBar(enemy, rect) {
    const healthRatio = Math.max(
      0,
      Math.min(1, enemy.health / enemy.maxHealth),
    );

    this.ctx.fillStyle = "#171717";
    this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

    this.ctx.fillStyle = "#65d85a";
    this.ctx.fillRect(
      rect.x + 1,
      rect.y + 1,
      Math.round((rect.width - 2) * healthRatio),
      rect.height - 2,
    );

    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 1;

    this.ctx.strokeRect(
      rect.x + 0.5,
      rect.y + 0.5,
      rect.width - 1,
      rect.height - 1,
    );
  }

  drawStatusIcons(enemy, rect) {
    const dots = [];

    if (enemy.slowTimer > 0) {
      dots.push(SPELL_COLORS.slow);
    }
    if (enemy.burnTimer > 0) {
      dots.push(SPELL_COLORS.burn);
    }
    if (enemy.paralyzedTimer > 0) {
      dots.push(SPELL_COLORS.paralyze);
    }

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
    });
  }

  // Measures (but doesn't draw) the word bubble for an enemy, so its size
  // can be used to decide bubble placement before anything is rendered.
  measureWordBubble(enemy, matchedSequence, isLocked, scale) {
    const word = enemy.getCurrentWord();
    if (!word) return null;

    const matchedLength = isLocked ? matchedSequence.length : 0;
    const correctPart = word.slice(0, matchedLength);
    const remainingPart = word.slice(matchedLength);

    const fontSize = Math.max(10, Math.round(14 * scale));
    this.ctx.save();
    this.ctx.font = `bold ${fontSize}px monospace`;
    const correctWidth = this.ctx.measureText(correctPart).width;
    const remainingWidth = this.ctx.measureText(remainingPart).width;
    this.ctx.restore();

    const totalWidth = correctWidth + remainingWidth;
    const paddingX = 10;

    const bubbleWidth = Math.max(36 * scale, totalWidth + paddingX * 2);
    const bubbleHeight = Math.max(18, Math.round(26 * scale));

    return {
      correctPart,
      remainingPart,
      correctWidth,
      remainingWidth,
      totalWidth,
      bubbleWidth,
      bubbleHeight,
      fontSize,
    };
  }

  drawWordBubble(
    layout,
    bubbleX,
    bubbleY,
    pointsDown,
    bubbleCenterX,
    isLocked,
  ) {
    const {
      bubbleWidth,
      bubbleHeight,
      correctPart,
      remainingPart,
      correctWidth,
      totalWidth,
      fontSize,
    } = layout;

    this.ctx.save();

    this.ctx.font = `bold ${fontSize}px monospace`;
    this.ctx.textBaseline = "middle";

    this.ctx.fillStyle = "#252525";
    this.ctx.strokeStyle = isLocked ? "#6dff6d" : "#3a3a3a";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(
      bubbleX,
      bubbleY,
      bubbleWidth,
      bubbleHeight,
      bubbleHeight / 2,
    );
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = "#252525";
    this.ctx.beginPath();

    if (pointsDown) {
      this.ctx.moveTo(bubbleCenterX - 4, bubbleY + bubbleHeight);
      this.ctx.lineTo(bubbleCenterX, bubbleY + bubbleHeight + 4);
      this.ctx.lineTo(bubbleCenterX + 4, bubbleY + bubbleHeight);
    } else {
      this.ctx.moveTo(bubbleCenterX - 4, bubbleY);
      this.ctx.lineTo(bubbleCenterX, bubbleY - 4);
      this.ctx.lineTo(bubbleCenterX + 4, bubbleY);
    }

    this.ctx.fill();

    let textX = bubbleX + (bubbleWidth - totalWidth) / 2;
    const textY = bubbleY + bubbleHeight / 2;

    if (correctPart.length > 0) {
      this.ctx.textAlign = "left";
      this.ctx.fillStyle = "#6dff6d";
      this.ctx.fillText(correctPart, textX, textY);
      textX += correctWidth;
    }

    if (remainingPart.length > 0) {
      this.ctx.textAlign = "left";
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fillText(remainingPart, textX, textY);
    }

    this.ctx.restore();
  }

  drawInputBox(buffer, matchedSequence) {
    const boxWidth = 300;
    const boxHeight = 30;

    const x = (this.canvas.width - boxWidth) / 2;
    const y = this.canvas.height - boxHeight - 10;

    this.ctx.fillStyle = "rgba(20, 20, 20, 0.9)";
    this.ctx.fillRect(x, y, boxWidth, boxHeight);

    this.ctx.strokeStyle = "#555555";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x + 0.5, y + 0.5, boxWidth - 1, boxHeight - 1);

    this.ctx.font = "16px monospace";
    this.ctx.textBaseline = "middle";

    // The input box uses the exact same correct/wrong split as the enemy bubble
    const typed = buffer || "";
    const matchedLength = matchedSequence ? matchedSequence.length : 0;

    const correctPart = typed.slice(0, matchedLength);
    const wrongPart = typed.slice(matchedLength);

    const correctWidth = this.ctx.measureText(correctPart).width;
    const wrongWidth = this.ctx.measureText(wrongPart).width;
    const totalWidth = correctWidth + wrongWidth;

    let textX = x + boxWidth / 2 - totalWidth / 2;
    const textY = y + boxHeight / 2;

    // Correct input
    if (correctPart.length > 0) {
      this.ctx.textAlign = "left";
      this.ctx.fillStyle = "#6dff6d";

      this.ctx.fillText(correctPart, textX, textY);
      textX += correctWidth;
    }

    // Incorrect input
    if (wrongPart.length > 0) {
      this.ctx.textAlign = "left";
      this.ctx.fillStyle = "#ff3b3b";

      this.ctx.fillText(wrongPart, textX, textY);
    }

    // Empty input
    if (typed.length === 0) {
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "#777777";

      this.ctx.fillText("Type to cast...", x + boxWidth / 2, textY);
    }
  }

  drawManaBar(mana, maxMana) {
    const x = 12;
    const y = 12;
    const width = 160;
    const height = 14;

    const ratio = Math.max(0, Math.min(1, mana / maxMana));

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

    this.ctx.fillText(
      `Mana ${Math.floor(mana)}/${maxMana}`,
      x + width + 8,
      y + height / 2,
    );
  }

  drawComboIndicator(combo) {
    if (combo <= 0) return;

    this.ctx.font = "bold 12px monospace";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";

    this.ctx.fillStyle = combo >= 10 ? "#ffcf4f" : "#ffffff";

    this.ctx.fillText(`Combo x${combo}`, 12, 40);
  }

  drawSpellIndicator(activeSpell) {
    const label = SPELL_LABELS[activeSpell] ?? activeSpell;
    const color = SPELL_COLORS[activeSpell] ?? "#ffffff";

    const width = 130;
    const height = 22;

    const x = this.canvas.width - width - 12;
    const y = 12;

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

    const ratio = Math.max(
      0,
      Math.min(1, platform.health / platform.maxHealth),
    );

    this.ctx.fillStyle = "#0a0a0a";
    this.ctx.fillRect(x - 2, barY - 2, width + 4, barHeight + 4);

    this.ctx.fillStyle = "#3a1a1a";
    this.ctx.fillRect(x, barY, width, barHeight);

    const fillWidth = (width - 2) * ratio;
    this.ctx.fillStyle = "#c0392b";

    this.ctx.fillRect(
      x + 1,
      barY + barHeight / 2,
      fillWidth,
      barHeight / 2 - 1,
    );

    this.ctx.fillStyle = "#e74c3c";
    this.ctx.fillRect(x + 1, barY + 1, fillWidth, barHeight / 2 - 1);

    this.ctx.strokeStyle = "#d4af37";
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(x + 0.5, barY + 0.5, width - 1, barHeight - 1);
  }

  drawBaseHudBar(platform) {
    if (!platform) return;

    const width = 200;
    const height = 16;

    const x = (this.canvas.width - width) / 2;
    const y = 10;

    const ratio = Math.max(
      0,
      Math.min(1, platform.health / platform.maxHealth),
    );

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
    this.drawOverlay(
      "Victory! All waves cleared - Press ENTER to return to menu",
    );
  }

  drawWaveCompleteScreen(waveNumber, waveCount) {
    this.drawOverlay(
      `Wave ${waveNumber} cleared! Press ENTER for wave ${waveNumber + 1}/${waveCount}`,
    );
  }

  drawOverlay(promptText) {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.font = "bold 14px monospace";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(
      promptText,
      this.canvas.width / 2,
      this.canvas.height / 2,
    );
  }
}

function isFlickering(enemy) {
  if (!enemy.isAlive()) return false;
  if (enemy.flashTimer <= 0) return false;
  return Math.floor(enemy.flashTimer / 60) % 2 === 0;
}

function overlapsAny(x, y, width, height, rects) {
  return rects.some(
    (rect) =>
      x < rect.x + rect.width &&
      x + width > rect.x &&
      y < rect.y + rect.height &&
      y + height > rect.y,
  );
}
