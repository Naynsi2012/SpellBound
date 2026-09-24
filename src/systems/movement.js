import { getEffectiveSpeed } from "./statusEffects.js";

export function updateEnemyPositions(enemies, path, deltaTime){
    const deltaSeconds = deltaTime / 1000;

    for (const enemy of enemies){
        if (!enemy.isAlive()) continue

        let distance = getEffectiveSpeed(enemy) * deltaSeconds;

        // pathIndex -1 means the enemy is still walking in from
        // off-screen toward the path's actual start point
        if (enemy.pathIndex === -1){
            const target = path.points[0];
            const dx = target.x - enemy.x;
            const dy = target.y - enemy.y;
            const remaining = Math.hypot(dx, dy);

            if (distance >= remaining){
                enemy.x = target.x;
                enemy.y = target.y;
                enemy.pathIndex = 0;
                distance -= remaining;
            } else{
                const t = remaining === 0 ? 0 : distance / remaining;
                enemy.x += dx * t;
                enemy.y += dy * t;
                continue;
            }
        }

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

        if (enemy.pathIndex >= path.points.length - 1){
            enemy.reachedEnd = true
            enemy.isAttacking = true
        }
    }
}