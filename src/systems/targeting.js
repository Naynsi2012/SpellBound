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

// Finds the best enemy to lock onto for a given typed buffer: any enemy
// whose current word still starts with everything typed so far (not just
// the first character). When several enemies match, the one furthest along
// the path is preferred, since it's the more urgent threat.
export function pickTargetForBuffer(buffer, enemies, path) {
    const lowerBuffer = buffer.toLowerCase();

    const candidates = enemies.filter((enemy) => {
        if (!enemy.isAlive()) return false;

        const word = enemy.getCurrentWord();

        if (!word) return false;

        return word.toLowerCase().startsWith(lowerBuffer);
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

// Kept as a thin wrapper for starting a fresh cast off a single keystroke.
export function pickLockedTarget(key, enemies, path) {
    return pickTargetForBuffer(key, enemies, path);
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