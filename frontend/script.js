'use strict';

const USERNAME = 'Emanuelee00';

// ── Scene ───────────────────────────────────────────────────────────────────
const SKY = new THREE.Color(0x87ceeb);
const scene = new THREE.Scene();
scene.background = SKY;
scene.fog = new THREE.Fog(SKY, 35, 110);

const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 200);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

// ── Lights ──────────────────────────────────────────────────────────────────
scene.add(new THREE.HemisphereLight(0x87ceeb, 0x2a6a2a, 1.0));
const sun = new THREE.DirectionalLight(0xfff5d0, 1.8);
sun.position.set(30, 50, 20);
scene.add(sun);

// ── Ocean ───────────────────────────────────────────────────────────────────
const oceanGeo = new THREE.PlaneGeometry(280, 280, 60, 60);
const oceanMat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 } },
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 p = position;
      p.z += sin(p.x * 0.12 + uTime * 0.9)  * 0.55
           + sin(p.y * 0.18 + uTime * 0.65) * 0.40
           + sin((p.x + p.y) * 0.07 + uTime * 1.1) * 0.22;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    void main() {
      float w = sin(vUv.x * 28.0 + uTime) * sin(vUv.y * 20.0 + uTime * 0.85) * 0.5 + 0.5;
      vec3 deep    = vec3(0.02, 0.09, 0.22);
      vec3 shallow = vec3(0.07, 0.34, 0.55);
      gl_FragColor = vec4(mix(deep, shallow, w * 0.42), 1.0);
    }
  `,
});
const ocean = new THREE.Mesh(oceanGeo, oceanMat);
ocean.rotation.x = -Math.PI / 2;
scene.add(ocean);

// ── Island ──────────────────────────────────────────────────────────────────
const ISLAND_POS   = new THREE.Vector3(40, 0, 0);
const SURFACE_Y    = 1.5;   // world Y of walkable terrain
const ISLAND_RADIUS = 7.5;  // walkable XZ radius
const DOCK_RANGE   = 14;

const islandGroup = new THREE.Group();
islandGroup.position.copy(ISLAND_POS);
scene.add(islandGroup);

// Beach base
const beach = new THREE.Mesh(
  new THREE.CylinderGeometry(10, 11.5, 2.2, 16),
  new THREE.MeshStandardMaterial({ color: 0xe8c87a, roughness: 1 })
);
beach.position.y = -0.8;
islandGroup.add(beach);

// Grass layer
const grass = new THREE.Mesh(
  new THREE.CylinderGeometry(7.5, 10, 1.6, 16),
  new THREE.MeshStandardMaterial({ color: 0x3a8a3a, roughness: 0.85 })
);
grass.position.y = 0.6;
islandGroup.add(grass);

// Hill
const hill = new THREE.Mesh(
  new THREE.ConeGeometry(5, 5.5, 12),
  new THREE.MeshStandardMaterial({ color: 0x2a6830, roughness: 0.8 })
);
hill.position.y = 4.1;
islandGroup.add(hill);

// Pier (West side, toward starting boat)
const pier = new THREE.Mesh(
  new THREE.BoxGeometry(5, 0.14, 1.2),
  new THREE.MeshStandardMaterial({ color: 0x8b5e3c, roughness: 0.9 })
);
pier.position.set(-9.5, SURFACE_Y - 0.5, 0);
islandGroup.add(pier);

// Palm trees
function addPalm(x, z, lean) {
  const h = 3.2;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.17, h, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b6914 })
  );
  trunk.position.set(x, SURFACE_Y + h / 2, z);
  trunk.rotation.z = lean;
  islandGroup.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(1.4, 1.1, 8),
    new THREE.MeshStandardMaterial({ color: 0x2a8030, roughness: 0.7 })
  );
  crown.position.set(x + Math.sin(lean) * h, SURFACE_Y + h + 0.35, z);
  islandGroup.add(crown);
}
addPalm(-5.5,  2.5,  0.18);
addPalm( 4.5, -4.5, -0.15);
addPalm(-2.5, -5.5,  0.22);
addPalm( 5.5,  4.0, -0.12);

// ── Project Boards ──────────────────────────────────────────────────────────
const C_PROJECTS = [
  {
    name: 'libft',
    desc: 'Reimplementazione della libreria standard C: ft_strlen, ft_memcpy, ft_split, liste concatenate e molto altro. La base di tutto.',
    repo: 'libft',
  },
  {
    name: 'push_swap',
    desc: 'Sorting con due stack (a e b) e operazioni limitate: sa, sb, pa, pb, ra, rb... Trova la sequenza più corta.',
    repo: 'push_swap',
  },
  {
    name: 'get_next_line',
    desc: 'Legge una riga alla volta da un fd usando un buffer statico. Gestisce più file descriptor aperti contemporaneamente.',
    repo: 'get_next_line',
  },
  {
    name: 'ft_printf',
    desc: 'Replica di printf con %s %d %c %x %u %p e flag di formattazione. Gestisce edge case e output su fd arbitrari.',
    repo: 'ft_printf',
  },
];

const boards = [];

function makeBoardTex(name) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 340;
  const ctx = c.getContext('2d');

  // Stone background
  ctx.fillStyle = '#1c1008';
  ctx.fillRect(0, 0, 256, 340);

  // Horizontal stone lines
  ctx.strokeStyle = '#2a1a08';
  ctx.lineWidth = 1;
  for (let y = 0; y < 340; y += 22) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
  }

  // Border
  ctx.strokeStyle = '#6a4020';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 240, 324);

  // C badge
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = '#cc6600';
  ctx.textAlign = 'center';
  ctx.fillText('[ C ]', 128, 45);

  // Divider
  ctx.strokeStyle = '#884422';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(30, 58); ctx.lineTo(226, 58); ctx.stroke();

  // Project name
  ctx.font = 'bold 38px monospace';
  ctx.fillStyle = '#ffcc44';
  ctx.fillText(name, 128, 100);

  // Second divider
  ctx.beginPath(); ctx.moveTo(30, 120); ctx.lineTo(226, 120); ctx.stroke();

  // Decorative runes
  ctx.font = '14px monospace';
  ctx.fillStyle = '#6a4020';
  const runes = ['▒▓▒', '░▒░', '▓░▓', '▒▓▒'];
  runes.forEach((r, i) => ctx.fillText(r, 128, 148 + i * 22));

  return new THREE.CanvasTexture(c);
}

const BOARD_RADIUS = 6.0;

C_PROJECTS.forEach((proj, i) => {
  const angle = (i / C_PROJECTS.length) * Math.PI * 2;
  const bx = Math.cos(angle) * BOARD_RADIUS;
  const bz = Math.sin(angle) * BOARD_RADIUS;
  const by = SURFACE_Y + 1.2;

  // Stone pedestal
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.38, 0.9, 6),
    new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 1 })
  );
  pedestal.position.set(bx, SURFACE_Y + 0.45, bz);
  islandGroup.add(pedestal);

  // Tablet
  const mats = [
    new THREE.MeshStandardMaterial({ color: 0x3a1a08 }),
    new THREE.MeshStandardMaterial({ color: 0x3a1a08 }),
    new THREE.MeshStandardMaterial({ color: 0x3a1a08 }),
    new THREE.MeshStandardMaterial({ color: 0x3a1a08 }),
    new THREE.MeshStandardMaterial({ map: makeBoardTex(proj.name) }), // +Z = front
    new THREE.MeshStandardMaterial({ color: 0x3a1a08 }),
  ];
  const tablet = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.2, 0.22), mats);
  tablet.position.set(bx, by, bz);

  // Front face (+Z) points inward toward island center
  const inward = new THREE.Vector3(-bx, 0, -bz).normalize();
  tablet.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), inward);

  tablet.userData = { proj };
  islandGroup.add(tablet);
  boards.push(tablet);
});

// ── Boat ────────────────────────────────────────────────────────────────────
const boatGroup = new THREE.Group();
boatGroup.position.set(-5, 0.38, 0);
boatGroup.rotation.y = -Math.PI / 2; // face +X toward island
scene.add(boatGroup);

// Hull
boatGroup.add(Object.assign(
  new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.6, 3.6),
    new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 })
  ), { position: new THREE.Vector3(0, 0, 0) }
));

// Cabin
const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(1.1, 0.75, 1.3),
  new THREE.MeshStandardMaterial({ color: 0xf5deb3, roughness: 0.6 })
);
cabin.position.set(0, 0.67, 0.3);
boatGroup.add(cabin);

// Mast
const mast = new THREE.Mesh(
  new THREE.CylinderGeometry(0.05, 0.07, 4.2, 6),
  new THREE.MeshStandardMaterial({ color: 0x5c3a1a })
);
mast.position.set(0, 2.45, -0.5);
boatGroup.add(mast);

// Sail
const sail = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 2.6),
  new THREE.MeshStandardMaterial({ color: 0xfff0dd, side: THREE.DoubleSide })
);
sail.position.set(0.76, 2.55, -0.5);
sail.rotation.y = Math.PI / 2;
boatGroup.add(sail);

const boatState = {
  speed:     0,
  MAX_SPEED: 0.13,
  ACCEL:     0.006,
  DRAG:      0.91,
  TURN:      0.034,
};

// ── Character ───────────────────────────────────────────────────────────────
const charGroup = new THREE.Group();
charGroup.visible = false;
scene.add(charGroup);

const skinM = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
const shirtM = new THREE.MeshStandardMaterial({ color: 0x2244cc });
const pantsM = new THREE.MeshStandardMaterial({ color: 0x334466 });

// Head
const charHead = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 8), skinM);
charHead.position.y = 1.22;
charGroup.add(charHead);

// Torso
charGroup.add(Object.assign(
  new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.44, 0.2), shirtM),
  { position: new THREE.Vector3(0, 0.78, 0) }
));

// Legs
const legGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.44, 6);
const charLegL = new THREE.Mesh(legGeo, pantsM);
charLegL.position.set(-0.1, 0.34, 0);
charGroup.add(charLegL);

const charLegR = new THREE.Mesh(legGeo, pantsM);
charLegR.position.set(0.1, 0.34, 0);
charGroup.add(charLegR);

// Arms
const armGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.38, 6);
const charArmL = new THREE.Mesh(armGeo, skinM);
charArmL.position.set(-0.25, 0.78, 0);
charGroup.add(charArmL);

const charArmR = new THREE.Mesh(armGeo, skinM);
charArmR.position.set(0.25, 0.78, 0);
charGroup.add(charArmR);

// ── State ────────────────────────────────────────────────────────────────────
let mode = 'boat'; // 'boat' | 'island'
let activeBoard = null;

const keys = {};
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space') e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

window.addEventListener('keydown', e => {
  if (e.code !== 'Space') return;
  if (mode === 'boat') {
    if (boatGroup.position.distanceTo(ISLAND_POS) < DOCK_RANGE) dock();
  } else {
    undock();
  }
});

function dock() {
  mode = 'island';
  // Place character on beach facing inward
  const toIsland = new THREE.Vector3().subVectors(ISLAND_POS, boatGroup.position).normalize();
  charGroup.position.set(
    ISLAND_POS.x - toIsland.x * 7,
    SURFACE_Y + 0.05,
    ISLAND_POS.z - toIsland.z * 7
  );
  charGroup.rotation.y = Math.atan2(toIsland.x, toIsland.z);
  charGroup.visible = true;
  setHint('frecce = cammina · SPAZIO = risali in barca');
}

function undock() {
  mode = 'boat';
  charGroup.visible = false;
  closePanel();
  setHint('frecce = naviga · SPAZIO = sbarca (vicino all\'isola)');
}

// ── Panel ────────────────────────────────────────────────────────────────────
function openPanel(proj) {
  document.getElementById('panel-title').textContent = proj.name;
  document.getElementById('panel-desc').textContent  = proj.desc;
  document.getElementById('panel-link').href = `https://github.com/${USERNAME}/${proj.repo}`;
  document.getElementById('panel').classList.remove('hidden');
}
function closePanel() {
  document.getElementById('panel').classList.add('hidden');
  activeBoard = null;
}
document.getElementById('close-btn').addEventListener('click', e => {
  e.stopPropagation();
  closePanel();
});

function setHint(text) {
  document.getElementById('hint').textContent = text;
}

// ── Camera state ─────────────────────────────────────────────────────────────
const camPos  = new THREE.Vector3(-14, 5, 0);
const camLook = new THREE.Vector3(0, 0.5, 0);
const tPos    = new THREE.Vector3(-14, 5, 0);
const tLook   = new THREE.Vector3(0, 0.5, 0);
camera.position.copy(camPos);
camera.lookAt(camLook);

// ── Animation ─────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();
const _wp   = new THREE.Vector3();

function updateBoat() {
  if (keys['ArrowUp'])    boatState.speed = Math.min(boatState.speed + boatState.ACCEL, boatState.MAX_SPEED);
  if (keys['ArrowDown'])  boatState.speed = Math.max(boatState.speed - boatState.ACCEL, -boatState.MAX_SPEED * 0.5);
  if (keys['ArrowLeft'])  boatGroup.rotation.y += boatState.TURN;
  if (keys['ArrowRight']) boatGroup.rotation.y -= boatState.TURN;
  boatState.speed *= boatState.DRAG;

  const sin = Math.sin(boatGroup.rotation.y);
  const cos = Math.cos(boatGroup.rotation.y);
  boatGroup.position.x -= sin * boatState.speed;
  boatGroup.position.z -= cos * boatState.speed;
  boatGroup.position.y = 0.38 + Math.sin(clock.getElapsedTime() * 1.3) * 0.07;

  // Camera behind boat
  tPos.set(
    boatGroup.position.x + sin * 9,
    boatGroup.position.y + 5.5,
    boatGroup.position.z + cos * 9
  );
  tLook.set(
    boatGroup.position.x - sin * 3,
    boatGroup.position.y + 1,
    boatGroup.position.z - cos * 3
  );

  // Hint on proximity
  const dist = boatGroup.position.distanceTo(ISLAND_POS);
  setHint(dist < DOCK_RANGE
    ? 'SPAZIO = sbarca sull\'isola'
    : 'frecce = naviga · avvicinati all\'isola C'
  );
}

function updateCharacter(t) {
  let mx = 0, mz = 0;
  if (keys['ArrowUp'])    mz = -1;
  if (keys['ArrowDown'])  mz =  1;
  if (keys['ArrowLeft'])  mx = -1;
  if (keys['ArrowRight']) mx =  1;

  const moving = mx !== 0 || mz !== 0;

  if (moving) {
    charGroup.rotation.y = Math.atan2(mx, mz);
    const nx = charGroup.position.x + mx * 0.07;
    const nz = charGroup.position.z + mz * 0.07;
    const dx = nx - ISLAND_POS.x;
    const dz = nz - ISLAND_POS.z;
    if (dx * dx + dz * dz < ISLAND_RADIUS * ISLAND_RADIUS) {
      charGroup.position.x = nx;
      charGroup.position.z = nz;
    }
  }

  charGroup.position.y = SURFACE_Y + (moving ? Math.abs(Math.sin(t * 8)) * 0.04 : 0);

  // Walk animation
  const sw = moving ? Math.sin(t * 8) * 0.35 : 0;
  charLegL.rotation.x  =  sw;
  charLegR.rotation.x  = -sw;
  charArmL.rotation.x  = -sw * 0.55;
  charArmR.rotation.x  =  sw * 0.55;

  // Camera follows character from above + behind
  tPos.set(charGroup.position.x,       charGroup.position.y + 8,  charGroup.position.z + 5.5);
  tLook.set(charGroup.position.x,      charGroup.position.y + 0.5, charGroup.position.z);

  // Board proximity → auto panel
  let nearest = null;
  let nearestDist = 3.2;
  boards.forEach(b => {
    b.getWorldPosition(_wp);
    const d = charGroup.position.distanceTo(_wp);
    if (d < nearestDist) { nearestDist = d; nearest = b; }
  });

  if (nearest && nearest !== activeBoard) {
    activeBoard = nearest;
    openPanel(nearest.userData.proj);
  } else if (!nearest && activeBoard) {
    closePanel();
  }
}

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  oceanMat.uniforms.uTime.value = t;

  if (mode === 'boat') {
    updateBoat();
  } else {
    updateCharacter(t);
  }

  camPos.lerp(tPos,  0.05);
  camLook.lerp(tLook, 0.05);
  camera.position.copy(camPos);
  camera.lookAt(camLook);

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
