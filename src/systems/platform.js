export function updatePlatformAttack(enemies, platform, deltaTime){
    for (const enemy of enemies){
        if (!enemy.reachedEnd) continue;
        if (!enemy.isAlive()) continue;

        enemy.attackTimer -= deltaTime;

        if (enemy.attackTimer <= 0){
            platform.takeDamage(enemy.attackDamage);
            enemy.attackTimer = enemy.attackCooldown;
        }
    }
}