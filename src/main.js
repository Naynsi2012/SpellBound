import { Game } from "./core/game.js";
import "./style.css"

const game = new Game();
game.start().catch((err) => {
  console.error("Failed to start game:", err);
});