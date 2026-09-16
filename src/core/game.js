import { Renderer } from "../rendering/renderer.js";
import { createMap } from "../map/map.js"
import { loadTiles, loadEnemySprites } from "../assets/loader.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants.js";
import { Enemy } from "../entities/enemy.js";
import { updateEnemyPositions, removeEnemiesPastPathEnd } from "../systems/movement.js";

export class Game {
    constructor() {
        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");
        this.lastTime = 0;
    }

    async start() {
        this.canvas.width = CANVAS_WIDTH
        this.canvas.height = CANVAS_HEIGHT

        const tiles = await loadTiles();
        const enemySprites = await loadEnemySprites();

        this.renderer = new Renderer(this.canvas, this.ctx, tiles, enemySprites);
        this.map = createMap();

        this.enemies = [
            new Enemy({
                x: this.map.path.start.x,
                y: this.map.path.start.y,
                word: "fire",
                maxHealth: 100,
                speed: 40,
                spriteId: "ghost"
            }),
            new Enemy({
                x: this.map.path.start.x - 50,
                y: this.map.path.start.y,
                word: "dragon",
                maxHealth: 100,
                speed: 40,
                spriteId: "cyclops"
            })
        ]

        this.fitToWindow();
        window.addEventListener("resize", () => this.fitToWindow());

        requestAnimationFrame((time) => this.loop(time));
    }

    fitToWindow() {
        const scale = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT);
        this.canvas.style.width = `${CANVAS_WIDTH * scale}px`
        this.canvas.style.height = `${CANVAS_HEIGHT * scale}px`
    }

    loop(time) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((nextTime) => this.loop(nextTime));
    }

    update(deltaTime) {
        updateEnemyPositions(this.enemies, this.map.path, deltaTime);
        this.enemies = removeEnemiesPastPathEnd(this.enemies, this.map.path);
    }

    render() {
        this.renderer.render(this.map, this.enemies);
    }
}