import wavesData from "../data/waves.json"
import { Enemy } from "../entities/enemy.js"

const BASE_HEALTH = 100;
const BASE_SPEED = 40;
const BOSS_SPEED_MULTIPLIER = 0.6;

let currentWaveIndex = 0;
let spawnQueue = [];
let elapsedSinceWaveStart = 0;

export function getWaveCount(){
    return wavesData.waves.length;
}

export function getCurrentWaveNumber(){
    return currentWaveIndex + 1;
}

export function resetWaves(){
    currentWaveIndex = 0;
    spawnQueue = [];
    elapsedSinceWaveStart = 0;
}

export function startWave(pathStartPoint){
    const wave = wavesData.waves[currentWaveIndex];
    elapsedSinceWaveStart = 0;

    spawnQueue = wave.enemies.map((def) => ({
        ...def,
        spawned: false
    }))
}

export function updateWaveSpawning(deltaTime, pathStartPoint){
    elapsedSinceWaveStart += deltaTime;

    const toSpawn = [];

    for (const enemy of spawnQueue){
        if (enemy.spawned) continue;
        if (elapsedSinceWaveStart < enemy.spawnDelay) continue;

        enemy.spawned = true;

        const health = BASE_HEALTH * (enemy.healthMultiplier ?? 1);
        const speed = enemy.isBoss ? BASE_SPEED * BOSS_SPEED_MULTIPLIER : BASE_SPEED;

        toSpawn.push(new Enemy({
            x: pathStartPoint.x,
            y: pathStartPoint.y,
            words: enemy.words,
            maxHealth: health,
            speed,
            spriteId: enemy.spriteId,
            pathIndex: 0
        }))
    }

    return toSpawn;
}

export function isWaveSpawningComplete(){
    return spawnQueue.every((entry) => entry.spawned);
}

export function hasNextWave(){
    return currentWaveIndex < wavesData.waves.length - 1;
}

export function advanceToNextWave(){
    currentWaveIndex++;
}