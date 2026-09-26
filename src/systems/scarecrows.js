import { Enemy } from "../entities/enemy.js";
import { TILE_SIZE } from "../core/constants.js";

const WORD_POOL = [
  // Very easy
  "fire",
  "water",
  "wind",
  "rock",
  "star",
  "moon",
  "light",
  "dark",
  "rain",
  "snow",
  "tree",
  "wave",
  "flame",
  "frost",

  // Easy
  "storm",
  "spark",
  "shield",
  "sword",
  "stone",
  "cloud",
  "river",
  "forest",
  "shadow",
  "magic",
  "spell",
  "arrow",
  "blade",
  "heart",

  // Medium
  "dragon",
  "castle",
  "wizard",
  "knight",
  "guardian",
  "village",
  "crystal",
  "thunder",
  "summon",
  "portal",
  "monster",
  "phantom",
  "warrior",
  "ancient",

  // Slightly harder
  "darkness",
  "fireball",
  "lightning",
  "enchanted",
  "mystical",
  "battlefield",
  "spellcaster",
  "stormcaller"
];

const SCARECROW_HEALTH = 60;

function randomWords(count) {
  const shuffled = [...WORD_POOL].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count);
}

export function createScarecrow(position) {
  return new Enemy({
    x: position.col * TILE_SIZE + TILE_SIZE / 2,
    y: position.row * TILE_SIZE + TILE_SIZE / 2,

    words: randomWords(1 + Math.floor(Math.random() * 2)),

    maxHealth: SCARECROW_HEALTH,
    speed: 0,
    spriteId: "dummy",
    pathIndex: 0,
  });
}