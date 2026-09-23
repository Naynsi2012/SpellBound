import { getLockedEnemy, setLockedEnemy, clearLockedEnemy, pickLockedTarget } from "./targeting.js";
import { resolveWordComplete } from "./combat.js";
import { trySendMana, triggerFizzleCooldown } from "./mana.js";
import { registerHit, registerMistake } from "./penalty.js";
import { MANA_PER_KEYSTROKE, MANA_FIZZLE_COOLDOWN } from "../core/constants.js";

let buffer = ""
let matchedSequence = ""
let awaitingReset = false

export function getTypedBuffer(){
    return buffer;
}

export function getMatchedSequence(){
    return matchedSequence;
}

export function isAwaitingSequence(){
    return awaitingReset;
}

export function clearTypedBuffer(){
    buffer = "";
    matchedSequence = "";
    awaitingReset = false;
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
        awaitingReset = false
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

    if (awaitingReset) return;

    let target = getLockedEnemy();
    let matchedSomething = false;
    const hadProgress = matchedSequence.length > 0;

    if (!target || !enemies.includes(target) || !target.isAlive()){
        target = pickLockedTarget(key, enemies, path);
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
            clearLockedEnemy();
            matchedSequence = "";
        }
    }

    if (!trainingMode){
        if (matchedSomething) registerHit();
        else registerMistake();
    }

    if (!matchedSomething && hadProgress) awaitingReset = true;

    target = getLockedEnemy();
    if (target && matchedSequence === target.getCurrentWord().toLowerCase()){
        resolveWordComplete(target);
        buffer = "";
        matchedSequence = ""
        clearLockedEnemy();
        awaitingReset = false;
    }
}

function recomputeMatch(buffer){
    const target = getLockedEnemy();
    if (!target) return "";
    const word = target.getCurrentWord().toLowerCase();
    return word.startsWith(buffer) ? buffer : "";
}