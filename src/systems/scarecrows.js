import { Enemy } from "../entities/enemy.js";

const WORD_POOl = ["fire", "water", "wind", "storm", "cream", "dragon", "shield", "spark"];
const SCARECROW_COUNT = 3;
const SCARECROW_HEATLH = 60;

function randomWords(count){
    const shuffled = [...WORD_POOl].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export function createScarecrow(position){
    return new Enemy({
        x: position.x,
        y: position.y,
        words: randomWords(1 + Math.floor(Math.random() * 2)),
        maxHealth: SCARECROW_HEATLH,
        speed: 0,
        spriteId: "ghost",
        pathIndex: 0
    })
} 

export function getScarecrowPositions(path){
    const points = path.points;
    const step = Math.max(1, Math.floor(points.length / (SCARECROW_COUNT + 1)));

    return Array.from({ length: SCARECROW_COUNT }, (_, i) => points[Math.min(points.length - 1, (i + 1) * step)]);
}