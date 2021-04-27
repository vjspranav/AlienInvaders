import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as dat from 'dat.gui'
import { PlaneGeometry } from 'three'

let player;
let stars=[]
const fov = 45;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

class Stars {
    constructor(star){
        this.star=star 
        this.status=true
    }
};

document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowUp") {player.position.z -= 0.2}
    else if (e.code === "ArrowDown"){ player.position.z += 0.2}
    else if (e.code === "ArrowLeft"){ player.position.x -= 0.2}
    else if (e.code === "ArrowRight"){ player.position.x += 0.2}
    console.log(player.position.x, player.position.y, player.position.z)
});

function randomNumber(min, max){
    min = Math.floor(min)
    max = Math.ceil(max)
    const r = Math.random()*(max-min) + min 
    return Math.floor(r)
}

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  camera.position.set(0, 75, 100);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('black');

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
  const controls = new OrbitControls(camera, canvas);

  function init() {
    // hide the loading bar
    const loadingElem = document.querySelector('#loading');
    loadingElem.style.display = 'none';
    player=models.plane.gltf.scene
    player.position.set(0, 25, 50);
    player.scale.set(2, 2, 2)
    controls.target = player.position;
    controls.update();
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

   let checkCollision = (position) =>{
    let z_min = player.position.z+2
    let z_max = player.position.z-2
    let x_max = player.position.x+4
    let x_min = player.position.x-4
    if(position.z >= z_max )
        if(position.z <= z_min )
            if(position.x < x_max || position.x > x_min)
                return true
    return false
    }

  let now = 0;
  let addStar = () => {
    if (then-now > 2){
        now=then;
        let flag = randomNumber(0, 2);
        if(flag){
            let obstacle_id = randomNumber(0, 1)
            console.log(obstacle_id)
            let obstacle = models.star.gltf.scene;
            let x_position = randomNumber(player.position.x-6-3, player.position.x+6+4)
            obstacle.position.set(x_position, 30, 25)       
            let star = new Stars(obstacle.clone())
            //star.star.rotation.x -= 100
            //star.star.rotation.z -= 90
            star.star.rotation.y -=90
            star.star.scale.set(2, 2, 2)
            scene.add(star.star)
            stars.push(star)
            console.log("Added star to", star.star.position.x, star.star.position.y, star.star.position.z)
        }
    }
  }

  let moveStars = () => {
      stars.forEach((star)=>{
          if(star)
              star.star.position.set(star.star.position.x, star.star.position.y, star.star.position.z+0.02);
              if(checkCollision(star.star.position)){
                scene.remove(star.star)
                stars.status=false
              }
      });
  }

  let removeElements = () => {
      stars = stars.filter(star => star.status)
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
    addStar();
    moveStars();
    removeElements();
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
main();
