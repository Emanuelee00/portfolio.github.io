import { scene } from './scene.js';

export const DOCK_RANGE    = 14;
export const SURFACE_Y     = 1.5;
export const ISLAND_RADIUS = 7.5;

function makeBoardTex(name) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 340;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#1c1008';
  ctx.fillRect(0, 0, 256, 340);

  // Stone grain lines
  ctx.strokeStyle = '#261508';
  ctx.lineWidth = 1;
  for (let y = 0; y < 340; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
  }

  // Border
  ctx.strokeStyle = '#7a4822';
  ctx.lineWidth = 5;
  ctx.strokeRect(7, 7, 242, 326);
  ctx.strokeStyle = '#4a2812';
  ctx.lineWidth = 2;
  ctx.strokeRect(13, 13, 230, 314);

  // C badge
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#dd7700';
  ctx.textAlign = 'center';
  ctx.fillText('[ C ]', 128, 44);

  ctx.strokeStyle = '#7a4416';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(28, 58); ctx.lineTo(228, 58); ctx.stroke();

  // Project name
  ctx.font = 'bold 34px monospace';
  ctx.fillStyle = '#ffd040';
  ctx.fillText(name, 128, 98);

  ctx.beginPath(); ctx.moveTo(28, 116); ctx.lineTo(228, 116); ctx.stroke();

  // Rune decoration
  ctx.font = '13px monospace';
  ctx.fillStyle = '#7a4416';
  ['▒▓░▒▓', '░▒▓░▒', '▓░▒▓░', '▒▓░▒▓'].forEach((r, i) =>
    ctx.fillText(r, 128, 144 + i * 24)
  );

  return new THREE.CanvasTexture(c);
}

export class Island {
  constructor(config) {
    this._cfg    = config;
    this._label  = config.label;
    this.boards  = [];

    this.group = new THREE.Group();
    this.group.position.set(...config.position);

    this._buildTerrain();
    this._buildBoards();
    scene.add(this.group);
  }

  get position() { return this.group.position; }
  get label()    { return this._label; }

  _buildTerrain() {
    const { grassColor, hillColor, beachColor } = this._cfg;

    // Beach
    const beach = new THREE.Mesh(
      new THREE.CylinderGeometry(10, 11.5, 2.2, 16),
      new THREE.MeshStandardMaterial({ color: beachColor, roughness: 1 })
    );
    beach.position.y = -0.8;
    this.group.add(beach);

    // Underwater skirt (darker)
    const skirt = new THREE.Mesh(
      new THREE.CylinderGeometry(11, 13, 2, 12),
      new THREE.MeshStandardMaterial({ color: 0x5a4020, roughness: 1 })
    );
    skirt.position.y = -2.0;
    this.group.add(skirt);

    // Grass layer
    const grass = new THREE.Mesh(
      new THREE.CylinderGeometry(7.5, 10, 1.6, 16),
      new THREE.MeshStandardMaterial({ color: grassColor, roughness: 0.85 })
    );
    grass.position.y = 0.6;
    this.group.add(grass);

    // Hill
    const hill = new THREE.Mesh(
      new THREE.ConeGeometry(5, 5.5, 12),
      new THREE.MeshStandardMaterial({ color: hillColor, roughness: 0.8 })
    );
    hill.position.y = 4.1;
    this.group.add(hill);

    // Scattered rocks on beach
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.4;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.25 + Math.random() * 0.2),
        new THREE.MeshStandardMaterial({ color: 0x8a7060, roughness: 1 })
      );
      rock.position.set(Math.cos(a) * 8.5, SURFACE_Y - 0.4, Math.sin(a) * 8.5);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      this.group.add(rock);
    }

    // Pier (facing west toward boat start)
    const pier = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.14, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x8b5e3c, roughness: 0.9 })
    );
    pier.position.set(-9.5, SURFACE_Y - 0.5, 0);
    this.group.add(pier);

    // Pier posts
    for (let i = 0; i < 3; i++) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 1.2, 5),
        new THREE.MeshStandardMaterial({ color: 0x6a4020 })
      );
      post.position.set(-8.0 - i * 1.3, SURFACE_Y - 1.0, 0);
      this.group.add(post);
    }

    // Palms
    this._addPalm(-5.5,  2.5,  0.18);
    this._addPalm( 4.5, -4.5, -0.15);
    this._addPalm(-2.5, -5.5,  0.22);
    this._addPalm( 5.5,  4.0, -0.12);
  }

  _addPalm(x, z, lean) {
    const h = 3.2;
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.17, h, 6),
      new THREE.MeshStandardMaterial({ color: 0x8b6914 })
    );
    trunk.position.set(x, SURFACE_Y + h / 2, z);
    trunk.rotation.z = lean;
    this.group.add(trunk);

    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(1.5, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x28900a, roughness: 0.6 })
    );
    crown.position.set(x + Math.sin(lean) * h, SURFACE_Y + h + 0.4, z);
    this.group.add(crown);

    // Coconuts
    for (let i = 0; i < 3; i++) {
      const nut = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 5, 4),
        new THREE.MeshStandardMaterial({ color: 0x5a3a10 })
      );
      const a = (i / 3) * Math.PI * 2;
      nut.position.set(
        x + Math.sin(lean) * h + Math.cos(a) * 0.3,
        SURFACE_Y + h + 0.1,
        z + Math.sin(a) * 0.3
      );
      this.group.add(nut);
    }
  }

  _buildBoards() {
    const stoneM = new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 1 });
    const sideM  = new THREE.MeshStandardMaterial({ color: 0x3a1a08 });

    this._cfg.projects.forEach((proj, i) => {
      const angle = (i / this._cfg.projects.length) * Math.PI * 2;
      const bx = Math.cos(angle) * 6.0;
      const bz = Math.sin(angle) * 6.0;

      // Pedestal
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 1.0, 6), stoneM);
      ped.position.set(bx, SURFACE_Y + 0.5, bz);
      this.group.add(ped);

      // Glowing base ring
      const ringM = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.35 });
      const ring  = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.04, 6, 20), ringM);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(bx, SURFACE_Y + 0.04, bz);
      this.group.add(ring);

      // Tablet
      const mats = [sideM, sideM, sideM, sideM,
        new THREE.MeshStandardMaterial({ map: makeBoardTex(proj.name) }),
        sideM,
      ];
      const tablet = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.3, 0.24), mats);
      tablet.position.set(bx, SURFACE_Y + 1.25, bz);

      // +Z front face points inward
      tablet.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(-bx, 0, -bz).normalize()
      );
      tablet.userData.proj = proj;
      this.group.add(tablet);
      this.boards.push(tablet);
    });
  }

  // Returns project of nearest board within `range`, or null.
  getNearestBoard(worldPos, range = 3.2) {
    const wp = new THREE.Vector3();
    let nearest = null, best = range;
    this.boards.forEach(b => {
      b.getWorldPosition(wp);
      const d = worldPos.distanceTo(wp);
      if (d < best) { best = d; nearest = b; }
    });
    return nearest ? nearest.userData.proj : null;
  }
}
