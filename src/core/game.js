import { Renderer } from "../rendering/renderer.js";
import { TILE_SIZE } from "./constants.js";
import { Enemy } from "../entities/enemy.js";
import { updateEnemyPositions } from "../systems/movement.js";
import { initInput } from "../systems/input.js";
import {
  handleKeyDown,
  getTypedBuffer,
  getMatchedSequence,
  clearTypedBuffer,
  interruptCast,
} from "../systems/typing.js";
import { updateEnemyEffects } from "../systems/combat.js";
import { getLockedEnemy, pruneLockedEnemy } from "../systems/targeting.js";
import { updatePlatformAttack } from "../systems/platform.js";
import { Platform } from "../entities/platform.js";
import { updateMana, getMana, getMaxMana, resetMana } from "../systems/mana.js";
import { getCombo, resetCombo } from "../systems/penalty.js";
import {
  cycleSpell,
  getActiveSpell,
  resetActiveSpell,
} from "../systems/spells.js";
import { updateStatusEffects } from "../systems/statusEffects.js";
import {
  getMenuOptions,
  getSelectedIndex,
  moveSelection,
  getSelectedOption,
  resetSelection,
} from "../systems/menu.js";
import {
  resetWaves,
  startWave,
  updateWaveSpawning,
  isWaveSpawningComplete,
  hasNextWave,
  advanceToNextWave,
  getCurrentWaveNumber,
  getWaveCount,
} from "../systems/waves.js";
import { createScarecrow } from "../systems/scarecrows.js";
import { ENEMY_DEATH_LINGER_MS } from "./constants.js";
import { AudioManager } from "./audioManager.js";

import dummyData from "../data/dummies.json";

import { loadTmxMap } from "../map/tmxLoader.js";
import { loadTilesetImages, loadEnemySprites } from "../utils/loader.js";

const MAPS = {
  spawn: "/maps/spawn.tmx",
  training: "/maps/training.tmx",
};

export class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");
    this.audio = new AudioManager();
    this.lastTime = 0;
    this.canvas.width = 800;
    this.canvas.height = 480;
  }

  async start() {
    this.audio.loadAll();
    const enemySprites = await loadEnemySprites();

    this.renderer = new Renderer(this.canvas, this.ctx, enemySprites, {});
    this.state = "menu";

    initInput((e) => this.handleKeyDown(e));

    window.addEventListener("resize", () => this.fitToWindow());
    requestAnimationFrame((time) => this.loop(time));
  }

  async loadSelectedMap(mapId) {
    const tilesetImages = await loadTilesetImages();
    this.map = await loadTmxMap(MAPS[mapId]);
    this.map.tilesetImages = tilesetImages;
    this.renderer.tilesetImages = tilesetImages;

    this.canvas.width = this.map.cols * this.map.tileSize;
    this.canvas.height = this.map.rows * this.map.tileSize;
    this.ctx.imageSmoothingEnabled = false;
    this.fitToWindow();

    this.trainingMode = mapId === "training";
    this.setupRun();
  }

  setupRun() {
    this.platform = this.trainingMode ? null : this.createPlatform();
    this.enemies = [];

    resetMana();
    resetCombo();
    resetActiveSpell();
    clearTypedBuffer();

    if (!this.trainingMode) {
      resetWaves();
      startWave(this.map.path.points[0]);
    } else {
      this.setupTrainingTargets();
    }
  }

  setupTrainingTargets() {
    this.trainingPositions = dummyData.dummies.map((dummy) => dummy.position);

    this.enemies = this.trainingPositions.map((position) =>
      createScarecrow(position),
    );
  }

  refillTrainingTargets() {
    const occupied = new Set(
      this.enemies.map((enemy) => `${enemy.x},${enemy.y}`),
    );

    for (const position of this.trainingPositions) {
      if (this.enemies.length >= this.trainingPositions.length) break;

      const x = position.col * TILE_SIZE + TILE_SIZE / 2;
      const y = position.row * TILE_SIZE + TILE_SIZE / 2;

      if (occupied.has(`${x},${y}`)) continue;

      const scarecrow = createScarecrow(position);

      this.enemies.push(scarecrow);
      occupied.add(`${scarecrow.x},${scarecrow.y}`);
    }
  }

  handleKeyDown(e) {
    if (this.state === "menu") {
      if (e.key === "ArrowUp") {
        moveSelection(-1);
        this.audio.play("select");
      }

      if (e.key === "ArrowDown") {
        moveSelection(1);
        this.audio.play("select");
      }

      if (e.key === "Enter") {
        const option = getSelectedOption();
        this.loadSelectedMap(option.mapId).then(() => {
          this.state = "ready";
        });
      }
      return;
    }

    if (this.state === "ready" && e.key === "Enter") {
      this.state = "playing";
      return;
    }
    if (this.state === "gameover" && e.key === "Enter") {
      this.state = "menu";
      resetSelection();
      return;
    }
    if (this.state === "playing" && e.key === "Escape") {
      this.state = "paused";
      return;
    }
    if (this.state === "paused" && e.key === "Escape") {
      this.state = "playing";
      return;
    }
    if (this.state === "victory" && e.key === "Enter") {
      this.state = "menu";
      resetSelection();
      return;
    }
    if (this.state === "waveComplete" && e.key === "Enter") {
      advanceToNextWave();
      startWave(this.map.path.points[0]);
      this.state = "playing";
      return;
    }
    if (this.state === "playing") {
      if (e.key === "Tab") {
        e.preventDefault();
        cycleSpell(1);
        this.audio.play("spellSwitch");
        return;
      }

      handleKeyDown(e, this.enemies, this.map.path, this.trainingMode, this.audio);
    }
  }

  createPlatform() {
    const data = this.map.platform;
    return new Platform({
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      type: data.type,
      maxHealth: parseInt(data.maxHealth),
    });
  }

  createEnemy(words, spriteId, pathIndex = 0) {
    const start = this.map.path.points[pathIndex];

    return new Enemy({
      x: start.x,
      y: start.y,
      words,
      maxHealth: 100,
      speed: 40,
      spriteId,
      pathIndex,
    });
  }

  fitToWindow() {
    const scale = Math.min(
      window.innerWidth / this.canvas.width,
      window.innerHeight / this.canvas.height,
    );
    this.canvas.style.width = `${this.canvas.width * scale}px`;
    this.canvas.style.height = `${this.canvas.height * scale}px`;
  }

  loop(time) {
    const deltaTime = this.lastTime === 0 ? 0 : time - this.lastTime;
    this.lastTime = time;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((nextTime) => this.loop(nextTime));
  }

  update(deltaTime) {
    if (this.state !== "playing") return;

    if (!this.trainingMode) {
      updateEnemyPositions(this.enemies, this.map.path, deltaTime);
    }
    updateStatusEffects(this.enemies, deltaTime);
    if (!this.trainingMode) {
      updatePlatformAttack(this.enemies, this.platform, deltaTime);
    }
    updateEnemyEffects(this.enemies, deltaTime);

    if (!this.trainingMode) {
      updateMana(deltaTime);

      const spawned = updateWaveSpawning(deltaTime, this.map.path.points[0]);
      this.enemies.push(...spawned);
    }

    const locked = getLockedEnemy();
    if (locked && locked.reachedEnd) interruptCast();

    this.enemies = this.enemies.filter((enemy) => {
      if (!enemy.isAlive() && enemy.deathTimer >= ENEMY_DEATH_LINGER_MS)
        return false;
      return true;
    });
    pruneLockedEnemy(this.enemies);

    if (this.trainingMode) {
      this.refillTrainingTargets();
    } else if (isWaveSpawningComplete() && this.enemies.length === 0) {
      if (hasNextWave()) {
        this.state = "waveComplete";
        this.audio.play("waveWon");
      } else {
        this.state = "victory";
        this.audio.play("won");
      }
    }

    if (!this.trainingMode && !this.platform.isAlive()) {
      this.state = "gameover";
      this.audio.play("lost");
    }
  }

  render() {
    this.renderer.render({
      map: this.map,
      enemies: this.enemies,
      typedBuffer: getTypedBuffer(),
      matchedSequence: getMatchedSequence(),
      lockedEnemy: getLockedEnemy(),
      platform: this.platform,
      state: this.state,
      mana: getMana(),
      maxMana: getMaxMana(),
      combo: getCombo(),
      activeSpell: getActiveSpell(),
      menuOptions: getMenuOptions(),
      selectedIndex: getSelectedIndex(),
      trainingMode: this.trainingMode,
      waveNumber: getCurrentWaveNumber(),
      waveCount: getWaveCount(),
    });
  }
}
