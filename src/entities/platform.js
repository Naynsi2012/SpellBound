export class Platform{
    constructor({x, y, type, tiles, maxHealth}){
        this.x = x;
        this.y = y;
        this.type = type;
        this.tiles = tiles;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
    }

    isAlive(){
        return this.health > 0;
    }

    takeDamage(amount){
        this.health = Math.max(0, this.health - amount)
    }
}