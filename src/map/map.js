import { GRID_COLS, GRID_ROWS } from "../core/constants.js";
import { createPath } from "./path.js";
import { TILE, getPathTile } from "./tiles.js";
import { getPrefabFootprint } from "./prefabs.js";

export function createMap(mapData){
    validateMapData(mapData);

    const path = createPath(mapData.path)
    const grid = createBaseGrid(mapData)
    applyPath(grid, path)

    const occupied = new Set();

    if (mapData.platform){
      for (const cell of getPrefabFootprint(mapData.platform.type, mapData.platform.col, mapData.platform.row)){
        occupied.add(`${cell.col},${cell.row}`)
      }
    }

    const objects = createObjects(mapData.objects || [], path, occupied)
    return {
      id: mapData.id,
      name: mapData.name,
      grid,
      path,
      objects,
      spawn: mapData.spawn || null,
      platform: mapData.platform || null
    }
}

function createBaseGrid(mapData){
  const baseTile = mapData.terrain?.base === "grass" ? TILE.grass.base : TILE.grass.base;
  return Array.from({length: GRID_ROWS}, () => Array.from({length: GRID_COLS}, () => baseTile))
}

function applyPath(grid, path){
  for (const cell of path.cells){
    grid[cell.row][cell.col] = getPathTile(cell, path.cellSet)
  }
}

function createObjects(objectDefinitions, path, occupied){
  const objects = [];

  for (const definition of objectDefinitions){
    const object = {...definition, kind: definition.type}
    delete object.type;

    validateObject(object, path, occupied)
    objects.push(object)

    for (const cell of getPrefabFootprint(object.kind, object.col, object.row)){
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

  const footprint = getPrefabFootprint(object.kind, object.col, object.row);

  for (const cell of footprint){
    if (cell.col < 0 || cell.col >= GRID_COLS || cell.row < 0 || cell.row >= GRID_ROWS){
      throw new Error(`Object '${object.kind}' at (${object.col}, ${object.row}) is outside the map`);
    }

    if (isNearPath(cell.col, cell.row, path.cellSet, 1)){
      throw new Error(`Object '${object.kind}' at (${object.col}, ${object.row}) overlaps or is too close to the path`);
    }

    const margin = (object.kind === "fence" || object.kind === "fencePost") ? 0 : 1;

    for (let dy = -margin; dy <= margin; dy++){
      for (let dx = -margin; dx <= margin; dx++){
        if (occupied.has(`${cell.col + dx},${cell.row + dy}`)){
          throw new Error(`Object '${object.kind}' at (${object.col}, ${object.row}) overlaps another object`);
        }
      }
    }
  }
}

function isNearPath(col, row, pathCellSet, margin){
  for (let dy = -margin; dy <= margin; dy++){
    for (let dx = -margin; dx <= margin; dx++){
      if (pathCellSet.has(`${col + dx},${row + dy}`)) return true;
    }
  }
  return false;
}

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