import { Body, Box, Vec3 } from "cannon";
import { BoxGeometry, Color, Mesh, MeshLambertMaterial } from "three";
import { scene, world } from "./canvas";

export let stack = [];
export const overhangs = [];
export const blockHeight = 1;
export const originalBoxSize = 3;

export const generateBox = (x, y, z, width, depth, falls) => {
  const geometry = new BoxGeometry(width, blockHeight, depth);
  const color = new Color(`hsl(${30 + stack.length * 4},100%,50%)`);
  const material = new MeshLambertMaterial({ color });
  const mesh = new Mesh(geometry, material);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  const shape = new Box(new Vec3(width / 2, blockHeight / 2, depth / 2));
  let mass = falls ? 5 : 0;
  const body = new Body({ mass, shape });
  body.position.set(x, y, z);
  world.add(body);

  return { threejs: mesh, cannonjs: body, width, depth };
};

export const addLayer = (x, z, width, depth, direction) => {
  const y = blockHeight * stack.length;
  const layer = generateBox(x, y, z, width, depth, false);
  layer.direction = direction;
  stack.push(layer);
};
export const addOverhang = (x, z, width, depth) => {
  const y = blockHeight * (stack.length - 1);
  const overhang = generateBox(x, y, z, width, depth, true);
  overhangs.push(overhang);
};
