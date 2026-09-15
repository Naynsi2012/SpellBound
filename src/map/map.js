import { createPath } from "./path.js"

export function createMap() {
    const canvas = document.getElementById("game")

    return {
        path: createPath(canvas.clientWidth, canvas.height),
        keep: { x: canvas.width - 150, y: canvas.height / 2 }
    }
}