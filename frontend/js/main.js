import { scene, camera, renderer } from './scene.js';
import { Ocean }     from './ocean.js';
import { Island, DOCK_RANGE, SURFACE_Y, ISLAND_RADIUS } from './island.js';
import { Boat }      from './boat.js';
import { Character } from './character.js';
import { Clouds }    from './clouds.js';
import { ISLANDS_CONFIG, GITHUB_USER } from './projects.js';
import { t, getLang, toggleLang, onLangChange } from './i18n.js';

// ── World objects ────────────────────────────────────────────────────────────
const ocean     = new Ocean();
const islands   = ISLANDS_CONFIG.map(cfg => new Island(cfg));
const boat      = new Boat();
const character = new Character();
const clouds    = new Clouds();

// ── State ─────────────────────────────────────────────────────────────────────
let mode          = 'boat';
let currentIsland = null;  // island the character is currently on
let activeProj    = null;

// ── Orbit camera ──────────────────────────────────────────────────────────────
const orbit = {
  theta:     -Math.PI / 2,  // horizontal angle (starts with island in view)
  phi:        0.45,          // vertical angle
  radiusBoat: 12,
  radiusIsl:  9,
  dragging:   false,
  prevX:      0,
  prevY:      0,
};

const camPos  = new THREE.Vector3();
const camLook = new THREE.Vector3();

// Initialize camera position from orbit params
{
  const cx = -5, cy = 1, cz = 0; // near boat start
  camPos.set(
    cx + Math.sin(orbit.theta) * Math.cos(orbit.phi) * orbit.radiusBoat,
    cy + Math.sin(orbit.phi)   * orbit.radiusBoat,
    cz + Math.cos(orbit.theta) * Math.cos(orbit.phi) * orbit.radiusBoat
  );
  camLook.set(cx, cy, cz);
  camera.position.copy(camPos);
  camera.lookAt(camLook);
}

window.addEventListener('mousedown', e => {
  if (e.button === 0) {
    orbit.dragging = true;
    orbit.prevX = e.clientX;
    orbit.prevY = e.clientY;
  }
});
window.addEventListener('mouseup',   () => { orbit.dragging = false; });
window.addEventListener('mousemove', e => {
  if (!orbit.dragging) return;
  orbit.theta -= (e.clientX - orbit.prevX) * 0.006;
  orbit.phi    = Math.max(0.08, Math.min(1.35, orbit.phi - (e.clientY - orbit.prevY) * 0.005));
  orbit.prevX  = e.clientX;
  orbit.prevY  = e.clientY;
});

// Scroll to zoom
window.addEventListener('wheel', e => {
  if (mode === 'boat') {
    orbit.radiusBoat = Math.max(5, Math.min(22, orbit.radiusBoat + e.deltaY * 0.02));
  } else {
    orbit.radiusIsl  = Math.max(4, Math.min(16, orbit.radiusIsl  + e.deltaY * 0.02));
  }
}, { passive: true });

// ── Keyboard controls ─────────────────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space') { e.preventDefault(); _onSpace(); }
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function _onSpace() {
  if (mode === 'boat') {
    const near = _findNearbyIsland();
    if (near) _dock(near);
  } else {
    _undock();
  }
}

function _findNearbyIsland() {
  return islands.find(isl => boat.position.distanceTo(isl.position) < DOCK_RANGE) ?? null;
}

function _dock(island) {
  mode          = 'island';
  currentIsland = island;
  const toIsland = new THREE.Vector3().subVectors(island.position, boat.position).normalize();
  character.show(island.position, toIsland);
  closePanel();
  setHint(t('hint_island'));
}

function _undock() {
  mode          = 'boat';
  currentIsland = null;
  character.hide();
  closePanel();
  setHint(t('hint_navigate'));
}

// ── Panel ─────────────────────────────────────────────────────────────────────
const panelEl    = document.getElementById('panel');
const titleEl    = document.getElementById('panel-title');
const descEl     = document.getElementById('panel-desc');
const linkEl     = document.getElementById('panel-link');
const tagEl      = document.getElementById('panel-tag');
const githubBtnEl = document.getElementById('github-btn-text');

function openPanel(proj) {
  if (activeProj === proj) {
    // Refresh desc text on lang change
    descEl.textContent = proj.desc[getLang()] ?? proj.desc.en;
    return;
  }
  activeProj = proj;
  tagEl.textContent   = t('panel_tag');
  titleEl.textContent = proj.name;
  descEl.textContent  = proj.desc[getLang()] ?? proj.desc.en;
  linkEl.href         = `https://github.com/${GITHUB_USER}/${proj.repo}`;
  if (githubBtnEl) githubBtnEl.textContent = t('btn_github');
  panelEl.classList.remove('hidden');
}

function closePanel() {
  panelEl.classList.add('hidden');
  activeProj = null;
}

document.getElementById('close-btn').addEventListener('click', e => {
  e.stopPropagation();
  closePanel();
});

// ── Language toggle ───────────────────────────────────────────────────────────
const langBtn = document.getElementById('lang-btn');
langBtn.textContent = t('lang_btn');
langBtn.addEventListener('click', () => {
  toggleLang();
});

onLangChange(() => {
  langBtn.textContent = t('lang_btn');
  if (activeProj) openPanel(activeProj); // refresh description
  // Refresh hint
  if (mode === 'island') {
    setHint(t('hint_island'));
  }
});

// ── Hint helper ───────────────────────────────────────────────────────────────
const hintEl = document.getElementById('hint');
function setHint(text) { hintEl.textContent = text; }
setHint(t('hint_navigate'));

// ── Animation loop ────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t_now = clock.getElapsedTime();

  ocean.update(t_now);
  clouds.update();

  // Determine orbit center
  let center, radius;

  if (mode === 'boat') {
    boat.update(keys, t_now);
    center = new THREE.Vector3(boat.position.x, boat.position.y + 1, boat.position.z);
    radius = orbit.radiusBoat;

    // Hint based on proximity to islands
    const near = _findNearbyIsland();
    if (near) {
      setHint(t('hint_dock', near.label[getLang()]));
    } else {
      setHint(t('hint_navigate'));
    }

  } else {
    character.update(keys, t_now);
    center = new THREE.Vector3(character.position.x, character.position.y + 0.5, character.position.z);
    radius = orbit.radiusIsl;

    const proj = currentIsland.getNearestBoard(character.position);
    if (proj) openPanel(proj);
    else if (activeProj) closePanel();
  }

  // Compute camera target from orbit angles
  const targetPos = new THREE.Vector3(
    center.x + Math.sin(orbit.theta) * Math.cos(orbit.phi) * radius,
    center.y + Math.sin(orbit.phi)   * radius,
    center.z + Math.cos(orbit.theta) * Math.cos(orbit.phi) * radius
  );

  camPos.lerp(targetPos, 0.05);
  camLook.lerp(center,   0.05);
  camera.position.copy(camPos);
  camera.lookAt(camLook);

  renderer.render(scene, camera);
}

animate();
