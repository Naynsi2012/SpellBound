import { ENEMY_FLASH_DURATION } from "../core/constants.js"

export function resolveWordComplete(enemy){
    const isFinalWord = enemy.currentWordIndex >= enemy.words.length - 1;

    enemy.health = isFinalWord ? 0 : Math.max(0, enemy.health - enemy.damagePerWord);
    enemy.flashTimer = ENEMY_FLASH_DURATION;

    if (!isFinalWord) enemy.currentWordIndex++;
}

export function updateEnemyEffects(enemies, deltaTime){
    for (const enemy of enemies){
        if (enemy.flashTimer > 0){
            enemy.flashTimer = Math.max(0, enemy.flashTimer - deltaTime);
        }
    }
}