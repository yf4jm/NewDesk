import { get } from 'svelte/store';
import { layers, maxBounds, currentLayer } from '../stores/editorStore';
import { TILE_SIZE, GRID_SIZE } from '../stores/editorStore';
import { draw } from './canvasUtils';

export function getTilesetCoords(e) {
    const { x, y } = e.target.getBoundingClientRect();
    const mouseX = e.clientX - x;
    const mouseY = e.clientY - y;
    return [Math.floor(mouseX / TILE_SIZE), Math.floor(mouseY / TILE_SIZE)];
}

export function updateMaxBounds() {
    const bounds = { x: GRID_SIZE, y: GRID_SIZE };
    get(layers).forEach(layer => {
        Object.keys(layer).forEach(key => {
            const [x, y] = key.split("-").map(Number);
            bounds.x = Math.max(bounds.x, x + 1);
            bounds.y = Math.max(bounds.y, y + 1);
        });
    });
    maxBounds.set(bounds);
}

export function addTile(event, clicked, selectedTile, canvas, tilesetImage) {
    if (clicked[0] < 0 || clicked[1] < 0) return;

    const key = `${clicked[0]}-${clicked[1]}`;
    const layersCopy = get(layers);
    const currentLayerIndex = get(currentLayer);

    if (event.shiftKey) {
        delete layersCopy[currentLayerIndex][key];
        updateMaxBounds();
    } else {
        layersCopy[currentLayerIndex][key] = selectedTile;
        const bounds = get(maxBounds);
        maxBounds.set({
            x: Math.max(bounds.x, clicked[0] + 1),
            y: Math.max(bounds.y, clicked[1] + 1)
        });
    }
    
    layers.set(layersCopy);
    draw(canvas, tilesetImage); // Add immediate draw call
}
