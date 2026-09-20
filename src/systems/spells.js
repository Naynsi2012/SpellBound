const SPELL_TYPES = ["none", "slow", "burn", "paralyze"];

let activeIndex = 0;

export function getSpellTypes(){
    return SPELL_TYPES;
}

export function getActiveSpell(){
    return SPELL_TYPES[activeIndex];
}

export function cycleSpell(direction = 1){
    activeIndex = (activeIndex + direction + SPELL_TYPES.length) % SPELL_TYPES.length;
}

export function resetActiveSpell(){
    activeIndex = 0;
}