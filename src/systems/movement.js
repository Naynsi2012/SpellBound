import { getEffectiveSpeed } from "./statusEffects.js";

const MIN_ENEMY_SEPARATION = 36;

export function updateEnemyPositions(enemies, path, deltaTime) {
  const deltaSeconds = deltaTime / 1000;

  const ordered = [...enemies].sort(
    (a, b) => getTotalDistance(b, path) - getTotalDistance(a, path),
  );

  for (const enemy of ordered) {
    if (!enemy.isAlive()) continue;

    const startX = enemy.x;
    let distance = getEffectiveSpeed(enemy) * deltaSeconds;

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

    const dxMoved = enemy.x - startX;
    if (dxMoved > 0.01) enemy.facingRight = true;
    else if (dxMoved < -0.01) enemy.facingRight = false;

    if (enemy.pathIndex >= path.points.length - 1) {
      enemy.reachedEnd = true;
      enemy.isAttacking = true;
    }
  }

  applyVisualSeparation(ordered, path);
}

function applyVisualSeparation(ordered, path) {
  let previousVisualDistance = null;

  for (const enemy of ordered) {
    if (!enemy.isAlive() || enemy.pathIndex === -1 || enemy.reachedEnd) {
      enemy.visualX = enemy.x;
      enemy.visualY = enemy.y;
      previousVisualDistance = null;
      continue;
    }

    const trueDistance = getTotalDistance(enemy, path);
    let visualDistance = trueDistance;

    if (previousVisualDistance !== null) {
      visualDistance = Math.min(
        trueDistance,
        previousVisualDistance - MIN_ENEMY_SEPARATION,
      );
    }

    const pos = getPositionAtDistance(path, visualDistance);
    enemy.visualX = pos.x;
    enemy.visualY = pos.y;

    previousVisualDistance = visualDistance;
  }
}

function getPositionAtDistance(path, distance) {
  if (distance <= 0) {
    const first = path.points[0];
    return { x: first.x, y: first.y };
  }

  let remaining = distance;

  for (let i = 0; i < path.points.length - 1; i++) {
    const a = path.points[i];
    const b = path.points[i + 1];
    const segmentLength = Math.hypot(b.x - a.x, b.y - a.y);

    if (remaining <= segmentLength) {
      const t = segmentLength === 0 ? 0 : remaining / segmentLength;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }

    remaining -= segmentLength;
  }

  const last = path.points[path.points.length - 1];
  return { x: last.x, y: last.y };
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
