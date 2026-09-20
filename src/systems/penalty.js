import { BACKLASH_BASE_COST, COMBO_SUPPRESS_THRESHOLD, COMBO_SUPPRESS_MS } from "../core/constants.js"
import { sendManaDirect, suppressRegen } from "./mana.js"

let combo = 0;

export function getCombo(){
    return combo;
}

export function resetCombo(){
    combo = 0;
}

export function registerHit(){
    combo++;
}

export function registerMistake(){
    const tier = Math.floor(combo / 5);
    const backlash = BACKLASH_BASE_COST + tier * BACKLASH_BASE_COST;

    sendManaDirect(backlash);

    if (combo >= COMBO_SUPPRESS_THRESHOLD){
        suppressRegen(COMBO_SUPPRESS_MS);
    }

    combo = 0;
}