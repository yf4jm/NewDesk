import { get } from 'svelte/store';
import { zoomLevel, panOffset, layers, maxBounds } from '../stores/editorStore';
import { TILE_SIZE, GRID_SIZE } from '../stores/editorStore';

export function getCanvasCoords(e) {
    const { x, y } = e.target.getBoundingClientRect();
    const mouseX = e.clientX - x;
    const mouseY = e.clientY - y;
    const worldX = (mouseX - get(panOffset).x) / get(zoomLevel);
    const worldY = (mouseY - get(panOffset).y) / get(zoomLevel);
    return [Math.floor(worldX / TILE_SIZE), Math.floor(worldY / TILE_SIZE)];
}

export function draw(canvas, tilesetImage) {
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(get(panOffset).x, get(panOffset).y);
    ctx.scale(get(zoomLevel), get(zoomLevel));

    drawBorders(ctx);
    drawTiles(ctx, tilesetImage);

    ctx.restore();
}

function drawBorders(ctx) {
    // Draw initial border lines
    ctx.beginPath();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2 / get(zoomLevel);
    
    // Initial lines
    ctx.moveTo(0, 0);
    ctx.lineTo(0, TILE_SIZE * GRID_SIZE);
    ctx.moveTo(0, 0);
    ctx.lineTo(TILE_SIZE * GRID_SIZE, 0);
    ctx.stroke();

    // Extended borders
    const bounds = get(maxBounds);
    if (bounds.x > GRID_SIZE || bounds.y > GRID_SIZE) {
        ctx.beginPath();
        ctx.setLineDash([5 / get(zoomLevel)]);
        
        ctx.moveTo(0, TILE_SIZE * GRID_SIZE);
        ctx.lineTo(0, TILE_SIZE * bounds.y);
        ctx.moveTo(TILE_SIZE * GRID_SIZE, 0);
        ctx.lineTo(TILE_SIZE * bounds.x, 0);
        
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function drawTiles(ctx, tilesetImage) {
    get(layers).forEach((layer) => {
        Object.keys(layer).forEach((key) => {
            const [positionX, positionY] = key.split("-").map(Number);
            const [tilesheetX, tilesheetY] = layer[key];

            ctx.drawImage(
                tilesetImage,
                tilesheetX * TILE_SIZE,
                tilesheetY * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE,
                positionX * TILE_SIZE,
                positionY * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
            );
        });
    });
}
