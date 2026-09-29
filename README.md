# Spellbound Keep

**Spellbound Keep** is a keyboard-only typing tower defense game where your typing is your main weapon.

Enemies follow a path toward the keep, with words displayed above them. Type the word correctly to attack them. The game is designed around typing accuracy and decision-making rather than simply typing as fast as possible.

There are also a few spells you can switch between, so completing a word isn't always just about dealing damage. You can choose effects such as **Slow, Burn, or Paralyze** depending on the situation.

The entire game can be played without a mouse including menus, spell selection, combat, and navigation.

## Features

* **100% keyboard-only** — no mouse interaction is required anywhere in the game.
* **Typing-based combat** — enemies carry words, and completing them deals damage based on the completed word.
* **Strict typing mistakes** — once a real mismatch happens, you need to press Backspace before starting a new attempt. This prevents accidentally continuing through a mistake.
* **Mana system** — each keystroke consumes mana, while mana regenerates over time. Running out of mana causes the current cast to fizzle.
* **Mistype penalties** — mistakes consume additional mana, with the penalty increasing with your current combo. Breaking a large combo also temporarily affects mana regeneration.
* **Selectable spells** — use Tab to cycle between **Slow, Burn, Paralyze, and No Spell**.
* **Target locking** — typing automatically locks onto the most urgent valid enemy based on its actual distance along the path.
* **Enemy queueing** — enemies maintain separation while moving along the path, preventing them from simply stacking on top of each other.
* **Wave system** — enemies arrive in timed waves, with a short prompt between completed waves and a final victory state.
* **Keep health** — enemies that reach the keep attack it. If its health reaches zero, the run ends.
* **Training mode** — practice against stationary training dummies without mana or mistype penalties. Defeated dummies respawn so you can keep practicing.
* **Sprite animation** — enemies have idle, walking, hurt, and death animations, with their sprites flipped according to their movement direction.
* **Tiled maps** — maps are created visually in Tiled, including the environment, enemy path, and keep location. The game reads this information from `.tmx` files at runtime.
* **Dynamic enemy UI** — word bubbles and health bars are positioned around enemies and adjusted to reduce overlap.
* **HUD** — displays keep health, mana, combo, and the currently selected spell.

## Tech Stack

* **Vanilla JavaScript (ES6+)** — the game is built using plain JavaScript modules and classes without a frontend framework.
* **HTML5 Canvas 2D** — the game world, enemies, effects, menus, and interface are rendered through Canvas.
* **Vite** — used as the development server and build tool.
* **npm** — used for dependency and script management.
* **Tiled** — used to create and edit the game's maps. The maps contain tile layers along with object-layer information for the enemy path and keep.

## Assets & Resources

The game uses a combination of existing asset packs and custom game code.

### Asset Packs

* **Kenney Tiny Town** — used for environment, buildings, paths, vegetation, and other world elements.
* **Kenney Tiny Dungeon** — used for dungeon-style characters and enemy-related visuals.
* **Mystic Woods** — used for additional environment and decorative assets.

The enemy animations, movement, pathing, UI positioning, combat systems, and other gameplay logic are implemented separately in the game's JavaScript code.

## Maps

The game's maps are created using **Tiled** rather than being completely hard-coded.

Two playable maps are currently used:

* `spawn.tmx` — the main Spellbound Keep map.
* `training.tmx` — the training map with stationary practice dummies.

The TMX files contain the visual tile layers as well as object-layer information used by the game. This includes things such as the enemy path and the keep's position.

This makes it possible to change the level visually in Tiled without having to manually rewrite the game's map coordinates.

## Controls

The game is designed around keyboard input.

| Key                    | Action                          |
| ---------------------- | ------------------------------- |
| **Typing keys**        | Type the enemy's word           |
| **Backspace**          | Recover from a mistype          |
| **Tab**                | Switch active spell             |
| **Enter / Arrow keys** | Navigate menus where applicable |

The exact controls can vary depending on the current game state.

## Core Gameplay Loop

1. Enemies spawn at the beginning of a wave.
2. They follow the path toward the keep.
3. The game automatically selects the most urgent valid target when you begin typing.
4. Type the displayed word correctly.
5. Completing a word damages the enemy and applies the currently selected spell effect.
6. Defeat enemies before they reach the keep.
7. Manage your mana and combo while dealing with mistakes.
8. Complete every wave to defend the keep.

The idea is to make typing itself feel like the combat system rather than simply using typing as an input method for a traditional tower defense game.

## AI Usage

AI assistance was used during development mainly for **debugging and working through the TMX-based map system**.

In particular, AI was used to help with:

* Understanding and implementing the `TMX` map loading pipeline.
* Building the `tmxLoader` logic so the `.tmx` map data could work with the game's existing rendering and gameplay systems.
* Connecting Tiled map data with the existing enemy path and keep systems.
* Debugging issues that came up while integrating the new map system with the existing codebase.
* Helping identify and fix smaller implementation issues during development.

The gameplay systems, game design, asset selection, level design, and overall project direction were developed as part of the project itself.

## How to Run Locally

### 1. Clone or download the repository

```bash
git clone https://github.com/Naynsi2012/SpellBound.git
cd SpellBound
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

### 4. Open the local URL

Vite will print the local development URL in the terminal, usually:

```text
http://localhost:5173
```

Vite provides hot reloading during development, so changes to the source files can be tested immediately.
