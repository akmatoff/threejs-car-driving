import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import Car from "./objects/Car";
import Ground from "./objects/Ground";

export default class Scene {
  constructor() {
    this.init();
  }

  addEvents() {
    window.addEventListener("resize", this.onWindowResize);
  }

  init() {
    // Initialise the physics world
    this.world = new CANNON.World();
    this.world.broadphase = new CANNON.SAPBroadphase(this.world); // Change the collision detection method
    this.world.gravity.set(0, -10, 0);
    // this.world.defaultContactMaterial.friction = 0;
    console.log(this.world.defaultContactMaterial)

    // Clock
    this.clock = new THREE.Clock();

    // Create the THREE Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x6c9bd9);
    this.scene.fog = new THREE.FogExp2(0x6c9bd9, 0.004);

    this.setCamera();
    this.setLights();
    this.addObjects();
    this.setRenderer();
    this.addEvents();
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.42;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setAnimationLoop(() => {
      this.render();
    }); // Render loop

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Passes
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.1, 0.1, 0.3)
    this.smaaPass = new SMAAPass(window.innerWidth, window.innerHeight);

    this.fxaaPass = new ShaderPass(FXAAShader);

    const pixelRatio = this.renderer.getPixelRatio();

    this.fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio );
    this.fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio );

    this.gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);

    // Composer
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.gammaCorrectionPass);
    this.composer.addPass(this.unrealBloomPass);
    this.composer.addPass(this.smaaPass);
    this.composer.addPass(this.fxaaPass);

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
    this.hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 1.2);
    this.hemiLight.position.set(0, 1, 0);
    this.scene.add(this.hemiLight);

    // Directional light
    this.dirLight = new THREE.DirectionalLight(0xffe5c9, 3.2);
    this.dirLight.position.set(100, 100, 100);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.bias = -0.0001;
    this.dirLight.shadow.camera.far = 900;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.radius = 62;
    this.scene.add(this.dirLight);

    // Spotlight
    this.spotlight = new THREE.SpotLight(0xff9940, 0);
    this.spotlight.power = 5
    this.spotlight.penumbra = 0.8
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

  }

  updatePhysics() {
    this.world.step(1 / 60, 0.035, 3);

    this.car.updatePhysics()
  }

  render() {
    this.updatePhysics();

    // Update the spotlight position and set it to camera's position
    this.spotlight.position.set(
      this.camera.position.x + 5,
      this.camera.position.y + 5,
      this.camera.position.z + 5
    );

    this.spotlight.quaternion.copy(this.camera.quaternion)

    if (this.camera.position.y < 2) this.camera.position.y = 2

    this.ground.groundCamera.update(this.renderer, this.scene)
    this.car.carCamera.update(this.renderer, this.scene)

    this.controls.update();

    this.composer.render(this.clock.getDelta());
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    console.log('resize')
  }
}
