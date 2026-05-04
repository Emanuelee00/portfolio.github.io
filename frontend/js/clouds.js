import { scene } from './scene.js';

const PUFFS = [
  [0,    0,    0,    1.9],
  [1.7,  0.3,  0.2,  1.5],
  [-1.6, 0.2,  0,    1.4],
  [0.6,  0.9,  0.4,  1.2],
  [-0.8, 0.7, -0.3,  1.1],
];

export class Clouds {
  constructor() {
    this._clouds = [];
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });

    for (let i = 0; i < 14; i++) {
      const group = new THREE.Group();
      PUFFS.forEach(([x, y, z, r]) => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 5), mat);
        puff.position.set(x, y, z);
        group.add(puff);
      });
      group.position.set(
        (Math.random() - 0.5) * 130,
        18 + Math.random() * 10,
        (Math.random() - 0.5) * 130
      );
      group.rotation.y = Math.random() * Math.PI * 2;
      group.scale.setScalar(0.8 + Math.random() * 0.6);
      this._clouds.push({ mesh: group, speed: 0.012 + Math.random() * 0.016 });
      scene.add(group);
    }
  }

  update() {
    this._clouds.forEach(({ mesh, speed }) => {
      mesh.position.x += speed;
      if (mesh.position.x > 90) mesh.position.x = -90;
    });
  }
}
