import * as THREE from "three";
import * as CANNON from "cannon";
import OrbitControls from 'three-orbitcontrols'
import Car from "./Car";
import Ground from "./Ground";

export default class Scene {
  constructor() {
    this.init();
    this.addEvents();
  }

  addEvents() {
    window.addEventListener("resize", () => this.onWindowResize);
  }

  init() {
    // Initialise the physics world
    this.world = new CANNON.World();
    this.world.gravity.set(0, 0, -9.82);

    // Create the THREE Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xb3d6ff, 0.009);
    this.setCamera();
    this.setLights();
    this.addObjects();
    this.setRenderer();
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0xb3d6ff);
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 2.3;
    this.renderer.shadowMap.enabled = true;
    this.renderer.setAnimationLoop(() => {
      this.render();
    }); // Render 60 fps

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    document.body.appendChild(this.renderer.domElement);
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.camera.position.set(0, 5, 13);
  }

  setLights() {
    // Hemisphere light
    this.hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 1)
    this.scene.add(this.hemiLight);

    // Directional light
    this.dirLight = new THREE.DirectionalLight(0xffe5c9, 2);
    this.dirLight.position.set(0, 50, 0);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.bias = -0.0001;
    this.dirLight.shadow.camera.far = 900;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.radius = 12;
    this.scene.add(this.dirLight);

    this.spotlight = new THREE.SpotLight(0xff9940, 1.5)
    this.spotlight.castShadow = false;
    this.spotlight.shadow.radius = 8;
    this.spotlight.shadow.mapSize.width = 2048;
    this.spotlight.shadow.mapSize.heihgt = 2048;
    this.scene.add(this.spotlight)
  }

  addObjects() {
    // New instance of the car
    this.car = new Car(this.scene);
    this.ground = new Ground(this.scene);
  }

  render() {
    this.camera.lookAt(
      this.car.scene.position.x,
      this.car.scene.position.y,
      this.car.scene.position.z
    );

    this.spotlight.position.set(
      this.camera.position.x + 20,
      this.camera.position.y + 320,
      this.camera.position.z + 20
    )

    // this.car.scene.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
