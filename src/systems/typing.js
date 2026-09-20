import { getLockedEnemy, setLockedEnemy, clearLockedEnemy, pickLockedTarget } from "./targeting.js";
import { resolveWordComplete } from "./combat.js";
import { trySendMana, triggerFizzleCooldown } from "./mana.js";
import { registerHit, registerMistake } from "./penalty.js";
import { MANA_PER_KEYSTROKE, MANA_FIZZLE_COOLDOWN } from "../core/constants.js";

let buffer = ""
let matchedSequence = ""

export function getTypedBuffer(){
    return buffer;
}

export function getMatchedSequence(){
    return matchedSequence;
}

export function clearTypedBuffer(){
    buffer = "";
    matchedSequence = "";
    clearLockedEnemy();
}

export function interruptCast(){
    if (!getLockedEnemy()) return;
    clearTypedBuffer();
    registerMistake();
}

export function handleKeyDown(e, enemies, trainingMode = false){
    if (e.key === "Backspace"){
        buffer = buffer.slice(0, -1)
        matchedSequence = recomputeMatch(buffer)
        return
    }

    if (e.key.length !== 1) return;

    const key = e.key.toLowerCase();

    if (!trainingMode){
        if (!trySendMana(MANA_PER_KEYSTROKE)){
            triggerFizzleCooldown(MANA_FIZZLE_COOLDOWN);
            clearTypedBuffer();
            return;
        }
    }

    buffer += key;

    let target = getLockedEnemy();
    let matchedSomething = false;

    if (!target || !enemies.includes(target) || !target.isAlive()){
        target = pickLockedTarget(key, enemies);
        setLockedEnemy(target);
        matchedSequence = target ? key : "";
        matchedSomething = !!target;
    } else{
        const word = target.getCurrentWord().toLowerCase();
        const attempt = matchedSequence + key;

        if (word.startsWith(attempt)){
            matchedSequence = attempt;
            matchedSomething = true;
        } else{
            const relock = pickLockedTarget(key, enemies);
            setLockedEnemy(relock);
            matchedSequence = relock ? key : "";
            matchedSomething = !!relock;
        }
    }

    if (!trainingMode){
        if (matchedSomething) registerHit();
        else registerMistake();
    }

    target = getLockedEnemy();
    if (target && matchedSequence === target.getCurrentWord().toLowerCase()){
        resolveWordComplete(target);
        buffer = "";
        matchedSequence = ""
        clearLockedEnemy();
    }
}

function recomputeMatch(buffer){
    const target = getLockedEnemy();
    if (!target) return "";
    const word = target.getCurrentWord().toLowerCase();
    return word.startsWith(buffer) ? buffer : "";
}