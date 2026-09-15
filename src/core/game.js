import { Renderer } from "../rendering/renderer.js";
import { createMap } from "../map/map.js"
import { loadTiles } from "../assets/loader.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants.js";

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
        this.renderer = new Renderer(this.canvas, this.ctx, tiles);
        this.map = createMap();

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

    update(delaTime) {
        // Game related logic will go here...
    }

    render() {
        this.renderer.render(this.map);
    }
}