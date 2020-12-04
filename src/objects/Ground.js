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
    // Create ground visuals
    this.groundMat = new THREE.MeshPhongMaterial({ color: 0x666c75 });
    this.groundGeo = new THREE.BoxBufferGeometry(15000, 5, 15000);
    this.ground = new THREE.Mesh(this.groundGeo, this.groundMat);
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }

  addGroundPhysics() {
    // Create ground plane physics
    this.groundMaterial = new CANNON.Material('groundMaterial')
    this.groundShape = new CANNON.Plane()
    this.groundBody = new CANNON.Body({
      mass: 0, 
      shape: this.groundShape,
      material: this.groundMaterial,
      position: new CANNON.Vec3(0, 0, -2.75),
    })

    this.groundBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );

    this.ground.position.copy(this.groundBody.position)
    // this.ground.quaternion.copy(this.groundBody.quaternion)

    this.world.add(this.groundBody)
  }
}
