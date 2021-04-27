import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as dat from 'dat.gui'
import { PlaneGeometry } from 'three'

let player;
document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowUp") player.position.z -= 0.2;
    else if (e.code === "ArrowDown") player.position.z += 0.2;
    else if (e.code === "ArrowLeft") player.position.x -= 0.2;
    else if (e.code === "ArrowRight") player.position.x += 0.2;
});

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 75, 100);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 25, 50);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('white');

  function addLight(...pos) {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(...pos);
    scene.add(light);
    scene.add(light.target);
  }
  addLight(5, 5, 2);
  addLight(-5, 5, 5);

  const manager = new THREE.LoadingManager();
  manager.onLoad = init;

  const progressbarElem = document.querySelector('#progressbar');
  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}%`;
  };

  const models = {
    plane:    { url: './plane.glb' },
    star:    { url: './star.glb' },
  };
  {
    const gltfLoader = new GLTFLoader(manager);
    for (const model of Object.values(models)) {
      gltfLoader.load(model.url, (gltf) => {
        model.gltf = gltf;
      });
    }
  }

  const mixers = [];

  function init() {
    // hide the loading bar
    const loadingElem = document.querySelector('#loading');
    loadingElem.style.display = 'none';
    player=models.plane.gltf.scene
    player.position.set(0, 25, 50);
    scene.add(player)
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  let then = 0;
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    for (const mixer of mixers) {
      mixer.update(deltaTime);
    }   

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
