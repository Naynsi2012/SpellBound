export function getAnimState(enemy){
    if (!enemy.isAlive()) return "death";
    if (enemy.flashTimer > 0) return "hurt";
    if (enemy.isAttacking) return "attack";
    if (enemy.speed === 0) return "idle";
    return "walk";
}