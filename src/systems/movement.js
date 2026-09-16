export function updateEnemyPositions(enemies, path, deltaTime) {
    const deltaSeconds = deltaTime / 1000;
    const direction = path.end.x > path.start.x ? 1 : -1;

    enemies.forEach((enemy) => {
        enemy.x += enemy.speed * direction * deltaSeconds;
    })
}

export function removeEnemiesPastPathEnd(enemies, path) {
    return enemies.filter((enemy) => enemy.x < path.end.x);

    // Later the enemy will filtered out the ones that reached the base, which will start base damage
}