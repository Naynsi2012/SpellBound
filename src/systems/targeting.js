let lockedEnemy = null;

export function getLockedEnemy(){
    return lockedEnemy;
}

export function setLockedEnemy(enemy){
    lockedEnemy = enemy;
}

export function clearLockedEnemy(){
    lockedEnemy = null;
}

export function pruneLockedEnemy(enemies){
    if (lockedEnemy && !enemies.includes(lockedEnemy)) lockedEnemy = null;
}

export function pickLockedTarget(key, enemies){
    const candidates = enemies.filter((enemy) => enemy.isAlive() && enemy.getCurrentWord().toLowerCase().startsWith(key))
    if (candidates.length === 0) return null;

    return candidates.reduce((closest, enemy) => pathProgressOf(enemy) > pathProgressOf(closest) ? enemy : closest)
}

function pathProgressOf(enemy){
    return enemy.pathIndex + enemy.pathProgress;
}