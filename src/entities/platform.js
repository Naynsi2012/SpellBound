export class Platform {
    constructor({ col, row, type, maxHealth }) {
        this.col = col;
        this.row = row;
        this.type = type;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
    }

    isAlive() {
        return this.health > 0;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
}