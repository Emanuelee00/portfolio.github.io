import { scene } from './scene.js';
import { SURFACE_Y, ISLAND_RADIUS } from './island.js';

export class Character {
  constructor() {
    this.group = new THREE.Group();
    this.group.visible = false;

    this._islandPos = new THREE.Vector3();

    const skinM  = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
    const shirtM = new THREE.MeshStandardMaterial({ color: 0x2244cc });
    const pantsM = new THREE.MeshStandardMaterial({ color: 0x334466 });
    const shoeM  = new THREE.MeshStandardMaterial({ color: 0x221100 });
    const hairM  = new THREE.MeshStandardMaterial({ color: 0x331100 });

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 8), skinM);
    head.position.y = 1.24;
    this.group.add(head);

    // Hair
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.195, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), hairM);
    hair.position.y = 1.28;
    this.group.add(hair);

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.46, 0.22), shirtM);
    torso.position.y = 0.79;
    this.group.add(torso);

    // Belt
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.24), new THREE.MeshStandardMaterial({ color: 0x442200 }));
    belt.position.y = 0.57;
    this.group.add(belt);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.075, 0.07, 0.46, 6);
    this._legL = new THREE.Mesh(legGeo, pantsM);
    this._legL.position.set(-0.1, 0.33, 0);
    this.group.add(this._legL);

    this._legR = new THREE.Mesh(legGeo, pantsM);
    this._legR.position.set(0.1, 0.33, 0);
    this.group.add(this._legR);

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.12, 0.08, 0.18);
    const shoeL = new THREE.Mesh(shoeGeo, shoeM);
    shoeL.position.set(-0.1, 0.09, 0.03);
    this.group.add(shoeL);
    const shoeR = new THREE.Mesh(shoeGeo, shoeM);
    shoeR.position.set(0.1, 0.09, 0.03);
    this.group.add(shoeR);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.4, 6);
    this._armL = new THREE.Mesh(armGeo, skinM);
    this._armL.position.set(-0.26, 0.78, 0);
    this.group.add(this._armL);

    this._armR = new THREE.Mesh(armGeo, skinM);
    this._armR.position.set(0.26, 0.78, 0);
    this.group.add(this._armR);

    scene.add(this.group);
  }

  // Place character on island shore, facing inward.
  show(islandPos, toIsland) {
    this._islandPos.copy(islandPos);
    this.group.position.set(
      islandPos.x - toIsland.x * 7,
      SURFACE_Y + 0.06,
      islandPos.z - toIsland.z * 7
    );
    this.group.rotation.y = Math.atan2(toIsland.x, toIsland.z);
    this.group.visible = true;
  }

  hide() { this.group.visible = false; }

  update(keys, t) {
    let mx = 0, mz = 0;
    if (keys['ArrowUp'])    mz = -1;
    if (keys['ArrowDown'])  mz =  1;
    if (keys['ArrowLeft'])  mx = -1;
    if (keys['ArrowRight']) mx =  1;

    const moving = mx !== 0 || mz !== 0;

    if (moving) {
      this.group.rotation.y = Math.atan2(mx, -mz);
      const nx = this.group.position.x + mx * 0.07;
      const nz = this.group.position.z + mz * 0.07;
      const dx = nx - this._islandPos.x;
      const dz = nz - this._islandPos.z;
      if (dx * dx + dz * dz < ISLAND_RADIUS * ISLAND_RADIUS) {
        this.group.position.x = nx;
        this.group.position.z = nz;
      }
    }

    this.group.position.y = SURFACE_Y + (moving ? Math.abs(Math.sin(t * 8)) * 0.04 : 0);

    const sw = moving ? Math.sin(t * 8) * 0.38 : 0;
    this._legL.rotation.x =  sw;
    this._legR.rotation.x = -sw;
    this._armL.rotation.x = -sw * 0.6;
    this._armR.rotation.x =  sw * 0.6;
  }

  get position() { return this.group.position; }
}
