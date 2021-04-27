import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Swal from "sweetalert2";
import * as dat from "dat.gui";
import { PlaneGeometry } from "three";

let player;
let stars = [];
let comets = [];
let missiles = [];
const fov = 45;
const aspect = 2; // the canvas default
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
let score = 0;
let health = 100;
document.getElementById("score").innerHTML = score;
document.getElementById("health").innerHTML = health;
class Stars {
  constructor(star) {
    this.star = star;
    this.status = true;
  }
}

class Comets {
  constructor(comet) {
    this.comet = comet;
    this.status = true;
  }
}

class Missiles {
  constructor(missile) {
    this.missile = missile;
    this.status = true;
  }
}

document.addEventListener("keydown", (e) => {
  let z = player.position.z;
  let x = player.position.x;
  if (e.code === "ArrowUp") {
    z -= 0.2;
  } else if (e.code === "ArrowDown") {
    z += 0.2;
  } else if (e.code === "ArrowLeft") {
    x -= 0.2;
  } else if (e.code === "ArrowRight") {
    x += 0.2;
  }
  z = z >= 75 ? 75 : z;
  z = z <= 34 ? 34 : z;
  x = x >= 18 ? 18 : x;
  x = x <= -20 ? -20 : x;
  player.position.set(x, player.position.y, z);
  console.log(player.position.x, player.position.y, player.position.z);
});

function randomNumber(min, max) {
  min = Math.floor(min);
  max = Math.ceil(max);
  const r = Math.random() * (max - min) + min;
  return Math.floor(r);
}

async function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas });

  camera.position.set(0, 75, 100);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("black");

  function addLight(...pos) {
    const color = 0xffffff;
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

  const progressbarElem = document.querySelector("#progressbar");
  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    progressbarElem.style.width = `${((itemsLoaded / itemsTotal) * 100) | 0}%`;
  };

  const models = {
    plane: { url: "./plane.glb" },
    star: { url: "./star.glb" },
    comet: { url: "./comet.glb" },
    missile: { url: "./missile.glb" },
  };
  {
    const gltfLoader = new GLTFLoader(manager);
    for (const model of Object.values(models)) {
      await gltfLoader.load(model.url, (gltf) => {
        model.gltf = gltf;
      });
    }
  }

  const mixers = [];
  const controls = new OrbitControls(camera, canvas);

  function init() {
    // hide the loading bar
    const loadingElem = document.querySelector("#loading");
    loadingElem.style.display = "none";
    player = models.plane.gltf.scene;
    player.position.set(0, 25, 50);
    player.scale.set(2, 2, 2);
    controls.target = player.position;
    controls.update();
    scene.add(player);
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

  let checkCollision = (position) => {
    let z_min = player.position.z + 2;
    let z_max = player.position.z - 2;
    let x_max = player.position.x + 4;
    let x_min = player.position.x - 4;
    if (position.z >= z_max)
      if (position.z <= z_min)
        if (position.x < x_max && position.x > x_min) return true;
    return false;
  };

  let addMissile = () => {
    let obstacle = models.missile.gltf.scene;
    let position = player.position.clone();
    obstacle.position.set(position.x + 1, 28, (position.z -= 10));
    let missile = new Missiles(obstacle.clone());
    //comet.comet.rotation.x += 0.2;
    missile.missile.rotation.y += Math.PI / 2;
    missile.missile.scale.set(2, 2, 2);
    scene.add(missile.missile);
    missiles.push(missile);
  };

  let moveMissiles = async () => {
    missiles.forEach((missile) => {
      if (missile) {
        missile.missile.position.set(
          missile.missile.position.x,
          missile.missile.position.y,
          missile.missile.position.z - 0.02
        );
        if (missile.missile.position.z <= 34) {
          missile.status = false;
          scene.remove(missile.missile);
        }
      }
    });
  };

  document.addEventListener("keyup", (e) => {
    if (e.keyCode == 32) {
      console.log("Missile launched");
      addMissile();
    }
  });

  let now = 0;
  let addStar = () => {
    if (then - now > 2) {
      now = then;
      let flag = randomNumber(0, 2);
      if (flag) {
        let obstacle_id = randomNumber(0, 1);
        console.log(obstacle_id);
        let obstacle = models.star.gltf.scene;
        let x_position = randomNumber(
          player.position.x - 6 - 3,
          player.position.x + 6 + 4
        );
        x_position = x_position >= 18 ? 18 : x_position;
        x_position = x_position <= -20 ? -20 : x_position;
        obstacle.position.set(x_position, 30, 25);
        let star = new Stars(obstacle.clone());
        star.star.rotation.x += 0.2;
        //star.star.rotation.z -= 90
        star.star.rotation.y -= Math.PI / 2;
        star.star.scale.set(2, 2, 2);
        scene.add(star.star);
        stars.push(star);
        console.log(
          "Added star to",
          star.star.position.x,
          star.star.position.y,
          star.star.position.z
        );
      }
    }
  };

  let moveStars = async () => {
    stars.forEach((star) => {
      if (star) {
        star.star.position.set(
          star.star.position.x,
          star.star.position.y,
          star.star.position.z + 0.02
        );
        if (checkCollision(star.star.position)) {
          scene.remove(star.star);
          score += 10;
          document.getElementById("score").innerHTML = score;
          star.status = false;
        }
        if (star.star.position.z >= 75) {
          star.status = false;
          scene.remove(star.star);
        }
      }
    });
  };

  let now_c = 0;
  let addComet = () => {
    if (then - now_c > 4) {
      now_c = then;
      let flag = randomNumber(0, 3);
      if (flag) {
        let obstacle = models.comet.gltf.scene;
        let x_position = randomNumber(
          player.position.x - 6 - 3,
          player.position.x + 6 + 4
        );
        x_position = x_position >= 18 ? 18 : x_position;
        x_position = x_position <= -20 ? -20 : x_position;
        obstacle.position.set(x_position, 30, 25);
        let comet = new Comets(obstacle.clone());
        comet.comet.rotation.x += 0.2;
        //star.star.rotation.z -= 90
        comet.comet.rotation.y -= Math.PI / 2;
        comet.comet.scale.set(2, 2, 2);
        scene.add(comet.comet);
        comets.push(comet);
      }
    }
  };

  let moveComets = async () => {
    comets.forEach((comet) => {
      if (comet) {
        comet.comet.position.set(
          comet.comet.position.x,
          comet.comet.position.y,
          comet.comet.position.z + 0.02
        );
        if (checkCollision(comet.comet.position)) {
          scene.remove(comet.comet);
          health -= 10;
          document.getElementById("health").innerHTML = health;
          comet.status = false;
        }
        if (comet.comet.position.z >= 75) {
          comet.status = false;
          scene.remove(comet.comet);
        }
      }
    });
  };

  let removeElements = () => {
    stars = stars.filter((star) => star.status);
    comets = comets.filter((comet) => comet.status);
    missiles = missiles.filter((missile) => missile.status);
  };

  let then = 0;
  function render(now) {
    now *= 0.001; // convert to seconds
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
    addComet();
    moveComets();
    moveMissiles();
    removeElements();
    if (health > 0) requestAnimationFrame(render);
    else
      Swal.fire({
        title: "GAME OVER",
        text: "Your total score is: " + score,
      });
  }

  await requestAnimationFrame(render);
}
main();
