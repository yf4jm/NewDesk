import { writable } from 'svelte/store';

export const TILE_SIZE = 32;
export const GRID_SIZE = 15;
export const CANVAS_WIDTH = TILE_SIZE * (GRID_SIZE + 8);
export const CANVAS_HEIGHT = TILE_SIZE * GRID_SIZE;
export const PAN_SPEED = TILE_SIZE;

export const zoomLevel = writable(1);
export const panOffset = writable({ x: 0, y: 0 });
export const currentLayer = writable(0);
export const selection = writable([0, 0]);
export const layers = writable([{}, {}, {}]);
export const maxBounds = writable({ x: GRID_SIZE, y: GRID_SIZE });
