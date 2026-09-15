export function createPath(canvasWidth, canvasHeight) {
    const y = canvasHeight / 2;

    return {
        start: { x: 80, y},
        end: { x: canvasWidth - 180, y }
    }
}