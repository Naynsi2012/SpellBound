import {
    getLockedEnemy,
    setLockedEnemy,
    clearLockedEnemy,
    pickLockedTarget
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

export function handleKeyDown(e, enemies, path, trainingMode = false) {
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

        const target = getLockedEnemy();

        if (
            target &&
            enemies.includes(target) &&
            target.isAlive() &&
            target.getCurrentWord()
        ) {
            matchedSequence = recomputeMatch(
                buffer,
                target.getCurrentWord()
            );
        } else {
            matchedSequence = "";
            clearLockedEnemy();
        }

        awaitingReset = buffer.length > 0 && matchedSequence !== buffer;
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

    let target = getLockedEnemy();

    /*
     * Validate the existing lock.
     *
     * A target is only valid if:
     * - it still exists
     * - it is alive
     * - it still has a word
     */
    if (
        target &&
        (
            !enemies.includes(target) ||
            !target.isAlive() ||
            !target.getCurrentWord()
        )
    ) {
        clearLockedEnemy();
        target = null;
        matchedSequence = "";
    }

    // No target means this is the beginning of a new cast.
    if (!target) {
        target = pickLockedTarget(key, enemies, path);

        buffer += key;

        if (target) {
            setLockedEnemy(target);
            matchedSequence = recomputeMatch(buffer, target.getCurrentWord());
        } else {
            matchedSequence = "";
        }

        const matchedSomething = matchedSequence === buffer;
        awaitingReset = !matchedSomething;

        if (!trainingMode) {
            if (matchedSomething) {
                registerHit();
            } else {
                registerMistake();
            }
        }

        return;
    }

    /*
     * We already have a target.
     *
     * Do NOT switch targets halfway through a cast.
     * Incorrect characters remain in the player buffer
     * and are displayed in red.
     */
    buffer += key;

    matchedSequence = recomputeMatch(buffer, target.getCurrentWord());

    const matchedSomething = matchedSequence === buffer;
    awaitingReset = !matchedSomething;

    if (!trainingMode) {
        if (matchedSomething) {
            registerHit();
        } else {
            registerMistake();
        }
    }

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

        clearLockedEnemy();
    }
}

function recomputeMatch(buffer, word) {
    if (!word) return "";
    let matched = 0;

    while (
        matched < buffer.length &&
        matched < word.length &&
        buffer[matched].toLowerCase() === word[matched].toLowerCase()
    ) {
        matched++;
    }

    return word.slice(0, matched);
}