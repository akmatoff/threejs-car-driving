import * as THREE from "three";
import * as CANNON from "cannon";
import OrbitControls from "three-orbitcontrols";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ConvolutionShader } from "three/examples/jsm/shaders/ConvolutionShader";
import Car from "./objects/Car";
import Ground from "./objects/Ground";

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
    this.world.broadphase = new CANNON.SAPBroadphase(this.world); // Change the collision detection method
    this.world.gravity.set(0, -10, 0);

    // Clock
    this.clock = new THREE.Clock();

    // Create the THREE Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xb3d6ff);
    this.scene.fog = new THREE.FogExp2(0xb3d6ff, 0.01);

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
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.7;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setAnimationLoop(() => {
      this.render();
    }); // Render loop

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Passes
    this.renderPass = new RenderPass(this.scene, this.camera);

    this.convShaderPass = new ShaderPass(ConvolutionShader)

    // Composer
    this.composer = new EffectComposer(this.renderer);
    this.composer.setSize(window.offsetWidth, window.offsetHeight);
    this.composer.addPass(this.renderPass);
    // this.composer.addPass(this.convShaderPass);

    document.body.appendChild(this.renderer.domElement);
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.set(0, 5, 13);
  }

  setLights() {
    // Hemisphere light
    this.hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0.9);
    this.hemiLight.position.set(0, 30, 0);
    this.scene.add(this.hemiLight);

    // Directional light
    this.dirLight = new THREE.DirectionalLight(0xffe5c9, 2.8);
    this.dirLight.position.set(0, 60, 150);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.bias = -0.0001;
    this.dirLight.shadow.camera.far = 900;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.radius = 62;
    this.scene.add(this.dirLight);

    // Spotlight
    this.spotlight = new THREE.SpotLight(0xff9940, 1.5);
    this.spotlight.castShadow = true;
    this.spotlight.shadow.radius = 8;
    this.spotlight.shadow.mapSize.width = 2048;
    this.spotlight.shadow.mapSize.heihgt = 2048;
    this.scene.add(this.spotlight);
  }

  addObjects() {
    // Add ground to the scene and physics world
    this.ground = new Ground(this.scene, this.world);

    // New instance of the car
    this.car = new Car(this.scene, this.world, {
      materials: [this.ground.groundMaterial]
    });

    // this.car.wheelTest()
  }

  updatePhysics() {
    this.world.step(1 / 60, 0.035, 3);
    // console.log(this.car.raycastVehicle.chassisBody.position)
    // console.log(this.car.wheelBodies[0].position)

    this.car.updatePhysics()
  }

  render() {
    this.updatePhysics();
    // Look at the car position
    // this.camera.lookAt(
    //   this.car.car.position.x ,
    //   this.car.car.position.y,
    //   this.car.car.position.z
    // );

    // Set camera to follow the car
    // this.camera.position.set(
    //   this.car.car.position.x,
    //   this.car.car.position.y + 5,
    //   this.car.car.position.z + 15
    // )

    // Update the spotlight position and set it to camera's position
    this.spotlight.position.set(
      this.camera.position.x + 20,
      this.camera.position.y + 220,
      this.camera.position.z + 20
    );

    this.controls.update();

    this.composer.render();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
