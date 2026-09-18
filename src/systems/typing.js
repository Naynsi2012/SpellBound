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
}

export function handleKeyDown(e, enemies){
    if (e.key === "Backspace"){
        buffer = buffer.slice(0, -1)

        matchedSequence = getMatchingSequence(buffer, enemies)
        return
    }

    if (e.key.length !== 1) return;

    const key = e.key.toLowerCase();
    buffer += key;

    const currentEnemy = getEnemyWithCompletedWord(buffer, enemies);
    if (currentEnemy){
        if (currentEnemy.currentWordIndex < currentEnemy.words.length - 1){
            currentEnemy.currentWordIndex++;
        } else{
            currentEnemy.health = 0;
        }

        buffer = "";
        matchedSequence = "";
        return;
    }

    if (isPrefixOfAnyWord(buffer, enemies)){
        matchedSequence = buffer;
    } else{
        matchedSequence = ""
    }
}

function getMatchingSequence(buffer, enemies){
    if (isPrefixOfAnyWord(buffer, enemies)){
        return buffer;
    }

    return "";
}

function isPrefixOfAnyWord(str, enemies){
    return enemies.some((enemy) => {
        return enemy.getCurrentWord().toLowerCase().startsWith(str)
    })
}

function getEnemyWithCompletedWord(buffer, enemies){
    return enemies.find((enemy) => {
        return enemy.getCurrentWord().toLowerCase() === buffer
    })
}