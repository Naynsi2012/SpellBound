export class Enemy {
    constructor({x, y, words, maxHealth, speed, spriteId, pathIndex = 0}){
        this.x = x;
        this.y = y;

        this.words = words;
        this.currentWordIndex = 0;
        this.typedProgress = 0;

        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.speed = speed;
        this.spriteId = spriteId;

        // Path movement state
        this.pathIndex = pathIndex;
        this.pathProgress = 0;
        this.damagePerChar = maxHealth / words.length;
    }

    isAlive() {
        return this.health > 0;
    }

    getCurrentWord() {
        return this.words[this.currentWordIndex]
    }
}