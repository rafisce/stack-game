import {
  AmbientLight,
  DirectionalLight,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { NaiveBroadphase, World } from "cannon";
import { addLayer, originalBoxSize } from "./stack";

export let camera, scene, renderer;
export let selectiveBloom;
export let world;
export const loadScene = () => {
  console.log("load scene");

  world = new World();
  world.gravity.set(0, -10, 0);
  world.broadphase = new NaiveBroadphase();
  world.solver.iterations = 0;
  scene = new Scene();

  addLayer(0, 0, originalBoxSize, originalBoxSize);
  addLayer(-10, 0, originalBoxSize, originalBoxSize, "x");

  const ambientLight = new AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(10, 20, 0);
  scene.add(directionalLight);

  // scene.background = new Color(0x865b565);

  const width = 10;
  const canvasContainer = document.querySelector("#canvasContainer");
  const height =
    width * (canvasContainer.clientHeight / canvasContainer.clientWidth);
  camera = new OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    1,
    100
  );
  camera.position.set(4, 4, 4);
  camera.lookAt(0, 0, 0);

  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);

  return { camera, scene, renderer };
};
