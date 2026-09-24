export function getAnimState(enemy){
    if (!enemy.isAlive()) return "death";
    if (enemy.flashTimer > 0) return "hit";
    if (enemy.isAttacking) return "attack";
    return "walk";
}