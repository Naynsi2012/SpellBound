import { ENEMY_FLASH_DURATION } from "../core/constants.js"
import { applySpellEffect } from "./statusEffects.js"
import { getActiveSpell } from "./spells.js"
import { getAnimState } from "../entities/animation.js";

export function resolveWordComplete(enemy){
    const isFinalWord = enemy.currentWordIndex >= enemy.words.length - 1;

    enemy.health = isFinalWord ? 0 : Math.max(0, enemy.health - enemy.damagePerWord);
    enemy.flashTimer = ENEMY_FLASH_DURATION;

    applySpellEffect(enemy, getActiveSpell());

    if (!isFinalWord) enemy.currentWordIndex++;
}

export function updateEnemyEffects(enemies, deltaTime){
    for (const enemy of enemies){
        if (enemy.flashTimer > 0){
            enemy.flashTimer = Math.max(0, enemy.flashTimer - deltaTime);
        }

        const currentAnimState = getAnimState(enemy);
        if (currentAnimState !== enemy.lastAnimState){
            enemy.animTimer = 0;
            enemy.lastAnimState = currentAnimState;
        } else{
            enemy.animTimer += deltaTime;
        }

        if (!enemy.isAlive()){
            enemy.deathTimer += deltaTime;
        }
    }
}