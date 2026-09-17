export function updateEnemyPositions(enemies, path, deltaTime){
    const deltaSeconds = deltaTime / 1000;

    for (const enemy of enemies){
        let distance = enemy.speed * deltaSeconds;

        while (distance > 0 && enemy.pathIndex < path.points.length - 1) {
            const current = path.points[enemy.pathIndex];
            const next = path.points[enemy.pathIndex + 1];

            const dx = next.x - current.x;
            const dy = next.y - current.y;

            const segmentLength = Math.hypot(dx, dy);
            const remaining = segmentLength - enemy.pathProgress;

            if (distance < remaining){
                enemy.pathProgress += distance;

                const t = enemy.pathProgress / segmentLength;

                enemy.x = current.x + dx * t;
                enemy.y = current.y + dy * t;

                distance = 0;
            } else{
                distance -= remaining;

                enemy.pathIndex++;
                enemy.pathProgress = 0;

                if (enemy.pathIndex < path.points.length){
                    enemy.x = path.points[enemy.pathIndex].x;
                    enemy.y = path.points[enemy.pathIndex].y;
                }
            }
        }
    }
}

export function removeEnemiesPastPathEnd(enemies, path) {
    return enemies.filter(enemy => enemy.pathIndex < path.points.length - 1);
}