import { scene } from './scene.js';

export class Ocean {
  constructor() {
    this._mat = new THREE.ShaderMaterial({
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

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(280, 280, 60, 60),
      this._mat
    );
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
  }

  update(t) {
    this._mat.uniforms.uTime.value = t;
  }
}
