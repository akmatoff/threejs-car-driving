import * as THREE from "three";

export default class Ground {
  constructor(scene) {
    this.scene = scene;
    this.init();
  }

  init() {
    this.groundMat = new THREE.MeshPhongMaterial({ color: 0x666c75 });
    this.groundGeo = new THREE.BoxBufferGeometry(15000, 5, 15000);
    this.ground = new THREE.Mesh(this.groundGeo, this.groundMat);
    this.ground.position.y = -2.75;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }
}
