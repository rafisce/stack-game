import {
  addLayer,
  threejsHeight,
  originalBoxSize,
  stack,
  addOverhang,
  blockHeight,
  overhangs,
} from "./stack";
import { camera, loadScene, renderer, scene, world } from "./canvas";
import { CylinderBufferGeometry } from "three";
import { Box, Vec3 } from "cannon";

let gameStarted = false;

export const init = (canvasRef) => {
  loadScene();

  renderer.render(scene, camera);

  canvasRef.current.appendChild(renderer.domElement);
};
export const gameLoop = () => {
  console.log("game loop");
  window.addEventListener("click", () => {
    if (!gameStarted) {
      renderer.setAnimationLoop(animation);
      gameStarted = true;
      console.log("game loop started");
    } else {
      const topLayer = stack[stack.length - 1];
      const previewsLayer = stack[stack.length - 2];
      const direction = topLayer.direction;
      const delta =
        topLayer.threejs.position[direction] -
        previewsLayer.threejs.position[direction];

      const overhangSize = Math.abs(delta);

      const size = direction === "x" ? topLayer.width : topLayer.depth;

      const overlap = size - overhangSize;

      if (overlap > 0) {
        const newWidth = direction === "x" ? overlap : topLayer.width;
        const newDepth = direction === "z" ? overlap : topLayer.depth;

        topLayer.width = newWidth;
        topLayer.depth = newDepth;

        topLayer.threejs.scale[direction] = overlap / size;
        topLayer.threejs.position[direction] -= delta / 2;

        topLayer.cannonjs.position[direction] -= delta / 2;

        const shape = new Box(
          new Vec3(newWidth / 2, blockHeight / 2, newDepth / 2)
        );
        topLayer.cannonjs.shapes = [];
        topLayer.cannonjs.addShape(shape);

        const overhangShift =
          (overlap / 2 + overhangSize / 2) * Math.sign(delta);
        const overhangX =
          direction === "x"
            ? topLayer.threejs.position.x + overhangShift
            : topLayer.threejs.position.x;
        const overhangZ =
          direction === "z"
            ? topLayer.threejs.position.z + overhangShift
            : topLayer.threejs.position.z;

        const overhangWidth = direction === "x" ? overhangSize : newWidth;
        const overhangDepth = direction === "z" ? overhangSize : newDepth;

        addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth);

        const nextX = direction === "x" ? topLayer.threejs.position.x : -10;
        const nextZ = direction === "z" ? topLayer.threejs.position.z : -10;
        const nextDirection = direction === "x" ? "z" : "x";
        addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);
      }
    }
  });
};

export const animation = () => {
  const speed = 0.15;
  const topLayer = stack[stack.length - 1];
  console.log(topLayer.threejs.position);
  console.log(stack.length - 1);
  topLayer.threejs.position[topLayer.direction] += speed;
  topLayer.cannonjs.position[topLayer.direction] += speed;
  if (camera.position.y < blockHeight * (stack.length - 2) + 4) {
    camera.position.y += speed;
  }

  updatePhysics();
  renderer.render(scene, camera);
};

export const updatePhysics = () => {
  world.step(1 / 60);

  overhangs.forEach((overhang) => {
    overhang.threejs.position.copy(overhang.cannonjs.position);
    overhang.threejs.quaternion.copy(overhang.cannonjs.quaternion);
  });
};

export const disposeGame = (canvasRef) => {
  canvasRef.current.firstChild &&
    canvasRef.current.removeChild(canvasRef.current.firstChild);
  renderer.dispose();
};
