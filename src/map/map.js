import { GRID_COLS, GRID_ROWS } from "../core/constants.js";
import { createPath } from "./path.js";
import { TILE, getPathTile } from "./tiles.js";

export function createMap(mapData){
    validateMapData(mapData);

    const path = createPath(mapData.path)
    const grid = createBaseGrid(mapData)  
    applyPath(grid, path)

    const objects = createObjects(mapData.objects || [], path)
    return {
      id: mapData.id,
      name: mapData.name,
      grid,
      path,
      objects,
      spawn: mapData.spawn || null
    }
}

// Create the grass background
function createBaseGrid(mapData){
  const baseTile = mapData.terrain?.base === "grass" ? TILE.grass.base : TILE.grass.base;

  return Array.from({length: GRID_ROWS}, () => Array.from({length: GRID_COLS}, () => baseTile))
}

function applyPath(grid, path){
  for (const cell of path.cells){
    grid[cell.row][cell.col] = getPathTile(cell, path.cellSet)
  }
}

function createObjects(objectDefinitions, path){
  const objects = [];
  const occupied = new Set();

  for (const definition of objectDefinitions){
    const object = {...definition, kind: definition.type}

    delete object.type;

    validateObject(object, path, occupied)
    objects.push(object)

    for (const cell of getFootprint(object)){
      occupied.add(`${cell.col},${cell.row}`)
    }
  }

  return objects;
}

function validateObject(object, path, occupied){
  if (!object.kind){
    throw new Error("Map object is missing it's 'type'");
  }

  if (typeof object.col !== "number" || typeof object.row !== "number"){
    throw new Error(`Object '${object.kind}' must have numeric col and row`);
  }

  const footprint = getFootprint(object)

  for (const cell of footprint){
    if (cell.col < 0 || cell.col >= GRID_COLS || cell.row < 0 || cell.row >= GRID_ROWS){
      throw new Error(`Object '${object.kind}' at (${object.col}, ${object.row}) is outside the map`);
    }

    if (isNearPath(cell.col, cell.row, path.cellSet, 1)){
      throw new Error(`Object '${object.kind}' at (${object.col}, ${object.row}) overlaps or is too close to the path`);
    }

    // Don't allow objects to overlap
    for (let dy = -1; dy <= 1; dy++){
      for (let dx = -1; dx <= 1; dx++){
        if (occupied.has(`${cell.col + dx},${cell.row + dy}`)){
          throw new Error(`Object '${object.kind}' at (${object.col}, ${object.row}) overlaps another object`);
        }
      }
    }
  }
}

// Defines the space occupied by each object
function getFootprint(object){
  const {kind, col, row} = object;

  if (kind === "greenTree" || kind === "orangeTree"){
    return [
      {col, row: row - 2},
      {col, row: row - 1},
      {col, row},
      {col, row: row + 1}
    ]
  }

  // Small tree
  if (kind === "singleTree"){
    return [
      {col, row},
      {col: col + 1, row},
      {col, row: row + 1},
      {col: col + 1, row: row + 1}
    ]
  }

  // Everything else is currently treated as a single tile
  return [
    {col, row}
  ]
}

// Check whether a cell is close to the path
function isNearPath(col, row, pathCellSet, margin){
  for (let dy = -margin; dy <= margin; dy++){
    for (let dx = -margin; dx <= margin; dx++){
      if (pathCellSet.has(`${col + dx},${row + dy}`)) return true;
    }
  }

  return false;
}

// Some basic map validation
function validateMapData(mapData){
  if (!mapData || typeof mapData !== "object"){
    throw new Error("Invalid map data")
  }

  if (!mapData.id){
    throw new Error("Map is missing an 'id'")
  }

  if (!mapData.path){
    throw new Error(`Map '${mapData.id}' is missing a path`)
  }
}