import { useEffect, useRef } from 'react';
import { TILE_SIZE } from './constants';

const useSmoothSpriteMovement = ({ keysPressed, setSprites, getTileFromCoords, layers, spriteName = 'Player', speed = 4 }) => {
  const animationRef = useRef(null);

  useEffect(() => {
    const step = () => {
      setSprites(prevSprites => prevSprites.map(sprite => {
        if (sprite.name !== spriteName) return sprite;

        let newX = sprite.position.x;
        let newY = sprite.position.y;

        const pos = sprite.position;

        if (keysPressed['ArrowLeft']) {
          const testX = pos.x - speed;
          if (getTileFromCoords(testX, pos.y, layers) &&
              getTileFromCoords(testX - 1, pos.y + sprite.height - 1, layers)) {
            newX = testX;
          } else {
            const remainingPixels = pos.x % TILE_SIZE;
            newX = sprite.isBounded ? Math.max(0, pos.x - remainingPixels) : testX;
          }
        }

        if (keysPressed['ArrowRight']) {
          const testX = pos.x + speed;
          if (getTileFromCoords(testX + sprite.width - 1, pos.y, layers) &&
              getTileFromCoords(testX + sprite.width - 1, pos.y + sprite.height - 1, layers)) {
            newX = testX;
          } else {
            const remainingPixels = TILE_SIZE - (pos.x % TILE_SIZE);
            if (remainingPixels < sprite.width && sprite.isBounded) {
              newX = pos.x + remainingPixels;
            } else if (!sprite.isBounded) {
              newX = testX;
            }
          }
        }

        if (keysPressed['ArrowUp']) {
          const testY = pos.y - speed;
          if (getTileFromCoords(pos.x, testY, layers) &&
              getTileFromCoords(pos.x + sprite.width - 1, testY, layers)) {
            newY = testY;
          } else {
            const remainingPixels = pos.y % TILE_SIZE;
            newY = sprite.isBounded ? pos.y - remainingPixels : testY;
          }
        }

        if (keysPressed['ArrowDown']) {
          const testY = pos.y + speed;
          if (getTileFromCoords(pos.x, testY + sprite.height - 1, layers) &&
              getTileFromCoords(pos.x + sprite.width - 1, testY + sprite.height - 1, layers)) {
            newY = testY;
          } else {
            const remainingPixels = TILE_SIZE - (pos.y % TILE_SIZE);
            if (remainingPixels < sprite.height && sprite.isBounded) {
              newY = pos.y + remainingPixels;
            } else if (!sprite.isBounded) {
              newY = testY;
            }
          }
        }

        return {
          ...sprite,
          position: { x: newX, y: newY }
        };
      }));

      animationRef.current = requestAnimationFrame(step);
    };

    if (Object.keys(keysPressed).length > 0) {
      animationRef.current = requestAnimationFrame(step);
    } else {
      cancelAnimationFrame(animationRef.current);
    }

    return () => cancelAnimationFrame(animationRef.current);
  }, [keysPressed, setSprites, getTileFromCoords, layers, speed, spriteName]);
};

export default useSmoothSpriteMovement;
