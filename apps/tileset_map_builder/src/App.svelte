<script>
  import { onMount } from 'svelte';

  let canvas;
  let tilesetSelection;
  let tilesetImage;

  let selection = [0, 0]; // Which tile we will paint from the menu
  let isMouseDown = false;
  let currentLayer = 0;
  let layers = [
      {}, // Bottom
      {}, // Middle
      {}  // Top
  ];
  let zoomLevel = 1;
  let panOffset = { x: 0, y: 0 };
  let isPanning = false;
  let lastPanPosition = { x: 0, y: 0 };

  // Default image for booting up
  const defaultState = [{}, {}, {}];

  // Add constants for dimensions
  const TILE_SIZE = 32;
  const GRID_SIZE = 15;

  let maxBounds = {
      x: GRID_SIZE,
      y: GRID_SIZE
  };

  // Add pan speed constant
  const PAN_SPEED = TILE_SIZE;

  onMount(() => {
      // Initialize app when tileset source is done loading
      tilesetImage.onload = function() {
          layers = defaultState;
          draw();
          setLayer(0);
      };
      tilesetImage.src = "https://assets.codepen.io/21542/TileEditorSpritesheet.2x_2.png";

      window.addEventListener('keydown', handleKeydown);
      return () => {
          window.removeEventListener('keydown', handleKeydown);
      };
  });

  // New function specifically for tileset coordinates
  function getTilesetCoords(e) {
      const { x, y } = e.target.getBoundingClientRect();
      const mouseX = e.clientX - x;
      const mouseY = e.clientY - y;
      return [Math.floor(mouseX / 32), Math.floor(mouseY / 32)];
  }

  // Select tile from the Tiles grid
  function selectTile(event) {
      selection = getTilesetCoords(event);
      tilesetSelection.style.left = `${selection[0] * 32}px`;
      tilesetSelection.style.top = `${selection[1] * 32}px`;
  }

  // Rename existing getCoords to getCanvasCoords for clarity
  function getCanvasCoords(e) {
      const { x, y } = e.target.getBoundingClientRect();
      const mouseX = e.clientX - x;
      const mouseY = e.clientY - y;
      const worldX = (mouseX - panOffset.x) / zoomLevel;
      const worldY = (mouseY - panOffset.y) / zoomLevel;
      return [Math.floor(worldX / 32), Math.floor(worldY / 32)];
  }

  // Handler for placing new tiles on the map
  function addTile(mouseEvent) {
      const clicked = getCanvasCoords(mouseEvent);
      const key = `${clicked[0]}-${clicked[1]}`;

      if (mouseEvent.shiftKey) {
          delete layers[currentLayer][key];
          // Recalculate max bounds after deletion
          updateMaxBounds();
      } else {
          layers[currentLayer][key] = [selection[0], selection[1]];
          // Update max bounds with new tile
          maxBounds.x = Math.max(maxBounds.x, clicked[0] + 1);
          maxBounds.y = Math.max(maxBounds.y, clicked[1] + 1);
      }
      draw();
  }

  // Add function to recalculate max bounds
  function updateMaxBounds() {
      maxBounds = { x: GRID_SIZE, y: GRID_SIZE };
      layers.forEach(layer => {
          Object.keys(layer).forEach(key => {
              const [x, y] = key.split("-").map(Number);
              maxBounds.x = Math.max(maxBounds.x, x + 1);
              maxBounds.y = Math.max(maxBounds.y, y + 1);
          });
      });
  }

  // Converts data to image:data string and pipes into new browser tab
  function exportImage() {
      const data = canvas.toDataURL();
      const image = new Image();
      image.src = data;

      const w = window.open("");
      w.document.write(image.outerHTML);
  }

  // Reset state to empty
  function clearCanvas() {
      layers = [{}, {}, {}];
      maxBounds = { x: GRID_SIZE, y: GRID_SIZE };
      draw();
  }

  function setLayer(newLayer) {
      currentLayer = newLayer;
  }

  function handleWheel(event) {
      event.preventDefault();
      const zoomSpeed = 0.1;
      const delta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
      const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta));
      
      // Zoom toward mouse position
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      const oldWorldX = (mouseX - panOffset.x) / zoomLevel;
      const oldWorldY = (mouseY - panOffset.y) / zoomLevel;
      
      const newWorldX = (mouseX - panOffset.x) / newZoom;
      const newWorldY = (mouseY - panOffset.y) / newZoom;
      
      panOffset.x += (newWorldX - oldWorldX) * newZoom;
      panOffset.y += (newWorldY - oldWorldY) * newZoom;
      
      zoomLevel = newZoom;
      draw();
  }

  function startPanning(event) {
      if (event.button === 1) { // Middle mouse button
          event.preventDefault();
          isPanning = true;
          lastPanPosition = { x: event.clientX, y: event.clientY };
      }
  }

  function handlePanning(event) {
      if (isPanning) {
          const deltaX = event.clientX - lastPanPosition.x;
          const deltaY = event.clientY - lastPanPosition.y;
          
          panOffset.x += deltaX;
          panOffset.y += deltaY;
          
          lastPanPosition = { x: event.clientX, y: event.clientY };
          draw();
      }
  }

  function stopPanning() {
      isPanning = false;
  }

  function handleKeydown(event) {
      event.preventDefault();
      switch(event.code) {
          case 'Space':
              resetPosition();
              break;
          case 'ArrowLeft':
              panOffset.x += PAN_SPEED;
              draw();
              break;
          case 'ArrowRight':
              panOffset.x -= PAN_SPEED;
              draw();
              break;
          case 'ArrowUp':
              panOffset.y += PAN_SPEED;
              draw();
              break;
          case 'ArrowDown':
              panOffset.y -= PAN_SPEED;
              draw();
              break;
      }
  }

  function resetPosition() {
      panOffset = { x: 0, y: 0 };
      zoomLevel = 1;
      draw();
  }

  // Format dimensions for display
  function getDimensions() {
      return `${maxBounds.x * TILE_SIZE}x${maxBounds.y * TILE_SIZE} pixels (${maxBounds.x}x${maxBounds.y} tiles)`;
  }

  function draw() {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.translate(panOffset.x, panOffset.y);
      ctx.scale(zoomLevel, zoomLevel);

      // Draw initial border lines
      ctx.beginPath();
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2 / zoomLevel;
      
      // Initial vertical and horizontal lines
      ctx.moveTo(0, 0);
      ctx.lineTo(0, TILE_SIZE * GRID_SIZE);
      ctx.moveTo(0, 0);
      ctx.lineTo(TILE_SIZE * GRID_SIZE, 0);
      ctx.stroke();

      // Draw extended border if needed
      if (maxBounds.x > GRID_SIZE || maxBounds.y > GRID_SIZE) {
          ctx.beginPath();
          ctx.strokeStyle = '#666';
          ctx.setLineDash([5 / zoomLevel]);
          
          // Extended vertical line
          ctx.moveTo(0, TILE_SIZE * GRID_SIZE);
          ctx.lineTo(0, TILE_SIZE * maxBounds.y);
          
          // Extended horizontal line
          ctx.moveTo(TILE_SIZE * GRID_SIZE, 0);
          ctx.lineTo(TILE_SIZE * maxBounds.x, 0);
          
          ctx.stroke();
          ctx.setLineDash([]);
      }

      const size_of_crop = 32;
      
      layers.forEach((layer) => {
          Object.keys(layer).forEach((key) => {
              // Determine x/y position of this placement from key ("3-4" -> x=3, y=4)
              const positionX = Number(key.split("-")[0]);
              const positionY = Number(key.split("-")[1]);
              const [tilesheetX, tilesheetY] = layer[key];

              ctx.drawImage(
                  tilesetImage,
                  tilesheetX * 32,
                  tilesheetY * 32,
                  size_of_crop,
                  size_of_crop,
                  positionX * 32,
                  positionY * 32,
                  size_of_crop,
                  size_of_crop
              );
          });
      });

      ctx.restore();
  }

  function copyToClipboard() {
    const layersData = JSON.stringify(layers, null, 2);
    navigator.clipboard.writeText(layersData).then(() => {
      alert("Layers data copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy: ", err);
    });
  }
</script>

<style>
  :global(*) {
      box-sizing: border-box;
  }

  :global(html) { 
      height: 100% 
  }
  
  :global(body) {
      font-family: 'Source Sans Pro', sans-serif;
      padding: 1em;
      background: linear-gradient(180deg, #FFF9E4 0%, #EEEED8 100%);
      display: flex;
      justify-content: space-around;
      color: #2f2c48;
  }

  .instructions {
      font-size: 0.8em;
      color: #aaa;
      text-align: center;
      margin:0;
      margin-bottom: 16px;
  }

  .card {
      background: #fff;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.5);
      padding-bottom: 16px;
  }
  
  header {
      display:flex;
      justify-content: space-between;      
      align-items: center;
      border-bottom: 1px solid #ddd;
      margin-bottom:1em;
      padding: 16px;
  }
  
  header div {
      display: flex;
      flex-direction: column;
  }

  h1 {
      margin:0;
  }

  .dimensions {
      font-size: 0.8em;
      color: #666;
      margin: 4px 0 0 0;
  }
  
  .button-as-link {
      margin-right: 1em;
  }
  
  aside {
      padding-left: 16px;
      padding-right: 16px;
  }
  
  .card_body {
      display:flex;   
  }
  
  .card_right-column {
      padding-right: 16px;
  }

  canvas {
      background: #f4f8f9;
  }

  .tileset-container {
      position: relative;
  }
  
  .tileset-container_selection {
      position:absolute;
      outline: 3px solid cyan;
      left:0;
      top:0;
      width: 32px;
      height:32px;
  }

  .layers {
      list-style-type:none;
      margin:0;
      padding:0;
  }
  
  .layers button {
      appearance:none;
      font-family:inherit;
      outline:0;
      background:transparent;
      border:0;
      padding: 8px 0;
      display:block;
      width: 100%;
      text-align:left;
      cursor:pointer;
      color: black;
  }
  
  .layers button.active {
      font-weight:bold;
      color: #0884f1;
  }

  .button-as-link {
      appearance:none;
      text-decoration: underline;
      background: transparent;
      color: #7f808e;
      border:0;
      outline:0;
      cursor:pointer;
  }
  
  .primary-button {
      border:0;
      background: #4e84fa;
      border-top:4px solid transparent;
      border-bottom: 4px solid #3166c7;
      color: #fff;
      border-radius: 6px;
      outline:0;
      padding: 6px 16px;
      cursor:pointer;
  }

  label {
      text-transform: uppercase;
      margin-bottom: 0.5em;
      font-weight: bold;
      display: block;  
  }

  .layers-data {
    margin-top: 20px;
    border-top: 1px solid #ddd;
    padding-top: 16px;
  }

  .layers-data pre {
    background: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
    max-height: 200px;
    overflow: auto;
    font-size: 12px;
    margin: 8px 0;
  }

  .copy-button {
    background: #eee;
    border: 1px solid #ddd;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    color: black;
  }

  .copy-button:hover {
    background: #e0e0e0;
  }
</style>

<div class="card">
  <header>
      <div>
          <h1>Tile Map Editor</h1>
          <p class="dimensions">Canvas size: {getDimensions()}</p>
      </div>
      <div>
          <button class="button-as-link" on:click={clearCanvas}>Clear Canvas</button>
          <button class="primary-button" on:click={exportImage}>Export Image</button>
      </div>
  </header>
  <div class="card_body">
      <aside>
          <label for="tileset-picker">Tiles</label>
          <div 
              id="tileset-picker"
              class="tileset-container" 
              on:mousedown={selectTile}
              role="button"
              tabindex="0"
              aria-label="Select tile">
              <img 
                  id="tileset-source" 
                  crossorigin="anonymous" 
                  bind:this={tilesetImage}
                  alt="Tileset spritesheet" />
              <div class="tileset-container_selection" bind:this={tilesetSelection}></div>
          </div>
      </aside>
      <div class="card_right-column">
          <!-- The main canvas -->
          <canvas 
              width="720" 
              height="480"
              bind:this={canvas}
              on:mousedown={startPanning}
              on:mousemove={handlePanning}
              on:mouseup={stopPanning}
              on:mouseleave={stopPanning}
              on:wheel={handleWheel}
              on:mousedown={(e) => e.button === 0 && (isMouseDown = true)}
              on:mouseup={() => isMouseDown = false}
              on:mouseleave={() => isMouseDown = false}
              on:mousedown={(e) => e.button === 0 && addTile(e)}
              on:mousemove={(e) => isMouseDown && addTile(e)}
          ></canvas>
          <p class="instructions">
              <strong>Click</strong> to paint. <br/>
              <strong>Shift+Click</strong> to remove.<br/>
              <strong>Middle Click</strong> to pan.<br/>
              <strong>Scroll</strong> to zoom.<br/>
              <strong>Arrow Keys</strong> to pan.<br/>
              <strong>Space</strong> to reset position.<br/>  
          </p>
          <!-- UI for layers -->
          <div>
              <label for="layer-selector">Editing Layer:</label>
              <ul id="layer-selector" class="layers">
                  <li><button on:click={() => setLayer(2)} class:active={currentLayer === 2}>Top Layer</button></li>
                  <li><button on:click={() => setLayer(1)} class:active={currentLayer === 1}>Middle Layer</button></li>
                  <li><button on:click={() => setLayer(0)} class:active={currentLayer === 0}>Bottom Layer</button></li>
              </ul>
          </div>
          <div class="layers-data">
            <h3>Layers Data:</h3>
            <pre>{JSON.stringify(layers, null, 2)}</pre>
            <button class="copy-button" on:click={copyToClipboard}>Copy to Clipboard</button>
          </div>
      </div>
  </div>
</div>