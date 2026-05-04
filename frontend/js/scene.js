export const SKY = new THREE.Color(0x87ceeb);

export const scene = new THREE.Scene();
scene.background = SKY;
scene.fog = new THREE.Fog(SKY, 35, 110);

export const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 200);
camera.position.set(-14, 6, 0);
camera.lookAt(0, 0.5, 0);

export const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('bg'),
  antialias: true,
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

scene.add(new THREE.HemisphereLight(0x87ceeb, 0x3a8a3a, 1.1));
const sun = new THREE.DirectionalLight(0xfff5d0, 1.8);
sun.position.set(30, 50, 20);
scene.add(sun);

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
