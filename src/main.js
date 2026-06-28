import * as THREE from 'three';
import { SceneManager } from './classes/SceneManager.js';

const sceneManager = new SceneManager();

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  sceneManager.update(delta);
  sceneManager.render();
}

animate();