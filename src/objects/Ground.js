import * as THREE from "three";
import * as CANNON from 'cannon'

export default class Ground {
  constructor(scene, world) {
    this.world = world;
    this.scene = scene;

    this.init();
    this.addGroundPhysics();
  }

  init() {
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );

    // Create ground visuals 
    this.groundGeo = new THREE.BoxBufferGeometry(15000, 5, 15000);
    this.groundCamera = new THREE.CubeCamera(0.1, 500, cubeRenderTarget);
    this.groundCamera.renderTarget.texture.width = window.innerWidth * window.devicePixelRatio;
    this.groundCamera.renderTarget.texture.height = window.innerHeight * window.devicePixelRatio;
    this.groundMat = new THREE.MeshPhongMaterial({ 
      color: 0x666c75, 
      // envMap: this.groundCamera.renderTarget.texture, 
      reflectivity: 0.5 });
    this.ground = new THREE.Mesh(this.groundGeo, this.groundMat)
    this.groundCamera.position.copy(this.ground.position)
    this.scene.add(this.groundCamera)
    
    this.ground.receiveShadow = true
    
    this.scene.add(this.ground)
  }

  addGroundPhysics() {
    // Create ground plane physics
    this.groundMaterial = new CANNON.Material('groundMaterial')
    this.groundMaterial.friction = 0.3

    this.groundShape = new CANNON.Plane()
    this.groundBody = new CANNON.Body({
      mass: 0, 
      shape: this.groundShape,
      material: this.groundMaterial,
      position: new CANNON.Vec3(0, -2, 0),
    })

    this.groundBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );

    this.ground.position.copy(this.groundBody.position)

    this.world.add(this.groundBody)
  }
}
