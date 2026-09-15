export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.ctx.imageSmoothingEnabled = false; // Stops browser blurring scaled pixel graphics
    }

    render(map) {
        this.clear();
        this.drawBackground();
        this.drawPath(map);
        this.drawKeep(map);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        this.ctx.fillStyle = "#111";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawPath(map) {
        const { start, end } = map.path;

        this.ctx.fillStyle = "#555";

        this.ctx.fillRect(start.x, start.y - 30, end.x - start.x, 60);
    }

    drawKeep(map) {
        const { x, y } = map.keep;

        this.ctx.fillStyle = "#777";

        this.ctx.fillRect(x, y - 80, 100, 160);
    }
}