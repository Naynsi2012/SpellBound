import { getEffectiveSpeed } from "./statusEffects.js";

const MIN_ENEMY_SEPARATION = 36;

export function updateEnemyPositions(enemies, path, deltaTime) {
  const deltaSeconds = deltaTime / 1000;

  const ordered = [...enemies].sort(
    (a, b) => getTotalDistance(b, path) - getTotalDistance(a, path),
  );

  for (let i = 0; i < ordered.length; i++) {
    const enemy = ordered[i];
    if (!enemy.isAlive()) continue;

    let distance = getEffectiveSpeed(enemy) * deltaSeconds;

    // Cap movement so this enemy never gets closer than 
    // MIN_ENEMY_SEPARATION to whichever enemy is directly ahead of
    const ahead = ordered[i - 1];
    if (ahead && ahead.isAlive() && !ahead.reachedEnd) {
      const gap = getTotalDistance(ahead, path) - getTotalDistance(enemy, path);
      const allowedAdvance = Math.max(0, gap - MIN_ENEMY_SEPARATION);
      distance = Math.min(distance, allowedAdvance);
    }

    if (enemy.pathIndex === -1) {
      const target = path.points[0];
      const dx = target.x - enemy.x;
      const dy = target.y - enemy.y;
      const remaining = Math.hypot(dx, dy);

      if (distance >= remaining) {
        enemy.x = target.x;
        enemy.y = target.y;
        enemy.pathIndex = 0;
        distance -= remaining;
      } else {
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

      if (distance < remaining) {
        enemy.pathProgress += distance;

        const t = enemy.pathProgress / segmentLength;

        enemy.x = current.x + dx * t;
        enemy.y = current.y + dy * t;

        distance = 0;
      } else {
        distance -= remaining;

        enemy.pathIndex++;
        enemy.pathProgress = 0;

        if (enemy.pathIndex < path.points.length) {
          enemy.x = path.points[enemy.pathIndex].x;
          enemy.y = path.points[enemy.pathIndex].y;
        }
      }
    }

    if (enemy.pathIndex >= path.points.length - 1) {
      enemy.reachedEnd = true;
      enemy.isAttacking = true;
    }
  }
}

function getTotalDistance(enemy, path) {
  if (enemy.pathIndex === -1) {
    const dx = path.points[0].x - enemy.x;
    const dy = path.points[0].y - enemy.y;
    return -Math.hypot(dx, dy);
  }

  let distance = 0;
  for (let i = 0; i < enemy.pathIndex; i++) {
    const a = path.points[i];
    const b = path.points[i + 1];
    distance += Math.hypot(b.x - a.x, b.y - a.y);
  }

  return distance + enemy.pathProgress;
}
