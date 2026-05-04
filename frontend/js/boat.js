import { scene } from './scene.js';

export class Boat {
  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(-5, 0.4, 0);
    this.group.rotation.y = -Math.PI / 2; // faces +X toward islands

    this._speed    = 0;
    this.MAX_SPEED = 0.13;
    this.ACCEL     = 0.006;
    this.DRAG      = 0.91;
    this.TURN      = 0.034;

    this._build();
    scene.add(this.group);
  }

  _build() {
    // ── Hull ────────────────────────────────────────────────────────────────
    const darkWood = new THREE.MeshStandardMaterial({ color: 0x5a2a08, roughness: 0.9 });
    const wood     = new THREE.MeshStandardMaterial({ color: 0x7a3c12, roughness: 0.8 });
    const deck     = new THREE.MeshStandardMaterial({ color: 0xc8954a, roughness: 0.85 });
    const white    = new THREE.MeshStandardMaterial({ color: 0xeeeedd });
    const red      = new THREE.MeshStandardMaterial({ color: 0xcc2222 });

    // Keel
    const keel = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 4.4), darkWood);
    keel.position.y = -0.46;
    this.group.add(keel);

    // Main hull body
    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.72, 4.0), wood);
    hull.position.y = -0.06;
    this.group.add(hull);

    // Hull white stripe
    const stripeGeo = new THREE.BoxGeometry(0.05, 0.14, 4.02);
    [-1.15, 1.15].forEach(x => {
      const stripe = new THREE.Mesh(stripeGeo, white);
      stripe.position.set(x, 0.16, 0);
      this.group.add(stripe);
    });

    // Deck surface
    const deckMesh = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.06, 3.9), deck);
    deckMesh.position.y = 0.36;
    this.group.add(deckMesh);

    // Deck planks (visual lines)
    const plankM = new THREE.MeshStandardMaterial({ color: 0xa87038, roughness: 0.9 });
    for (let i = -3; i <= 3; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(2.16, 0.015, 0.04), plankM);
      plank.position.set(0, 0.395, i * 0.52);
      this.group.add(plank);
    }

    // ── Railing ──────────────────────────────────────────────────────────────
    const postM = new THREE.MeshStandardMaterial({ color: 0xf0e0b8, roughness: 0.6 });
    const postGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.48, 4);
    const railGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.48, 4);

    // Side rail posts
    [[-1.08, -1.7], [-1.08, -0.6], [-1.08, 0.5], [-1.08, 1.6],
     [ 1.08, -1.7], [ 1.08, -0.6], [ 1.08, 0.5], [ 1.08, 1.6]].forEach(([x, z]) => {
      const post = new THREE.Mesh(postGeo, postM);
      post.position.set(x, 0.64, z);
      this.group.add(post);
    });

    // Horizontal rails
    const hRailGeo = new THREE.CylinderGeometry(0.014, 0.014, 3.5, 4);
    hRailGeo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    [-1.08, 1.08].forEach(x => {
      const rail = new THREE.Mesh(hRailGeo, postM);
      rail.position.set(x, 0.82, -0.05);
      this.group.add(rail);
    });

    // Bow rail (front cross piece)
    const bowRailGeo = new THREE.CylinderGeometry(0.014, 0.014, 2.18, 4);
    bowRailGeo.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    const bowRail = new THREE.Mesh(bowRailGeo, postM);
    bowRail.position.set(0, 0.82, -1.75);
    this.group.add(bowRail);

    // ── Cabin ────────────────────────────────────────────────────────────────
    const cabinM = new THREE.MeshStandardMaterial({ color: 0xf2deba, roughness: 0.55 });
    const cabin  = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.94, 1.7), cabinM);
    cabin.position.set(0, 0.84, 0.45);
    this.group.add(cabin);

    // Cabin roof (red)
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.46, 0.08, 1.82), red);
    roof.position.set(0, 1.35, 0.45);
    this.group.add(roof);

    // Windows
    const winM = new THREE.MeshStandardMaterial({ color: 0x334466, roughness: 0.05, metalness: 0.6 });
    [[-0.35, 0.42], [0.35, 0.42]].forEach(([x, z]) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.02), winM);
      win.position.set(x, 0.88, z - 0.86);
      this.group.add(win);
    });
    // Side window
    const sideWin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.26, 0.55), winM);
    sideWin.position.set(-0.68, 0.88, 0.45);
    this.group.add(sideWin);

    // Door frame
    const doorM = new THREE.MeshStandardMaterial({ color: 0x7a4a1a });
    const door  = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.58, 0.02), doorM);
    door.position.set(0, 0.68, 1.36);
    this.group.add(door);

    // ── Mast & Rigging ───────────────────────────────────────────────────────
    const mastM = new THREE.MeshStandardMaterial({ color: 0x5c3a1a });
    const mast  = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.065, 5.2, 6), mastM);
    mast.position.set(0, 2.96, -0.7);
    this.group.add(mast);

    // Boom (horizontal arm at base of sail)
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 1.9, 5), mastM);
    boom.rotation.z = Math.PI / 2;
    boom.position.set(0.95, 1.6, -0.7);
    this.group.add(boom);

    // Gaff (upper spar)
    const gaff = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.6, 5), mastM);
    gaff.rotation.z = Math.PI / 2;
    gaff.position.set(0.8, 4.8, -0.7);
    this.group.add(gaff);

    // Main sail
    const sailM = new THREE.MeshStandardMaterial({
      color: 0xfff5e0,
      side: THREE.DoubleSide,
      roughness: 0.85,
    });
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 3.3), sailM);
    sail.position.set(0.95, 3.18, -0.7);
    sail.rotation.y = Math.PI / 2;
    this.group.add(sail);

    // Flag
    const flagM = new THREE.MeshStandardMaterial({ color: 0xdd2222, side: THREE.DoubleSide });
    const flag  = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), flagM);
    flag.position.set(0.26, 5.68, -0.7);
    flag.rotation.y = Math.PI / 2;
    this.group.add(flag);
    this._flag = flag;

    // ── Details ──────────────────────────────────────────────────────────────
    // Life ring
    const lifeM = new THREE.MeshStandardMaterial({ color: 0xff6600 });
    const life  = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.065, 6, 12), lifeM);
    life.rotation.y = Math.PI / 2;
    life.position.set(-1.1, 0.62, -0.7);
    this.group.add(life);

    // Port light (red = left)
    const portL = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 6, 4),
      new THREE.MeshBasicMaterial({ color: 0xff2222 })
    );
    portL.position.set(-1.12, 0.55, -1.85);
    this.group.add(portL);

    // Starboard light (green = right)
    const stbL = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 6, 4),
      new THREE.MeshBasicMaterial({ color: 0x22ee22 })
    );
    stbL.position.set(1.12, 0.55, -1.85);
    this.group.add(stbL);

    // Anchor (decorative)
    const anchorM = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5, metalness: 0.7 });
    const anchorShank = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.45, 5), anchorM);
    anchorShank.position.set(0.9, 0.62, 1.5);
    this.group.add(anchorShank);
    const anchorBar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.36, 5), anchorM);
    anchorBar.rotation.z = Math.PI / 2;
    anchorBar.position.set(0.9, 0.82, 1.5);
    this.group.add(anchorBar);

    // Wake plane (opacity driven by speed)
    const wakeM = new THREE.MeshBasicMaterial({
      color: 0xaaddff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    this._wake = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 7), wakeM);
    this._wake.rotation.x = -Math.PI / 2;
    this._wake.position.set(0, -0.3, 4.5); // behind stern (positive local Z)
    this.group.add(this._wake);
  }

  update(keys, t) {
    if (keys['ArrowUp'])    this._speed = Math.min(this._speed + this.ACCEL,  this.MAX_SPEED);
    if (keys['ArrowDown'])  this._speed = Math.max(this._speed - this.ACCEL, -this.MAX_SPEED * 0.5);
    if (keys['ArrowLeft'])  this.group.rotation.y += this.TURN;
    if (keys['ArrowRight']) this.group.rotation.y -= this.TURN;
    this._speed *= this.DRAG;

    const sin = Math.sin(this.group.rotation.y);
    const cos = Math.cos(this.group.rotation.y);
    this.group.position.x -= sin * this._speed;
    this.group.position.z -= cos * this._speed;
    this.group.position.y  = 0.4 + Math.sin(t * 1.3) * 0.07; // gentle bob

    // Wake opacity tracks speed
    this._wake.material.opacity = Math.min(0.45, Math.abs(this._speed) * 4.5);

    // Flag waves
    if (this._flag) this._flag.rotation.z = Math.sin(t * 3) * 0.15;
  }

  get position() { return this.group.position; }
  get rotation() { return this.group.rotation; }
}
