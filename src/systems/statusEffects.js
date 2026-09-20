import {
  SLOW_MULTIPLIER,
  SLOW_DURATION,
  PARALYZE_DURATION,
  BURN_DURATION,
  BURN_TICK_INTERVAL,
  BURN_DAMAGE_PER_TICK,
  ENEMY_FLASH_DURATION,
} from "../core/constants.js";

export function applyStatusEffect(enemy, spellType){
    if (spellType === "slow") enemy.slowTimer = SLOW_DURATION;
    else if (spellType === "paralyze") enemy.paralyzedTimer = PARALYZE_DURATION;
    else if (spellType === "burn"){
        enemy.burnTimer = BURN_DURATION;
        enemy.burnTickTimer = BURN_TICK_INTERVAL;
    }
}

export function updateStatusEffects(enemies, deltaTime){
    for (const enemy of enemies){
        if (enemy.slowTimer > 0) enemy.slowTimer = Math.max(0, enemy.slowTimer - deltaTime);
        if (enemy.paralyzedTimer > 0) enemy.paralyzedTimer = Math.max(0, enemy.paralyzedTimer - deltaTime);
        if (enemy.burnTimer > 0 && enemy.isAlive()){
            enemy.burnTimer -= deltaTime;
            enemy.burnTickTimer -= deltaTime;

            if (enemy.burnTickTimer <= 0){
                enemy.health = Math.max(0, enemy.health - BURN_DAMAGE_PER_TICK);
                enemy.burnTickTimer = BURN_TICK_INTERVAL;
                enemy.flashTimer = ENEMY_FLASH_DURATION;
            }
        } 
    }
}

export function getEffectiveSpeed(enemy){
    if (enemy.paralyzedTimer > 0) return 0;
    if (enemy.slowTimer > 0) return enemy.speed * SLOW_MULTIPLIER;
    return enemy.speed;
}