import * as THREE from "three";
import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "../node_modules/three/examples/jsm/loaders/DRACOLoader.js";

const container = document.getElementById("sceneContainer");

//Scene
const scene = new THREE.Scene();

//Camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(0, 1.5, 25);
scene.add(camera);

//Plane
const planeGeometry = new THREE.PlaneGeometry(20, 140);
const planeMaterial = new THREE.MeshPhongMaterial({
  color: 0x1b1c20,
  side: THREE.DoubleSide,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotateX(Math.PI / 2);
planeMesh.position.setZ(40);
planeMesh.receiveShadow = true;
scene.add(planeMesh);

//Candles Left
let candlesL = [];
for (let i = 0; i < 5; i++) {
  const candleGeometryL = new THREE.SphereGeometry(0.05, 1);
  const candleMaterialL = new THREE.MeshPhongMaterial({
    color: 0xa6731c,
    side: THREE.DoubleSide,
    emissive: 0xf9c36d,
    specular: 0xbb7e1c,
    shininess: 100,
  });
  const candleMeshL = new THREE.Mesh(candleGeometryL, candleMaterialL);
  candleMeshL.position.set(-4, 0.05, i * 20);

  const candleLightL = new THREE.PointLight(0xbc893b, 35, 5);
  candleLightL.position.set(-4, 0.2, i * 20);
  candleLightL.castShadow = true;

  const candleL = new THREE.Group();
  candleL.add(candleMeshL, candleLightL);

  candlesL.push(candleL);
  scene.add(candlesL[i]);
}

//Candles Right
let candlesR = [];
for (let i = 0; i < 5; i++) {
  const candleGeometryR = new THREE.SphereGeometry(0.05, 1);
  const candleMaterialR = new THREE.MeshPhongMaterial({
    color: 0xa6731c,
    side: THREE.DoubleSide,
    emissive: 0xf9c36d,
    specular: 0xbb7e1c,
    shininess: 100,
  });
  const candleMeshR = new THREE.Mesh(candleGeometryR, candleMaterialR);
  candleMeshR.position.set(4, 0.05, i * 20);

  const candleLightR = new THREE.PointLight(0xbc893b, 35, 5);
  candleLightR.position.set(4, 0.2, i * 20);
  candleLightR.castShadow = true;

  const candleR = new THREE.Group();
  candleR.add(candleMeshR, candleLightR);

  candlesR.push(candleR);
  scene.add(candlesR[i]);
}

//Draco loader for optimized model of buddha
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('../public/decoder/draco/')

//Buddha model
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.load(
  "./public/model/littleB.glb",
  function (gltf) {
    const buddha = gltf.scene;
    buddha.receiveShadow = true;
    buddha.castShadow = true;
    buddha.position.setZ(0);
    buddha.position.setX(0.1);
    buddha.position.setY(0);
    scene.add(buddha);
  },
  undefined,
  function (error) {
    console.error("An error ocured: " + error);
  }
);

//Projector maps loader
const textureLoader = new THREE.TextureLoader().setPath("./public/photos/");
const filenames = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"];

const textures = { none: null };

for (let i = 0; i < filenames.length; i++) {
  const filename = filenames[i];

  const texture = textureLoader.load(filename);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.encoding = THREE.sRGBEncoding;

  textures[filename] = texture;
}

//Projector Light
let projectorMap = 5;
let projector = new THREE.SpotLight(0xffffff);
projector.intensity = 0;
projector.angle = Math.PI / 20;
projector.penumbra = 1;
projector.decay = 2;
projector.distance = 100;
projector.map = textures[projectorMap + ".jpg"];
projector.castShadow = true;
projector.position.set(0, 2, 5);
projector.target.position.set(0, 2, 0);
scene.add(projector);

//Light Buttons
const btnLeft = document.getElementById("left");
const btnPlay = document.getElementById("play");
const btnRight = document.getElementById("right");
let projectorOn = false;

function toggleProjectorIntensity() {
  projectorOn = !projectorOn;
  if (!projectorOn) {
    projector.intensity = 0;
  } else {
    projector.intensity = 5;
  }
}

function toggleProjectorMapL() {
  projectorMap--
  projector.map = textures[projectorMap + ".jpg"];
  
  if (projectorMap < 1) {
    projectorMap = 5;
    projector.map = textures[projectorMap + ".jpg"];
  }
}

function toggleProjectorMapR() {
  projectorMap++
  projector.map = textures[projectorMap + ".jpg"];
  
  if (projectorMap > 5) {
    projectorMap = 1;
    projector.map = textures[projectorMap + ".jpg"];
  }
}

//Buttons Listeners
btnPlay.addEventListener("click", toggleProjectorIntensity);
btnLeft.addEventListener("click", toggleProjectorMapL);
btnRight.addEventListener("click", toggleProjectorMapR);

//Checking scroll percentage
// const scrollStatic = document.getElementById("scrollPercent");
let scrollValue = 0;
window.addEventListener("scroll", () => {
  scrollValue = Math.round(
    ((document.documentElement.scrollTop + document.body.scrollTop) /
      (document.documentElement.scrollHeight -
        document.documentElement.clientHeight)) *
      100
  );
  // scrollStatic.innerHTML = scrollValue;
});

// onScroll Animation
function moveCameraOnScroll(scroll) {
  if (scroll > -1) {
    camera.position.z = 100 - scroll / 1.02;
  }
}

//Helpers (commented!)
const helper = new THREE.GridHelper(20, 20, 0xffffff, 0xff00ff);
// scene.add(helper);
const lightHelper = new THREE.SpotLightHelper(projector);
// scene.add(lightHelper);

//renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor("#000000");
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

//Responsive canvas
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

//Rendering Scene
const rendering = function () {
  requestAnimationFrame(rendering);
  renderer.render(scene, camera);
  moveCameraOnScroll(scrollValue);
  camera.lookAt(0, 2, 0);
};

rendering();
