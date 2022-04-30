import { BoxGeometry, Color, Mesh, MeshLambertMaterial } from "three";
import { scene } from "./canvas";
import { stack } from "./stack";

export const bloomyFrame = (x, y, z, width, depth) => {
  const geometry = new BoxGeometry(width, 0.001, depth);

  const color = new Color(
    `hsl(${Math.floor(Math.random() * 361) + stack.length * 4},100%,50%)`
  );
  const material = new MeshLambertMaterial({ color, transparent: true });
  const mesh = new Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.material.opacity = 0;
  mesh.name = "bloomy";
  scene.add(mesh);
  return mesh;
};
