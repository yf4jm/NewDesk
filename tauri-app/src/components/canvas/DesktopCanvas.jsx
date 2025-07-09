import React, { useEffect, useState, useRef, useCallback } from 'react';
import retrieveCanvas from '../../utils/canvas/retrieveCanvas';
import actionsFactory from '../../utils/canvas/actionsFactory';
import TileModal from './TileModal';
import saveCanvas from '../../utils/canvas/saveCanvas';
import getApps from '../../utils/getApps';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import useSmoothSpriteMovement from './useSmoothSpriteMovement';
import { TILE_SIZE, GRID_SIZE } from './constants';
import cMovesImg from './characterMoves.png';

const DesktopCanvas = () => {
    const canvasRef = useRef(null);
    const tilesetImageRef = useRef(null);
    const spriteImageRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const actionsRef = useRef({});
    const [frameCount, setFrameCount] = useState(0);
    const [defaultLayers] = useState([{"0-4":[3,2],"1-4":[4,2],"2-4":[4,2],"3-4":[4,2],"4-4":[4,1],"5-5":[4,2],"6-5":[4,2],"7-5":[4,2],"8-5":[4,2],"9-5":[4,2],"10-5":[4,2],"11-6":[3,2],"12-6":[4,2],"13-6":[4,2],"14-6":[4,2],"12-5":[4,1],"5-4":[4,1],"3-3":[4,1],"0-3":[4,1],"1-3":[4,1],"4-3":[4,1],"5-3":[4,1],"7-3":[4,1],"8-3":[4,1],"9-3":[4,1],"10-3":[4,1],"10-4":[4,1],"11-4":[4,1],"11-5":[4,1],"4-5":[3,2],"2-3":[4,1],"6-3":[4,1],"11-3":[4,1],"12-3":[4,1],"13-3":[4,1],"14-3":[4,1],"6-4":[4,1],"7-4":[4,1],"8-4":[4,1],"9-4":[4,1],"12-4":[4,1],"13-4":[4,1],"14-4":[4,1],"13-5":[4,1],"14-5":[4,1],"14-2":[4,1],"13-2":[4,1],"12-2":[4,1],"11-2":[4,1],"10-2":[4,1],"9-2":[4,1],"8-2":[4,1],"7-2":[4,1],"6-2":[4,1],"5-2":[4,1],"4-2":[4,1],"3-2":[4,1],"2-2":[4,1],"1-2":[4,1],"0-2":[4,1],"0-1":[4,1],"1-1":[4,1],"2-1":[4,1],"3-1":[4,1],"4-1":[4,1],"6-1":[4,1],"8-1":[4,1],"9-1":[4,1],"10-1":[4,1],"11-1":[4,1],"12-1":[4,1],"13-1":[4,1],"14-1":[4,1],"7-1":[4,1],"5-1":[4,1],"0-0":[4,1],"1-0":[4,1],"2-0":[4,1],"3-0":[4,1],"4-0":[4,1],"5-0":[4,1],"6-0":[4,1],"7-0":[4,1],"8-0":[4,1],"9-0":[4,1],"10-0":[4,1],"11-0":[4,1],"12-0":[4,1],"13-0":[4,1],"14-0":[4,1],"14-14":[2,6],"7-14":[3,6],"6-14":[2,6],"5-14":[3,6],"4-13":[3,6],"3-13":[2,6],"1-11":[2,10],"1-10":[2,10],"0-8":[0,6],"0-10":[2,10],"3-10":[3,6],"4-10":[2,6],"0-5":[3,6],"0-6":[0,6],"0-7":[1,6],"0-9":[1,6],"0-11":[2,10],"0-12":[2,10],"0-13":[2,10],"0-14":[0,6],"1-14":[1,6],"1-13":[2,10],"1-12":[3,6],"1-9":[2,6],"1-8":[1,6],"1-7":[0,6],"1-6":[3,6],"1-5":[2,6],"2-5":[3,6],"2-6":[2,6],"2-7":[3,6],"2-8":[0,6],"2-9":[3,6],"2-13":[2,10],"2-14":[0,6],"3-14":[1,6],"3-12":[3,6],"3-11":[2,6],"3-9":[2,6],"3-8":[3,6],"3-7":[2,6],"3-6":[3,6],"3-5":[2,6],"4-6":[2,6],"4-7":[3,6],"4-8":[2,6],"4-9":[3,6],"4-11":[3,6],"4-12":[2,6],"4-14":[2,6],"5-13":[2,6],"5-12":[4,10],"5-11":[4,10],"5-10":[4,10],"5-9":[4,10],"5-8":[3,6],"5-7":[2,6],"5-6":[3,6],"6-6":[2,6],"6-7":[3,6],"6-8":[2,6],"6-9":[4,10],"6-10":[4,10],"6-11":[4,10],"6-12":[4,10],"6-13":[3,6],"7-13":[2,6],"7-12":[4,10],"7-10":[4,10],"7-9":[4,10],"7-8":[3,6],"7-7":[2,6],"7-6":[3,6],"8-6":[2,6],"8-7":[3,6],"8-10":[4,10],"8-11":[4,10],"8-12":[4,10],"8-14":[2,6],"8-13":[3,6],"9-14":[3,6],"9-13":[2,6],"9-12":[4,10],"9-11":[4,10],"9-10":[4,10],"9-7":[2,6],"9-6":[3,6],"10-7":[3,6],"10-8":[2,6],"10-9":[3,6],"10-10":[2,6],"10-11":[3,6],"10-12":[2,6],"10-13":[3,6],"10-14":[2,6],"10-6":[2,6],"11-7":[2,6],"12-7":[3,6],"13-7":[2,6],"14-7":[2,6],"14-8":[2,6],"14-9":[3,6],"14-10":[4,3],"14-11":[4,4],"14-12":[2,6],"14-13":[3,6],"13-14":[3,6],"12-14":[2,6],"11-14":[3,6],"11-13":[2,6],"12-13":[3,6],"13-13":[2,6],"13-12":[3,6],"12-12":[2,6],"11-12":[3,6],"11-11":[2,6],"12-11":[3,6],"13-11":[4,4],"13-10":[2,6],"12-10":[2,6],"11-10":[3,6],"12-9":[3,6],"13-9":[2,6],"13-8":[3,6],"12-8":[2,6],"11-9":[2,6],"11-8":[3,6],"2-10":[2,10],"2-11":[2,10],"2-12":[2,10],"8-9":[4,10],"8-8":[4,10],"9-9":[4,10],"9-8":[4,10],"7-11":[4,10]},{"5-9":[2,7],"6-9":[2,7],"7-9":[2,7],"3-9":[0,6],"3-11":[0,6],"3-13":[0,6],"1-9":[0,6],"2-9":[1,6],"1-10":[1,7],"3-10":[1,6],"3-12":[1,6],"2-10":[1,7],"1-12":[2,10],"0-8":[1,2],"1-8":[1,2],"2-8":[1,2],"2-7":[2,1],"2-6":[2,0],"1-6":[1,0],"0-6":[1,0],"1-7":[1,1],"0-7":[1,1],"11-11":[3,3],"12-11":[4,3],"13-11":[4,4],"14-11":[4,4],"11-12":[3,4],"11-13":[3,5],"12-13":[4,5],"13-13":[4,5],"14-13":[4,5],"12-12":[4,4],"13-12":[4,4],"14-12":[4,4],"0-10":[0,7],"13-10":[3,3],"11-5":[3,1],"4-4":[3,1],"8-8":[2,7],"9-8":[2,7]},{"0-5":[4,12],"1-5":[4,12],"2-5":[4,12],"3-5":[4,12],"4-6":[4,12],"5-6":[4,12],"6-6":[4,12],"7-6":[4,12],"8-6":[4,12],"9-6":[4,12],"10-6":[4,12],"11-7":[4,12],"12-7":[4,12],"13-7":[4,12],"14-7":[4,12],"0-9":[4,12],"1-9":[4,12],"2-9":[4,12],"11-14":[4,12],"12-14":[4,12],"13-14":[4,12],"14-14":[4,12],"6-2":[2,15],"6-3":[0,13],"7-3":[3,12],"8-3":[0,14],"9-3":[1,16],"10-3":[1,15],"11-3":[4,15],"4-2":[4,14],"5-2":[0,12],"4-1":[0,13],"3-1":[3,14],"1-1":[1,16],"2-1":[0,14],"11-1":[4,2],"12-1":[4,2],"13-1":[5,2],"11-0":[4,0],"12-0":[4,0],"13-0":[5,0],"10-1":[4,2],"9-1":[3,2],"10-0":[4,0],"9-0":[3,0],"9-2":[4,12],"10-2":[4,12],"11-2":[4,12],"12-2":[4,12],"13-2":[4,12],"5-13":[4,13],"9-13":[5,13],"6-13":[4,11],"7-13":[4,11],"8-13":[4,11],"0-14":[4,11],"1-14":[4,11],"2-14":[5,13]}]);
    const [layers, setLayers] = useState(defaultLayers);
    const [modalInfo, setModalInfo] = useState(null);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [zoomLevel, setZoomLevel] = useState(2); // Default zoom level
    const [maxBounds, setMaxBounds] = useState({ x: GRID_SIZE, y: GRID_SIZE });
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });
    const [hoveredTile, setHoveredTile] = useState(null);
    const [tooltip, setTooltip] = useState(null);
    const [canvasId] = useState('main-canvas'); // Add unique ID for the canvas
    const [actions, setActions] = useState({}); // Store tile actions
    const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
    const [animatingMoves, setAnimatingMoves] = useState([]);
    const [keysPressed, setKeysPressed] = useState({});
    const [sprites, setSprites] = useState([
        {
            name: 'Player',
            width: 48,
            height: 48,
            color: '#ff0000',
            position: { x: 0, y: 0 },
            isBounded: true,
            state: 'idle',
            currentFrame: 0,
            animations: {
                idle: {
                    frames: [0, 1, 2, 3],
                    speed: 10,
                    sheet: null // Initially null, will be set after image loads
                },
                walk: {
                    frames: [4, 5, 6, 7],
                    speed: 10,
                    sheet: null // Initially null, will be set after image loads
                }
            }
        }
    ]);

    useEffect(() => {
        const handleResize = () => {
            const width = document.documentElement.clientWidth;
            const height = document.documentElement.clientHeight;
            setCanvasSize({ width, height });
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const loadCanvasData = async () => {
            try {
                const data = await retrieveCanvas(canvasId);
                if (data) {
                    setLayers(data.layers || defaultLayers);
                    setActions(data.actions || {});
                }
            } catch (error) {
                console.error('Error loading canvas:', error);
            }
        };

        loadCanvasData();
    }, [canvasId]);

    const handleActionSave = useCallback((tileKey, actionData) => {
        setActions(prev => {
            const newActions = { ...prev };
            if (actionData === null) {
                delete newActions[tileKey];
            } else {
                newActions[tileKey] = actionData;
            }
            return newActions;
        });
    }, []);
    const getTileFromCoords = (x, y, layers) => {
        // Convert canvas coordinates to tile coordinates
        const tileX = Math.floor(x / TILE_SIZE);
        const tileY = Math.floor(y / TILE_SIZE);
        const tileKey = `${tileX}-${tileY}`;
    
        // Check if the tile exists in any layer
        for (const layer of layers) {
            if (layer[tileKey]) {
                return { tileKey, layer, tileData: layer[tileKey] };
            }
        }
    
        // Return null if no matching tile is found
        return null;
    };
    const handleKeyPress = useCallback((e) => {
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT') {
            return;
        }

        const keyCode = e.key;

        // Handle tile movement first
        const matchedEntries = Object.entries(actions).filter(([tileKey, actionList]) => {
            return actionList.some(a => a.action === 'OnKeyPress' && a.fields.keyCode === keyCode);
        });

        matchedEntries.forEach(([tileKey, actionList]) => {
            const matchedActions = actionList.filter(
                a => a.action === 'OnKeyPress' && a.fields.keyCode === keyCode
            );

            matchedActions.forEach(matchedAction => {
                if (matchedAction.option === 'move') {
                    const { direction } = matchedAction.fields;

                    setLayers(prevLayers => {
                        const newLayers = [...prevLayers];
                        const [x, y] = tileKey.split('-').map(Number);
                        const newX = direction === 'left' ? x - 1 : direction === 'right' ? x + 1 : x;
                        const newY = direction === 'up' ? y - 1 : direction === 'down' ? y + 1 : y;

                        if (newX < 0 || newY < 0) return newLayers;
                        const newTileKey = `${newX}-${newY}`;
                        newLayers.forEach(layer => {
                            if (layer[tileKey]) {
                                layer[newTileKey] = layer[tileKey];
                                delete layer[tileKey];
                            }
                        });

                        // Move associated actions to the new tile
                        setActions(prevActions => {
                            const newActions = { ...prevActions };
                            if (newActions[tileKey]) {
                                newActions[newTileKey] = newActions[tileKey];
                                delete newActions[tileKey];
                            }
                            return newActions;
                        });

                        return newLayers;
                    });
                }
            });
        });
    }, [actions]);

    const draw = useCallback(() => {
        if (!ctx || !tilesetImageRef.current) return;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.save();
        
        // Draw tiles with pan and zoom
        ctx.translate(panOffset.x, panOffset.y);
        ctx.scale(zoomLevel, zoomLevel);

        ctx.beginPath();
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2 / zoomLevel;

        ctx.moveTo(0, 0);
        ctx.lineTo(0, TILE_SIZE * GRID_SIZE);
        ctx.moveTo(0, 0);
        ctx.lineTo(TILE_SIZE * GRID_SIZE, 0);
        ctx.stroke();

        if (maxBounds.x > GRID_SIZE || maxBounds.y > GRID_SIZE) {
            ctx.beginPath();
            ctx.strokeStyle = '#666';
            ctx.setLineDash([5 / zoomLevel]);

            ctx.moveTo(0, TILE_SIZE * GRID_SIZE);
            ctx.lineTo(0, TILE_SIZE * maxBounds.y);

            ctx.moveTo(TILE_SIZE * GRID_SIZE, 0);
            ctx.lineTo(TILE_SIZE * maxBounds.x, 0);

            ctx.stroke();
            ctx.setLineDash([]);
        }

        const size_of_crop = 32;

        layers.forEach((layer, layerIndex) => {
            Object.keys(layer).forEach((key) => {
                if (animatingMoves.some(move =>
                    move.fromKey === key && move.affectedLayers.includes(layerIndex)
                )) return;

                const positionX = Number(key.split("-")[0]);
                const positionY = Number(key.split("-")[1]);
                const [tilesheetX, tilesheetY] = layer[key];

                ctx.drawImage(
                    tilesetImageRef.current, //image reference
                    tilesheetX * 32, // tilesheet X position
                    tilesheetY * 32, // tilesheet Y position
                    size_of_crop, // width of the crop
                    size_of_crop, // height of the crop
                    positionX * 32, // position X in the canvas
                    positionY * 32, // position Y in the canvas
                    size_of_crop, // width of the crop in the canvas
                    size_of_crop // height of the crop in the canvas
                );
            });
        });

        animatingMoves.forEach(move => {
            layers.forEach((layer, layerIndex) => {
                if (!move.affectedLayers.includes(layerIndex)) return;
                const tileData = layer[move.fromKey];
                if (!tileData) return;

                const [tilesheetX, tilesheetY] = tileData;
                ctx.drawImage(
                    tilesetImageRef.current,
                    tilesheetX * 32,
                    tilesheetY * 32,
                    size_of_crop,
                    size_of_crop,
                    move.currentX * 32,
                    move.currentY * 32,
                    size_of_crop,
                    size_of_crop
                );
            });
        });

        if (hoveredTile) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 / zoomLevel;
            ctx.globalAlpha = 0.5;
            ctx.strokeRect(
                hoveredTile.x * TILE_SIZE,
                hoveredTile.y * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
            );

            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.2;
            ctx.fillRect(
                hoveredTile.x * TILE_SIZE,
                hoveredTile.y * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
            );
            ctx.globalAlpha = 1.0;
        }

        if (tooltip) {
            ctx.save();
            ctx.resetTransform();
            ctx.font = 'bold 16px "Press Start 2P", system-ui';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#000000';

            const metrics = ctx.measureText(tooltip);
            const padding = 10;
            const tooltipWidth = metrics.width + padding * 2;
            const tooltipHeight = 24 + padding * 2;
            const tooltipX = canvasRef.current.width / 2 - tooltipWidth / 2;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(tooltipX, 10, tooltipWidth, tooltipHeight);
            ctx.strokeStyle = '#000000';
            ctx.strokeRect(tooltipX, 10, tooltipWidth, tooltipHeight);

            ctx.fillStyle = '#000000';
            ctx.fillText(tooltip, canvasRef.current.width / 2, 30); //text rendering
            ctx.restore();
        }

        // Reset transform before drawing sprites
        ctx.restore();
        ctx.save();

        // Draw sprites in screen space without pan/zoom effects
        sprites.forEach(sprite => {
            const screenX = (sprite.position.x * zoomLevel) + panOffset.x;
            const screenY = (sprite.position.y * zoomLevel) + panOffset.y;
            const currentFrame = sprite.currentFrame % sprite.currentFrame;
            // Ensure the animation sheet is valid
            if (!sprite.animations[sprite.state].sheet || !(sprite.animations[sprite.state].sheet instanceof HTMLImageElement)) {
                console.error('Invalid image source for sprite:', sprite.animations[sprite.state].sheet);
                return;
            }
        
            // Ensure the animation state is valid
            if (!sprite.animations[sprite.state]) {
                console.error(`Invalid animation state: ${sprite.state}`);
                return;
            }
            // setFrameCount(prev => (prev + 1) % sprite.animations[sprite.state].speed);
            // sprite.currentFrame = (sprite.currentFrame + 1) % sprite.animations[sprite.state].frames.length;
            // // Draw the sprite using its current animation frame
            // if (frameCount % sprite.animations[sprite.state].speed !== 0) return; // Skip frames based on speed
            ctx.drawImage(
                sprite.animations[sprite.state].sheet, // Use the sprite's current animation sheet
                sprite.animations[sprite.state].frames[sprite.currentFrame] * sprite.width, // X position in the sprite sheet
                0, // Y position in the sprite sheet (assuming single row for simplicity)
                sprite.width, // Width of the sprite in the sprite sheet
                sprite.height, // Height of the sprite in the sprite sheet
                Math.round(screenX), // X position on the canvas (rounded for pixel alignment)
                Math.round(screenY), // Y position on the canvas (rounded for pixel alignment)
                100 *  zoomLevel,// Width on the canvas (scaled and rounded)
                100 * zoomLevel   // Height on the canvas (scaled and rounded)
            );
        });
        
        ctx.restore();
    }, [ctx, layers, zoomLevel, panOffset, hoveredTile, tooltip, animatingMoves, sprites]);

    useEffect(() => {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                setCtx(context);
            }
        }
    }, []);

    useEffect(() => {
        const tilesetImage = new Image();
        const spriteImage = new Image();
        
        tilesetImage.crossOrigin = "anonymous";
        spriteImage.crossOrigin = "anonymous";

        const loadImages = async () => {
            try {
                // Load tileset
                await new Promise((resolve, reject) => {
                    tilesetImage.onload = resolve;
                    tilesetImage.onerror = reject;
                    tilesetImage.src = "https://assets.codepen.io/21542/TileEditorSpritesheet.2x_2.png";
                });
                tilesetImageRef.current = tilesetImage;

                // Load sprite sheet
                await new Promise((resolve, reject) => {
                    spriteImage.onload = resolve;
                    spriteImage.onerror = reject;
                    spriteImage.src = cMovesImg;
                });
                spriteImageRef.current = spriteImage;

                // Update sprites with loaded image
                setSprites(prevSprites => prevSprites.map(sprite => ({
                    ...sprite,
                    animations: {
                        idle: {
                            ...sprite.animations.idle,
                            sheet: spriteImage
                        },
                        walk: {
                            ...sprite.animations.walk,
                            sheet: spriteImage
                        }
                    }
                })));

                if (ctx) {
                    draw();
                }
            } catch (error) {
                console.error('Error loading images:', error);
            }
        };

        loadImages();

        return () => {
            tilesetImage.onload = null;
            tilesetImage.onerror = null;
            spriteImage.onload = null;
            spriteImage.onerror = null;
        };
    }, [ctx]);

    useEffect(() => {
        if (ctx && tilesetImageRef.current) {
            draw();
        }
    }, [ctx, draw]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [zoomLevel, panOffset]);

    const getTileCoords = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = (mouseX - panOffset.x) / zoomLevel;
        const worldY = (mouseY - panOffset.y) / zoomLevel;

        const tileX = Math.floor(worldX / TILE_SIZE);
        const tileY = Math.floor(worldY / TILE_SIZE);

        return { tileX, tileY };
    };

    const handleMouseDown = (e) => {
        if (e.button === 1) {
            e.preventDefault();
            setIsPanning(true);
            setLastPanPosition({ x: e.clientX, y: e.clientY });
            return;
        }

        if (e.button === 0) {
            const { tileX, tileY } = getTileCoords(e);
            const tileKey = `${tileX}-${tileY}`;

            const tileActions = actions[tileKey];
            if (Array.isArray(tileActions)) {
                const clickActions = tileActions.filter(a => a.action === 'OnClick');
                clickActions.forEach(action => {
                    actionsFactory(action.action, action.fields, action.option);
                });
            }
        }
    };

    const handleMouseMove = (e) => {
        if (isPanning) {
            const deltaX = e.clientX - lastPanPosition.x;
            const deltaY = e.clientY - lastPanPosition.y;

            setPanOffset(prev => ({
                x: prev.x + deltaX,
                y: prev.y + deltaY
            }));

            setLastPanPosition({ x: e.clientX, y: e.clientY });
            draw();
            return;
        }

        const { tileX, tileY } = getTileCoords(e);
        setHoveredTile({ x: tileX, y: tileY });

        const tileKey = `${tileX}-${tileY}`;
        const tileActions = actions[tileKey];
        if (Array.isArray(tileActions)) {
            const hoverActions = tileActions.filter(a => a.action === 'OnHover');
            hoverActions.forEach(action => {
                if (action.option === 'showTooltip') {
                    setTooltip(action.fields.tooltipText);
                }
                actionsFactory(action.action, action.fields, action.option);
            });
            if (hoverActions.length === 0) {
                setTooltip(null);
            }
        } else {
            setTooltip(null);
        }

        draw();
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        const { tileX, tileY } = getTileCoords(e);
        const tileKey = `${tileX}-${tileY}`;

        const tilesAtPosition = layers.map((layer, index) => {
            const tileData = layer[tileKey];
            return tileData ? { layer: index, data: tileData } : null;
        }).filter(tile => tile !== null);

        setModalInfo({
            position: { x: tileX, y: tileY },
            screenPosition: { x: e.clientX, y: e.clientY },
            tiles: tilesAtPosition
        });
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalInfo &&
                !e.target.closest('.modal-content') &&
                (e.target === canvasRef.current || !e.target.closest('canvas'))
            ) {
                setModalInfo(null);
            }
        };

        if (modalInfo) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [modalInfo]);

    const stopPanning = () => {
        if (isPanning) {
            setIsPanning(false);
            setIsMouseDown(false);
            draw();
        }
    };

    // const handleMouseLeave = () => {
    //     setIsMouseDown(false);
    //     stopPanning();
    //     setHoveredTile(null);
    //     setTooltip(null);
    //     draw();
    // };

    const handleWheel = (e) => {
        e.preventDefault();
        const zoomSpeed = 0.1;
        const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
        const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta));

        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const oldWorldX = (mouseX - panOffset.x) / zoomLevel;
        const oldWorldY = (mouseY - panOffset.y) / zoomLevel;

        const newWorldX = (mouseX - panOffset.x) / newZoom;
        const newWorldY = (mouseY - panOffset.y) / newZoom;

        setPanOffset(prev => ({
            x: prev.x + (newWorldX - oldWorldX) * newZoom,
            y: prev.y + (newWorldY - oldWorldY) * newZoom
        }));

        setZoomLevel(newZoom);

        if (newZoom === 2) {
            setPanOffset({ x: 0, y: 0 });
        }

        draw();
    };

    useEffect(() => {
        if (actions && Object.keys(actions).length > 0) {
            const saveData = async () => {
                try {
                    await saveCanvas(canvasId, layers, actions);
                } catch (error) {
                    console.error('Error saving canvas:', error);
                }
            };

            saveData();
        }
    }, [actions, layers, canvasId]);

    const getAppsList = useCallback(async () => {
        try {
            const appsData = await getApps();
            return appsData.apps.map(app => ({
                value: app.name,
                label: app.name.charAt(0).toUpperCase() + app.name.slice(1).replace(/_/g, ' ')
            }));
        } catch (error) {
            console.error('Failed to load apps:', error);
            return [];
        }
    }, []);

    useEffect(() => {
        actionsRef.current = actions;
    }, [actions]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = document.activeElement.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            setKeysPressed(prev => ({ ...prev, [e.key]: true }));
        };
    
        const handleKeyUp = (e) => {
            setKeysPressed(prev => {
                const next = { ...prev };
                delete next[e.key];
                return next;
            });
        };
    
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);
    useSmoothSpriteMovement({
        keysPressed,
        setSprites,
        getTileFromCoords,
        layers,
        spriteName: 'Player',
        speed: 4
      });
    return (
        <div className="flex">
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="bg-blue-500"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={stopPanning}
                onMouseLeave={stopPanning}
                onContextMenu={handleContextMenu}
                style={{ cursor: isPanning ? 'grabbing' : 'default' }}
            />
            {modalInfo && (
                <TileModal
                    position={modalInfo.position}
                    screenPosition={modalInfo.screenPosition}
                    selectedTileInfo={modalInfo}
                    onClose={() => setModalInfo(null)}
                    getAppsList={getAppsList}
                    onActionSave={handleActionSave}
                    currentAction={actions[`${modalInfo.position.x}-${modalInfo.position.y}`]}
                    canvasId={canvasId}
                    layers={layers}
                    allActions={actions}
                />
            )}
            <div className="fixed top-12 right-6 bg-white rounded-2xl p-2">
                <Link to={"/settings"}><Settings color='black'/></Link>
            </div>
        </div>
    );
};

export default DesktopCanvas;