import { Renderer } from "../rendering/renderer.js"
import { createMap } from "../map/map.js"
import { loadTiles, loadEnemySprites } from "../assets/loader.js"
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants.js"
import { Enemy } from "../entities/enemy.js"
import { updateEnemyPositions, removeEnemiesPastPathEnd } from "../systems/movement.js"

import mapData from "../data/maps/training.json"

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

        // Create enemies
        this.enemies = [
            this.createEnemy("fire", "ghost"),
            this.createEnemy("dragon", "cyclops")
        ]

        this.fitToWindow();

        window.addEventListener("resize", () => this.fitToWindow())
        requestAnimationFrame(time => this.loop(time))
    }

    createEnemy(word, spriteId){
        const start = this.map.path.start;

        return new Enemy({
            x: start.x,
            y: start.y,
            word,
            maxHealth: 100,
            speed: 40,
            spriteId
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
        updateEnemyPositions(this.enemies, this.map.path, deltaTime)
        this.enemies = removeEnemiesPastPathEnd(this.enemies, this.map.path)
    }

    render(){
        this.renderer.render(this.map, this.enemies)
    }
}
