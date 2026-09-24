let lockedEnemy = null;

export function getLockedEnemy() {
    return lockedEnemy;
}

export function setLockedEnemy(enemy) {
    lockedEnemy = enemy;
}

export function clearLockedEnemy() {
    lockedEnemy = null;
}

export function pruneLockedEnemy(enemies) {
    if (
        lockedEnemy &&
        (
            !enemies.includes(lockedEnemy) ||
            !lockedEnemy.isAlive() ||
            !lockedEnemy.getCurrentWord()
        )
    ) {
        lockedEnemy = null;
    }
}

export function pickLockedTarget(key, enemies, path) {
    const candidates = enemies.filter((enemy) => {
        if (!enemy.isAlive()) return false;

        const word = enemy.getCurrentWord();

        if (!word) return false;

        return word
            .toLowerCase()
            .startsWith(key.toLowerCase());
    });

    if (candidates.length === 0) {
        return null;
    }

    return candidates.reduce((closest, enemy) =>
        getPathDistance(enemy, path) >
        getPathDistance(closest, path)
            ? enemy
            : closest
    );
}

function getPathDistance(enemy, path) {
    let distance = 0;

    for (let i = 0; i < enemy.pathIndex; i++) {
        const a = path.points[i];
        const b = path.points[i + 1];

        distance += Math.hypot(
            b.x - a.x,
            b.y - a.y
        );
    }

    return distance + enemy.pathProgress;
}