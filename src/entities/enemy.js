export class Enemy {
    constructor({ x, y, word, maxHealth, speed, spriteId }) {
        this.x = x;
        this.y = y;
        this.word = word;
        this.typedProgress = 0; // How many characters correctly typed so far
        this.maxHealth = maxHealth;
        this.speed = speed;
        this.spriteId = spriteId;

        this.damagePerChar = maxHealth / word.length;
    }

    isAlive() {
        return this.health > 0;
    }
}