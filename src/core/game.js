import { Renderer } from "../rendering/renderer.js";
import { createMap } from "../map/map.js"

export class Game {
    constructor() {
        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");

        this.renderer = new Renderer(this.canvas, this.ctx);
        this.map = createMap();

        this.lastTime = 0;
    }

    start() {
        this.resize();

        window.addEventListener("resize", () => {
            this.resize();
        });

        requestAnimationFrame((time) => this.loop(time));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.map = createMap();
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