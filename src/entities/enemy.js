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

        this.reachedEnd = false;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackCooldown = 1000;
        this.attackDamage = 10;

        this.damagePerWord = maxHealth / words.length;
        this.flashTimer = 0;

        this.slowTimer = 0;
        this.paralyzedTimer = 0;
        this.burnTimer = 0;
        this.burnTickTimer = 0;
    }

    isAlive() {
        return this.health > 0;
    }

    getCurrentWord() {
        return this.words[this.currentWordIndex]
    }
}