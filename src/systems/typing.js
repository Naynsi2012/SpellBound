import {
    getLockedEnemy,
    setLockedEnemy,
    clearLockedEnemy,
    pickTargetForBuffer
} from "./targeting.js";

import { resolveWordComplete } from "./combat.js";
import { trySpendMana, triggerFizzleCooldown } from "./mana.js";
import { registerHit, registerMistake } from "./penalty.js";
import { MANA_PER_KEYSTROKE, MANA_FIZZLE_COOLDOWN } from "../core/constants.js";

let buffer = "";
let matchedSequence = "";
let awaitingReset = false;

export function getTypedBuffer() {
    return buffer;
}

export function getMatchedSequence() {
    return matchedSequence;
}

export function isAwaitingReset() {
    return awaitingReset;
}

export function clearTypedBuffer() {
    buffer = "";
    matchedSequence = "";
    awaitingReset = false;

    clearLockedEnemy();
}

export function interruptCast() {
    if (!getLockedEnemy()) return;

    clearTypedBuffer();
    registerMistake();
}

export function handleKeyDown(e, enemies, path, trainingMode = false, audio) {
    if (e.key === "Backspace") {
        if (buffer.length === 0) return;

        buffer = buffer.slice(0, -1);

        // Completely reset the cast when the player has erased the entire input
        if (buffer.length === 0) {
            matchedSequence = "";
            awaitingReset = false;
            clearLockedEnemy();
            return;
        }

        applyBuffer(enemies, path);
        return;
    }

    if (e.key.length !== 1) return;

    const key = e.key.toLowerCase();

    if (!trainingMode) {
        if (!trySpendMana(MANA_PER_KEYSTROKE)) {
            triggerFizzleCooldown(MANA_FIZZLE_COOLDOWN);
            clearTypedBuffer();
            return;
        }
    }

    buffer += key;

    const matchedSomething = applyBuffer(enemies, path);
    audio.play("type");

    if (!trainingMode) {
        if (matchedSomething) {
            registerHit();
        } else {
            registerMistake();
        }
    }

    const target = getLockedEnemy();

    // Word completed
    if (
        target &&
        target.getCurrentWord() &&
        matchedSequence === target.getCurrentWord().toLowerCase() &&
        buffer === target.getCurrentWord().toLowerCase()
    ) {
        resolveWordComplete(target);

        buffer = "";
        matchedSequence = "";
        awaitingReset = false;

        if (!target.isAlive()) audio.play("death"); // plays when the enemy is dead
        clearLockedEnemy();
    }
}

function applyBuffer(enemies, path) {
    const currentTarget = getLockedEnemy();
    const lowerBuffer = buffer.toLowerCase();

    // Stay on the current target if it's still a valid match - avoids
    // needlessly hopping between enemies that share a prefix.
    if (
        currentTarget &&
        enemies.includes(currentTarget) &&
        currentTarget.isAlive() &&
        currentTarget.getCurrentWord() &&
        currentTarget.getCurrentWord().toLowerCase().startsWith(lowerBuffer)
    ) {
        matchedSequence = buffer;
        awaitingReset = false;
        return true;
    }

    const target = pickTargetForBuffer(buffer, enemies, path);

    if (target) {
        setLockedEnemy(target);
        matchedSequence = buffer;
        awaitingReset = false;
        return true;
    }

    // Nothing on the field can complete this buffer at all - this is the
    // only case that should read as a genuine mistake/red highlight.
    clearLockedEnemy();
    matchedSequence = bestPartialMatch(buffer, enemies);
    awaitingReset = true;
    return false;
}

// The longest prefix of the buffer that still matches the start of some
// enemy's word, so the player keeps seeing green for everything they
// typed correctly right up to the point it actually went wrong.
function bestPartialMatch(buffer, enemies) {
    const lowerBuffer = buffer.toLowerCase();
    let bestLength = 0;

    for (const enemy of enemies) {
        if (!enemy.isAlive()) continue;

        const word = enemy.getCurrentWord();
        if (!word) continue;

        const length = commonPrefixLength(lowerBuffer, word.toLowerCase());
        if (length > bestLength) bestLength = length;
    }

    return buffer.slice(0, bestLength);
}

function commonPrefixLength(a, b) {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return i;
}