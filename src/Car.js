import { OBJLoader } from "../node_modules/three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";
import vehicle from "../assets/models/car.obj";
import wheel from "../assets/models/wheel.obj";

export default class Car {
  constructor(scene) {
    this.scene = scene;

    this.load();
    this.loadWheels();
  }

  load() {
    this.objLoader = new OBJLoader();
    this.objLoader.load(
      vehicle,
      (obj) => {
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
      },
      (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
      (err) => console.error(err)
    );
  }

  loadWheels() {
    this.objLoader.load(wheel, (obj) => {
      obj.castShadow = true;
      obj.receiveSadow = true;
      obj.scale.set(10, 10, 10);
      obj.traverse((n) => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
        }
      });
      console.log(obj);
      this.scene.add(obj);
    });
  }
}
