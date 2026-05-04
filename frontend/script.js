const USERNAME = 'Emanuelee00';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060b18);
scene.fog = new THREE.FogExp2(0x060b18, 0.014);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 6, 22);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('bg'),
  antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Lights
scene.add(new THREE.AmbientLight(0x1a2a4a, 1.2));
const sun = new THREE.DirectionalLight(0x6699ff, 1.8);
sun.position.set(10, 20, 10);
scene.add(sun);

// Stars
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(2500 * 3);
for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 160;
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 })));

// World group (auto-rotates when idle)
const world = new THREE.Group();
scene.add(world);

const islands = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hovered = null;
let selected = null;

// Smooth camera state
const camPos = new THREE.Vector3(0, 6, 22);
const camLook = new THREE.Vector3(0, 0, 0);
const targetCamPos = new THREE.Vector3(0, 6, 22);
const targetCamLook = new THREE.Vector3(0, 0, 0);

function createLabel(text) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 80;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 80);
  ctx.font = 'bold 36px monospace';
  ctx.fillStyle = '#99ccee';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const display = text.length > 22 ? text.slice(0, 20) + '…' : text;
  ctx.fillText(display, 256, 40);
  return new THREE.CanvasTexture(c);
}

function createIsland(repo, i, total) {
  const g = new THREE.Group();

  const angle = (i / total) * Math.PI * 2;
  const radius = Math.max(6, total * 0.9);
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const baseY = (Math.random() - 0.5) * 5;

  g.position.set(x, baseY, z);
  g.userData = {
    repo,
    phase: Math.random() * Math.PI * 2,
    baseY,
    clickables: [],
    ring: null,
    label: null,
  };

  // Rock body
  const rock = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.55, 1.3, 7),
    new THREE.MeshStandardMaterial({ color: 0x182840, roughness: 0.95 })
  );
  rock.position.y = -0.3;
  g.add(rock);
  g.userData.clickables.push(rock);

  // Top platform
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.12, 0.18, 7),
    new THREE.MeshStandardMaterial({
      color: 0x1e4070,
      roughness: 0.55,
      metalness: 0.15,
      emissive: 0x081828,
    })
  );
  top.position.y = 0.38;
  g.add(top);
  g.userData.clickables.push(top);

  // Small decoration rocks
  for (let d = 0; d < 3; d++) {
    const a = (d / 3) * Math.PI * 2 + Math.random() * 0.5;
    const pebble = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.12 + Math.random() * 0.1),
      new THREE.MeshStandardMaterial({ color: 0x2a3a5a, roughness: 1 })
    );
    pebble.position.set(Math.cos(a) * 0.55, 0.5, Math.sin(a) * 0.55);
    pebble.rotation.set(Math.random(), Math.random(), Math.random());
    g.add(pebble);
  }

  // Glow ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.035, 8, 48),
    new THREE.MeshBasicMaterial({ color: 0x3377ff, transparent: true, opacity: 0.5 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.5;
  g.add(ring);
  g.userData.ring = ring;

  // Name label
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.5),
    new THREE.MeshBasicMaterial({ map: createLabel(repo.name), transparent: true, depthWrite: false })
  );
  label.position.y = 1.15;
  g.add(label);
  g.userData.label = label;

  world.add(g);
  islands.push(g);
}

async function loadRepos() {
  try {
    const res = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=12`);
    const repos = await res.json();
    if (!Array.isArray(repos)) throw new Error('invalid response');
    document.getElementById('loading').style.display = 'none';
    repos.forEach((repo, i) => createIsland(repo, i, repos.length));
  } catch {
    document.getElementById('loading').textContent = 'Errore nel caricamento dei repo.';
  }
}

loadRepos();

window.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
  if (!hovered) {
    closePanel();
    return;
  }
  openPanel(hovered);
});

function openPanel(island) {
  selected = island;
  const { repo } = island.userData;

  document.getElementById('panel-title').textContent = repo.name;
  document.getElementById('panel-desc').textContent =
    repo.description || 'Nessuna descrizione disponibile.';
  document.getElementById('panel-link').href = repo.html_url;
  document.getElementById('panel').classList.remove('hidden');

  const wp = new THREE.Vector3();
  island.getWorldPosition(wp);
  targetCamPos.set(wp.x + 3, wp.y + 4, wp.z + 9);
  targetCamLook.copy(wp);
}

function closePanel() {
  selected = null;
  document.getElementById('panel').classList.add('hidden');
  targetCamPos.set(0, 6, 22);
  targetCamLook.set(0, 0, 0);
}

document.getElementById('close-btn').addEventListener('click', e => {
  e.stopPropagation();
  closePanel();
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (!selected) world.rotation.y += 0.0015;

  islands.forEach(isl => {
    isl.position.y = isl.userData.baseY + Math.sin(t * 0.65 + isl.userData.phase) * 0.35;
    isl.userData.ring.material.opacity = 0.22 + Math.sin(t * 1.6 + isl.userData.phase) * 0.18;
    isl.userData.label.lookAt(camera.position);
  });

  // Update camera target to follow selected island as it floats
  if (selected) {
    const wp = new THREE.Vector3();
    selected.getWorldPosition(wp);
    targetCamPos.set(wp.x + 3, wp.y + 4, wp.z + 9);
    targetCamLook.copy(wp);
  }

  // Hover detection
  raycaster.setFromCamera(mouse, camera);
  const meshes = islands.flatMap(i => i.userData.clickables);
  const hits = raycaster.intersectObjects(meshes);
  const newHovered = hits.length ? hits[0].object.parent : null;

  if (newHovered !== hovered) {
    if (hovered) hovered.scale.setScalar(1);
    hovered = newHovered;
    if (hovered) hovered.scale.setScalar(1.1);
    document.body.style.cursor = hovered ? 'pointer' : 'default';
  }

  // Smooth camera
  camPos.lerp(targetCamPos, 0.04);
  camLook.lerp(targetCamLook, 0.04);
  camera.position.copy(camPos);
  camera.lookAt(camLook);

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
