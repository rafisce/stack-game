import { addLayer, stack, addOverhang, blockHeight, overhangs } from "./stack";
import { camera, loadScene, renderer, scene, world } from "./canvas";
import { Box, Vec3 } from "cannon";
import { bloomyFrame } from "./effects";

export let gameStarted = false;
export let gameEnded = false;
var frame = null;
var isFading = false;

export const init = (canvasRef) => {
  loadScene();
  renderer.render(scene, camera);
  canvasRef.current.appendChild(renderer.domElement);
};
export const gameLoop = () => {
  console.log("game loop");
  window.addEventListener("resize", resize);

  window.addEventListener("click", () => {
    if (gameEnded) {
      document.location.reload();
    }
    if (!gameStarted) {
      document.querySelector("#tap").style.display = "none";
      document.querySelector("#score").style.display = "flex";
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
        document.querySelector("#score").innerText = stack.length - 1;
        if (delta < 0 && Math.abs(delta) <= 0.35) {
          const nextX =
            direction === "x"
              ? stack[stack.length - 2].threejs.position.x
              : -10;
          const nextZ =
            direction === "z"
              ? stack[stack.length - 2].threejs.position.z
              : -10;
          const nextDirection = direction === "x" ? "z" : "x";

          console.log(
            "new: " +
              topLayer.threejs.position.x +
              " " +
              topLayer.threejs.position.z +
              "\npreviews: " +
              stack[stack.length - 2].threejs.position.x +
              " " +
              stack[stack.length - 2].threejs.position.z
          );
          addLayer(
            nextX,
            nextZ,
            topLayer.threejs.geometry.parameters.width,
            topLayer.threejs.geometry.parameters.depth,
            nextDirection
          );

          stack[stack.length - 2].threejs.position.z =
            stack[stack.length - 3].threejs.position.z;
          stack[stack.length - 2].threejs.position.x =
            stack[stack.length - 3].threejs.position.x;
          console.log("hit");
          frame = bloomyFrame(
            stack[stack.length - 2].threejs.position.x,
            stack[stack.length - 2].threejs.position.y,
            stack[stack.length - 2].threejs.position.z,
            stack[stack.length - 2].threejs.geometry.parameters.width + 0.4,
            stack[stack.length - 2].threejs.geometry.parameters.depth + 0.4
          );
          console.log(frame);
        } else {
          console.log("not hit");
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
      // else {
      //   newGame(topLayer);
      // }
    }
  });
};

export const animation = () => {
  const speed = 0.1;
  const topLayer = stack[stack.length - 1];
  topLayer.threejs.position[topLayer.direction] += speed;
  topLayer.cannonjs.position[topLayer.direction] += speed;
  if (camera.position.y < blockHeight * (stack.length - 2) + 4) {
    camera.position.y += speed;
  }

  updatePhysics();
  if (frame !== null && frame.material.opacity < 1 && !isFading) {
    frame.material.opacity += 0.25;
    if (frame.material.opacity >= 1) {
      isFading = true;
    }
  } else if (isFading) {
    frame.material.opacity -= 0.05;
    if (frame.material.opacity <= 0) {
      scene.remove(scene.getObjectByName("bloomy"));
      frame = null;
      isFading = false;
    }
  }

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
  console.log("dispose");
};

// function newGame(topLayer) {
//   setTimeout(function () {
//     document.querySelector("#tap").style.display = "flex";
//     document.querySelector("#score").style.color = "green";
//     gameEnded = true;
//   }, 1000);
// }
function resize() {
  const canvasContainer = document.querySelector("#canvasContainer");
  renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
}
