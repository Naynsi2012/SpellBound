import { Renderer } from "../rendering/renderer.js"
import { createMap } from "../map/map.js"
import { loadTiles, loadEnemySprites } from "../assets/loader.js"
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from "./constants.js"
import { Enemy } from "../entities/enemy.js"
import { updateEnemyPositions } from "../systems/movement.js"
import { initInput } from "../systems/input.js"
import { handleKeyDown, getTypedBuffer, getMatchedSequence } from "../systems/typing.js"
import { updateEnemyEffects } from "../systems/combat.js"
import { getLockedEnemy, pruneLockedEnemy } from "../systems/targeting.js"
import { updatePlatformAttack } from "../systems/platform.js"
import { Platform } from "../entities/platform.js"

import mapData from "../data/maps/spawn.json"

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

        // Build the map from JSON
        this.map = createMap(mapData)
        this.state = "ready"; 
        this.setupRun();

        initInput((e) => this.handleKeyDown(e));

        this.fitToWindow();

        window.addEventListener("resize", () => this.fitToWindow())
        requestAnimationFrame(time => this.loop(time))
    }

    setupRun(){
        this.platform = this.createPlatform();
        this.enemies = [
            this.createEnemy(["fire", "water"], "ghost", 0),
            this.createEnemy(["cream", "fire"], "cyclops", 8)
        ]
    }

    handleKeyDown(e){
        if (this.state === "ready" && e.key === "Enter"){
            this.state = "playing";
            return
        }
        if (this.state === "gameover" && e.key === "Enter"){
            this.setupRun();
            this.state = "ready";
            return;
        }
        if (this.state === "playing"){
            handleKeyDown(e, this.enemies);
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
        updatePlatformAttack(this.enemies, this.platform, deltaTime)
        updateEnemyEffects(this.enemies, deltaTime)

        // Remove enemies that were killed by typing
        this.enemies = this.enemies.filter((enemy) => {
            if(!enemy.isAlive() && enemy.flashTimer <= 0) return false
            return true
        })
        pruneLockedEnemy(this.enemies)

        if (!this.platform.isAlive()){
            this.state = "gameover"
        }
    }

    render(){
        this.renderer.render(
            this.map,
            this.enemies,
            getTypedBuffer(),
            getMatchedSequence(),
            getLockedEnemy(),
            this.platform,
            this.state
        )
    }
}
