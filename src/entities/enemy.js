export class Enemy {
    constructor({x, y, word, maxHealth, speed, spriteId}){
        this.x = x;
        this.y = y;

        this.word = word;
        this.typedProgress = 0;

        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.speed = speed;
        this.spriteId = spriteId;

        // Path movement state
        this.pathIndex = 0;
        this.pathProgress = 0;
        this.damagePerChar = maxHealth / word.length;
    }

    isAlive() {
        return this.health > 0;
    }
}