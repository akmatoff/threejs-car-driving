import { OBJLoader } from "three-obj-mtl-loader";
import * as THREE from "three";

// Obj files
const vehicle = require("../assets/models/car.obj");
const wheel = require("../assets/models/wheel.obj");

export default class Car {
  constructor(scene) {
    this.scene = scene;

    this.load();
    this.loadWheels();

    // Group for car (body and wheels)
    this.car = new THREE.Group()
    this.scene.add(this.car)
  }

  load() {
    this.objLoader = new OBJLoader();
    this.objLoader.load(vehicle, (obj) => {
      obj.castShadow = true;
      obj.receiveShadow = true;

      // Custom materials for the vehicle
      this.engineMat = new THREE.MeshPhongMaterial({ color: 0x080808 });
      this.engineMat.shininess = 600;
      this.bodyMat = new THREE.MeshPhongMaterial({ color: 0xe06a10 });
      this.bodyMat.shininess = 500;
      this.windowMat = new THREE.MeshPhongMaterial({
        color: 0x080808,
        opacity: 0.90,
        transparent: true
      });

      obj.traverse((n) => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
          n.material[0] = this.engineMat;
          n.material[1] = this.bodyMat;
          n.material[2] = this.windowMat;
          if(n.material.map) n.material.map.anisotropy = 16;
        }
      });

      obj.scale.set(0.03, 0.03, 0.03);
      obj.position.set(0, 0, 0);

      this.car.add(obj);
    });
  }

  loadWheels() {
    for (let i = 1; i <= 4; i++) {
      this.objLoader.load(wheel, (obj) => {
        obj.castShadow = true;
        obj.receiveShadow = true;
        
        // Custom materials for wheels
        this.tireMat = new THREE.MeshLambertMaterial({ color: 0x131414 });
        this.rimMat = new THREE.MeshPhongMaterial({ color: 0xf7f3f0 });
        this.rimMat.shininess = 50;
  
        obj.traverse((n) => {
          if (n.isMesh) {
            n.castShadow = true;
            n.receiveShadow = true;
            n.material[0] = this.tireMat;
            n.material[1] = this.rimMat;
          }
        });
        
        this.flip = false;

        obj.scale.set(0.03, 0.03, 0.03); // make the wheels smaller
        obj.position.set(i % 2 == 0 ? 2.63 : -2.63, 1, i <= 2 ? 4 : -4.2); // set the position of the wheel
        i % 2 != 0 ? obj.rotation.z = Math.PI : 0 // Rotate the wheel if it's on other side
  
        this.car.add(obj);
      });
    }
    
  }
}
