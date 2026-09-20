import { MANA_MAX, MANA_REGEN_PER_SECOND, COMBO_SUPPRESS_MS } from "../core/constants.js"

let mana = MANA_MAX;
let castCooldownTimer = 0;
let regenSuppressTimer = 0;

export function getMana(){
    return mana;
}

export function getMaxMana(){
    return MANA_MAX;
}

export function isOnCastCooldown(){
    return castCooldownTimer > 0;
}

export function resetMana(){
    mana = MANA_MAX;
    castCooldownTimer = 0;
    regenSuppressTimer = 0;
}

export function updateMana(deltaTime){
    if (castCooldownTimer > 0) castCooldownTimer = Math.max(0, castCooldownTimer - deltaTime);
    if (regenSuppressTimer > 0){
        regenSuppressTimer = Math.max(0, regenSuppressTimer - deltaTime);
        return;
    }

    mana = Math.min(MANA_MAX, mana + (MANA_REGEN_PER_SECOND * deltaTime) / 1000);
}

export function trySendMana(amount){
    if (castCooldownTimer > 0 || mana < amount) return false;
    mana -= amount;
    return true;
}

export function sendManaDirect(amount){
    mana = Math.max(0, mana - amount);
}

export function triggerFizzleCooldown(ms){
    castCooldownTimer = ms;
}

export function suppressRegen(ms){
    regenSuppressTimer = Math.max(regenSuppressTimer, ms);
}
