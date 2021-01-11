import * as THREE from "three";
import * as CANNON from "cannon";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
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
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.init();
  }

  addEvents() {
    window.addEventListener("resize", () => {
      this.onWindowResize();
    });

    window.addEventListener("mousemove", () => {
      this.onMouseMove();
    })

    window.addEventListener("mousedown", () => {
      this.onMouseDown();
    })
  }

  init() {
    // Initialise the physics world
    this.world = new CANNON.World();
    this.world.broadphase = new CANNON.SAPBroadphase(this.world); // Change the collision detection method
    this.world.gravity.set(0, -9.82, 0);
    this.world.defaultContactMaterial.friction = 0

    // Clock
    this.clock = new THREE.Clock();

    this.timeStep = 1 / 30;

    // Create the THREE Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x6c9bd9);
    this.scene.fog = new THREE.FogExp2(0x6c9bd9, 0.005);

    this.addEvents();
    this.setCamera();
    this.setLights();
    this.addObjects();
    this.setRenderer();
    this.render()
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.9;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setAnimationLoop(() => {
      this.render();
    }); // Render loop

    // Controls
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    // Passes
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.15, 1, 0.1)
    this.smaaPass = new SMAAPass(window.innerWidth, window.innerHeight);

    this.fxaaPass = new ShaderPass(FXAAShader);

    const pixelRatio = this.renderer.getPixelRatio();

    this.fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio );
    this.fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio );

    this.gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);

    // Composer
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.smaaPass);
    this.composer.addPass(this.gammaCorrectionPass);
    this.composer.addPass(this.unrealBloomPass);
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

    this.camera.position.set(0, 5, -80);

    this.currentLookPos = new THREE.Vector3()
    this.currentCamPos = new THREE.Vector3()

    this.rotationSpeed = 0.05;

    this.camera.lookAt(this.currentLookPos);
  }

  setLights() {
    // Hemisphere light
    this.hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0.3);
    this.hemiLight.position.set(0, 0.5, 0);
    this.scene.add(this.hemiLight);

    // Directional light
    this.dirLight = new THREE.DirectionalLight(0xffe5c9, 0.8);
    this.dirLight.position.set(0, 1000, 200);
    this.dirLight.target.position.set(0, 0, -100)
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.bias = -0.0001;
    this.dirLight.shadow.camera.left = 500;
    this.dirLight.shadow.camera.right = -500;
    this.dirLight.shadow.camera.bottom = -100;
    this.dirLight.shadow.camera.top = 100;
    this.dirLight.shadow.camera.far = 5000;
    this.dirLight.shadow.camera.near = 0.5;
    this.scene.add(this.dirLight)

    this.dirLightHelper = new THREE.DirectionalLightHelper(this.dirLight)
    // this.scene.add(this.dirLightHelper)

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
    this.car.updatePhysics()
    this.world.step(this.timeStep);
  }

  updateCamera() {
    this.lookPos = new THREE.Vector3(
      this.car.carBody.position.x,
      this.car.carBody.position.y,
      this.car.carBody.position.z
    );
    
    // this.lookPos.applyQuaternion(this.car.carBody.quaternion)
    // this.lookPos.add(this.car.carBody.position)

    this.currentLookPos.lerp(this.lookPos, 0.15)

    this.camPos = new THREE.Vector3(
      this.car.carBody.position.x,
      this.car.carBody.position.y + 3,
      this.car.carBody.position.z + 18
    )
    

    this.currentCamPos.lerp(this.camPos, 0.15)

    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookPos);

    if (this.camera.position.y < 2) this.camera.position.y = 2

  }

  render() {
    this.updatePhysics();
    this.updateCamera();

    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Objects update
    this.ground.groundCamera.update(this.renderer, this.scene)
    this.car.carCamera.update(this.renderer, this.scene)
  

    // Controls update
    // this.controls.update();
    // this.controls.target.copy(this.car.carBody.position) // Set the center of the control to the car

    this.composer.render(this.clock.getDelta());
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove() {

    // If mouse is locked
    if (document.pointerLockElement === this.renderer.domElement) {
      const e = window.event;

      this.currentCamPos.x = this.currentCamPos.x + -Math.cos(this.rotationSpeed * Math.PI) * e.movementX * 0.2;
      this.currentCamPos.z = this.currentCamPos.z + Math.sin(this.rotationSpeed * Math.PI) * e.movementX * 0.2;

    } 
    
  }

  onMouseDown() {
    // Lock the mouse on click 
    this.renderer.domElement.requestPointerLock();
  }
}
