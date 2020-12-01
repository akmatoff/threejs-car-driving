import { OBJLoader } from "three-obj-mtl-loader";
import * as THREE from "three";
import path from "path";

const vehicle = path.join("/assets/models/car.obj");
const wheel = path.join("/assets/models/wheel.obj");

export default class Car {
  constructor(scene) {
    this.scene = scene;

    this.load();
    this.loadWheels();
  }

  load() {
    this.objLoader = new OBJLoader();
    this.objLoader.load(vehicle, (obj) => {
      obj.castShadow = true;
      obj.receiveShadow = true;

      this.engineMat = new THREE.MeshLambertMaterial({ color: 0xcad7eb });
      this.bodyMat = new THREE.MeshLambertMaterial({ color: 0xff9d00 });
      this.windowMat = new THREE.MeshLambertMaterial({
        color: 0x353538,
        opacity: 0.93,
        transparent: true
      });

      obj.traverse((n) => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
          n.material[0] = this.engineMat;
          n.material[1] = this.bodyMat;
          n.material[2] = this.windowMat;
        }
      });

      obj.scale.set(0.03, 0.03, 0.03);
      obj.position.set(0, 0, 0);
      console.log("Object", obj);
      this.scene.add(obj);
    });
  }

  loadWheels() {
    this.objLoader.load(wheel, (obj) => {
      obj.castShadow = true;
      obj.receiveShadow = true;

      this.tireMat = new THREE.MeshLambertMaterial({ color: 0x131414 });
      this.rimMat = new THREE.MeshPhongMaterial({ color: 0x171717 });

      obj.traverse((n) => {
        if (n.isMesh) {
          n.castSHadow = true;
          n.receiveShadow = true;
          n.material[0] = this.tireMat;
          n.material[1] = this.rimMat;
        }
      });

      obj.scale.set(0.03, 0.03, 0.03);
      obj.position.set(1.3, 1, 4);

      this.scene.add(obj);
    });
  }
}
