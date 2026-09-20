import { Renderer } from "../rendering/renderer.js"
import { createMap } from "../map/map.js"
import { loadTiles, loadEnemySprites } from "../assets/loader.js"
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants.js"
import { Enemy } from "../entities/enemy.js"
import { updateEnemyPositions } from "../systems/movement.js"
import { initInput } from "../systems/input.js"
import { handleKeyDown, getTypedBuffer, getMatchedSequence, clearTypedBuffer, interruptCast } from "../systems/typing.js"
import { updateEnemyEffects } from "../systems/combat.js"
import { getLockedEnemy, pruneLockedEnemy } from "../systems/targeting.js"
import { updatePlatformAttack } from "../systems/platform.js"
import { Platform } from "../entities/platform.js"
import { updateMana, getMana, getMaxMana, resetMana } from "../systems/mana.js"
import { getCombo, resetCombo } from "../systems/penalty.js" 
import { cycleSpell, getActiveSpell, resetActiveSpell } from "../systems/spells.js"
import { updateStatusEffects } from "../systems/statusEffects.js"
import { getMenuOptions, getSelectedIndex, moveSelection, getSelectedOption, resetSelection } from "../systems/menu.js"

import spawnMapData from "../data/maps/spawn.json"
import trainingMapData from "../data/maps/training.json"

const MAPS = {
    spawn: spawnMapData, 
    training: trainingMapData
}

export class Game {
    constructor() {
        this.canvas = document.getElementById("game")
        this.ctx = this.canvas.getContext("2d");
        this.lastTime = 0;
    }

    async start(){
        this.canvas.width = CANVAS_WIDTH
        this.canvas.height = CANVAS_HEIGHT

        // Load assets
        const tiles = await loadTiles();
        const enemySprites = await loadEnemySprites();

        // Create renderer
        this.renderer = new Renderer(this.canvas, this.ctx, tiles, enemySprites)

        this.state = "menu";

        initInput((e) => this.handleKeyDown(e));

        this.fitToWindow();
        window.addEventListener("resize", () => this.fitToWindow())
        requestAnimationFrame(time => this.loop(time))
    }

    loadSelectedMap(mapId){
        this.map = createMap(MAPS[mapId]);
        this.trainingMode = MAPS[mapId].mode === "training";
        this.setupRun();
    }

    setupRun(){
        this.platform = this.createPlatform();
        this.enemies = [
            this.createEnemy(["fire", "water", "dragon", "ghost"], "ghost", 0),
            this.createEnemy(["cream", "fire", "mayank", "pikachu", "master"], "cyclops", 3)
        ]
        resetMana();
        resetCombo();
        resetActiveSpell();
        clearTypedBuffer();
    }

    handleKeyDown(e){
        if (this.state === "menu"){
            if (e.key === "ArrowUp") moveSelection(-1);
            if (e.key === "ArrowDown") moveSelection(1);
            if (e.key === "Enter"){
                const option = getSelectedOption();
                this.loadSelectedMap(option.mapId);
                this.state = "ready";
            }
            return;
        }

        if (this.state === "ready" && e.key === "Enter"){
            this.state = "playing";
            return
        }
        if (this.state === "gameover" && e.key === "Enter"){
            this.state = "menu";
            resetSelection();
            return;
        }
        if (this.state === "playing"){
            if (e.key === "Tab"){
                e.preventDefault();
                cycleSpell(1);
                return;
            }
            // if (e.key === "q" || e.key === "Q"){
            //     cycleSpell(-1);
            //     return;
            // }
            // if (e.key === "e" || e.key === "E"){
            //     cycleSpell(1);
            //     return;
            // }

            handleKeyDown(e, this.enemies, this.trainingMode);
        }
    }

    createPlatform(){
        const data = this.map.platform;

        return new Platform({
            col: data.col,
            row: data.row,
            type: data.type,
            maxHealth: data.maxHealth
        })
    }

    createEnemy(words, spriteId, pathIndex = 0){
        const start = this.map.path.points[pathIndex];

        return new Enemy({
            x: start.x,
            y: start.y,
            words,
            maxHealth: 100,
            speed: 40,
            spriteId,
            pathIndex
        })
    }

    fitToWindow(){
        const scale = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT)
        this.canvas.style.width = `${CANVAS_WIDTH * scale}px`
        this.canvas.style.height = `${CANVAS_HEIGHT * scale}px`
    }

    loop(time){
        const deltaTime = this.lastTime === 0 ? 0 : time - this.lastTime;
        this.lastTime = time;

        this.update(deltaTime)
        this.render();

        requestAnimationFrame(nextTime => this.loop(nextTime))
    }

    update(deltaTime){
        if (this.state !== "playing") return;

        updateEnemyPositions(this.enemies, this.map.path, deltaTime)
        updateStatusEffects(this.enemies, deltaTime)
        updatePlatformAttack(this.enemies, this.platform, deltaTime)
        updateEnemyEffects(this.enemies, deltaTime)

        if (!this.trainingMode) updateMana(deltaTime)

        const locked = getLockedEnemy();
        if (locked && locked.reachedEnd) interruptCast();

        // Remove enemies that were killed by typing
        this.enemies = this.enemies.filter((enemy) => {
            if(!enemy.isAlive() && enemy.flashTimer <= 0) return false
            return true
        })
        pruneLockedEnemy(this.enemies)

        if (!this.trainingMode && !this.platform.isAlive()){
            this.state = "gameover"
        }
    }

    render(){
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
            trainingMode: this.trainingMode
        })
    }
}
