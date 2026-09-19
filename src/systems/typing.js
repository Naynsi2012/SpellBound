import { getLockedEnemy, setLockedEnemy, clearLockedEnemy, pickLockedTarget } from "./targeting.js";
import { resolveWordComplete } from "./combat.js";

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

export function handleKeyDown(e, enemies){
    if (e.key === "Backspace"){
        buffer = buffer.slice(0, -1)
        matchedSequence = recomputeMatch(buffer)
        return
    }

    if (e.key.length !== 1) return;

    const key = e.key.toLowerCase();
    buffer += key;

    let target = getLockedEnemy();
    if (!target || !enemies.includes(target) || !target.isAlive()){
        target = pickLockedTarget(key, enemies);
        setLockedEnemy(target);
        matchedSequence = target ? key : "";
    } else{
        const word = target.getCurrentWord().toLowerCase();
        const attempt = matchedSequence + key;

        if (word.startsWith(attempt)){
            matchedSequence = attempt;
        } else{
            const relock = pickLockedTarget(key, enemies);
            setLockedEnemy(relock);
            matchedSequence = relock ? key : "";
        }
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