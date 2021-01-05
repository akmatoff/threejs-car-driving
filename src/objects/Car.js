import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";
import * as CANNON from 'cannon'

// Obj files
const vehicle = require("../../assets/models/car_v-1.obj");
const wheel = require("../../assets/models/wheel.obj");
const wheelRotated = require("../../assets/models/wheel_rotated.obj");

export default class Car {
  constructor(scene, world, {materials = []} = {}) {
    this.scene = scene;
    this.world = world
    this.materials = materials

    this.wheelObjects = [];

    // Group for car (body and wheels)
    this.car = new THREE.Group()
    this.carBody = new THREE.Object3D()
    
    this.scene.add(this.car)

    this.load();
    this.loadWheels();
    this.addCarPhysics()        

  }

  load() {
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );

    this.carCamera = new THREE.CubeCamera(0.5, 5000, cubeRenderTarget)
    this.carCamera.scale.set(0.03, 0.03, 0.03)

    this.scene.add(this.carCamera)

    // Object loader
    this.objLoader = new OBJLoader();
    this.objLoader.load(vehicle, (obj) => {
      obj.castShadow = true;
      obj.receiveShadow = true;

      // Custom materials for the vehicle
      this.engineMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
      this.engineMat.shininess = 250;
      this.bodyMat = new THREE.MeshPhongMaterial({ 
        color: 0xe04000, 
        // envMap: this.carCamera.renderTarget.texture, 
        reflectivity: 1 });
      this.bodyMat.shininess = 200;
      this.bodyMat.combine = 10;
      this.windowMat = new THREE.MeshPhongMaterial({
        color: 0x090909,
        envMap: this.carCamera.renderTarget.texture,
        opacity: 0.80,
        transparent: true,
        shininess: 100,
        reflectivity: 1,
        envMap: this.scene.background,
        combine: THREE.MixOperation
      });
      this.metalMat = new THREE.MeshPhongMaterial({ color: 0xdedede })
      this.cabinMat = new THREE.MeshLambertMaterial({ color: 0x090909 })

      // Loop through nodes and assign materials
      obj.traverse((n) => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
          n.material[0] = this.metalMat
          n.material[1] = this.cabinMat
          n.material[2] = this.cabinMat
          n.material[3] = this.cabinMat
          n.material[4] = this.bodyMat;
          n.material[5] = this.engineMat
          n.material[6] = this.windowMat;
          n.material[7] = this.engineMat;
          if(n.material.map) n.material.map.anisotropy = 16;
        }
      });

      // Position & scale
      obj.scale.set(0.03, 0.03, 0.03);
      obj.position.set(0, 2, 0);

      // Add to the group
      this.car.add(obj);
      this.carBody = obj;
    });
  }

  loadWheels() {
    for (let i = 0; i < 4; i++) {
      let w = i <= 1 ? wheel : wheelRotated

      this.objLoader.load(w, (obj) => {

        obj.castShadow = true;
        obj.receiveShadow = true;
        
        // Custom materials for wheels
        this.tireMat = new THREE.MeshLambertMaterial({ color: 0x131414 });
        this.rimMat = new THREE.MeshPhongMaterial({ color: 0xdedede });
        this.rimMat.shininess = 50;
        
        obj.traverse((n) => {
          if (n.isMesh) {
            n.castShadow = true;
            n.receiveShadow = true;
            n.material[0] = this.tireMat;
            n.material[1] = this.rimMat;
          }
        });

        obj.scale.set(0.03, 0.03, 0.03); // make the wheels smaller
        // obj.position.set(i % 2 == 0 ? 2.5 : -2.5, 1, i < 2 ? 4.2 : -4.0); // set the position of the wheel
        // obj.position.copy(this.wheelBodies[i].position)
        // i % 2 !== 0 ? obj.rotation.z = Math.PI : obj.rotation.z = 0 // Rotate the wheel if it's on other side

        this.wheelObjects.push(obj);
        this.car.add(obj);
      });
    }
  }

  addCarPhysics() {
    this.wheelMaterial = new CANNON.Material('wheelMaterial');

    this.bodyMaterial = new CANNON.Material('bodyMaterial')

    // Contact materials
    this.wheelGroundContactMaterial = new CANNON.ContactMaterial(this.wheelMaterial, this.materials[0], {
      friction: 0.3,
      restitution: 0,
      contactEquationStiffness: 10000
    })

    this.bodyGroundContactMaterial = new CANNON.ContactMaterial(this.bodyMaterial, this.materials[0], {
      friction: 0.1,
      restitution: 0,
      contactEquationStiffness: 10000
    })

    this.world.addContactMaterial(this.wheelGroundContactMaterial)
    this.world.addContactMaterial(this.bodyGroundContactMaterial)

    this.chassisShape = new CANNON.Box(new CANNON.Vec3(4.5, 4.5, 8.3))
    this.chassisBody = new CANNON.Body({mass: 2000})
    this.chassisBody.addShape(this.chassisShape)
    this.chassisBody.position.set(0, 6, -100)
    this.chassisBody.angularVelocity.set(-0.2, 0, 0);

    // Wheel options
    this.options = {
      radius: 3.75,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 30,
      suspensionRestLength: 0.87,
      frictionSlip: 5,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 200000,
      rollInfluence:  0.01,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(),
      maxSuspensionTravel: 0.3,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true
    };

    // Create the vehicle
    this.raycastVehicle = new CANNON.RaycastVehicle({
      chassisBody: this.chassisBody,
      indexRightAxis: 0,
      indexUpAxis: 1,
      indexForwardAxis: 2,
    })

    for (let i = 0; i < 4; i++) {
      this.options.chassisConnectionPointLocal.set(i === 0 || i === 1 ? 2.4 : -2.4, -0.1, i === 0 || i === 2 ? 4.2 : -4.0)
      this.raycastVehicle.addWheel(this.options)
    }

    this.raycastVehicle.addToWorld(this.world)

    this.wheelBodies = [];

    this.raycastVehicle.wheelInfos.forEach((wheel) => {
      this.cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius - 0.2, 60);
      this.wheelBody = new CANNON.Body({
        mass: 1, 
        material: this.wheelMaterial,
      })

      const q = new CANNON.Quaternion();
			q.setFromAxisAngle(new CANNON.Vec3(0, 1, 1), Math.PI / 2);
      
      this.wheelBody.addShape(this.cylinderShape, new CANNON.Vec3(), q);
      this.wheelBodies.push(this.wheelBody);
      this.world.addBody(this.wheelBody);
    })

    // Update wheels
    this.world.addEventListener('postStep', () => {
      for (let i = 0; i < this.raycastVehicle.wheelInfos.length; i++) {
          this.raycastVehicle.updateWheelTransform(i);
          let t = this.raycastVehicle.wheelInfos[i].worldTransform;
          let wheelBody = this.wheelBodies[i];
          wheelBody.position.copy(t.position);
          wheelBody.quaternion.copy(t.quaternion);
      }
    });

    // Vehicle handler
    this.maxSteerValue = 0.4;
    this.maxForce = 1400;
    this.brakeForce = 120;

    document.onkeydown = () => this.handler()

    document.onkeyup = () => this.handler()
    
  }

  handler() {

    const e = window.event;
    var up = (e.type === 'keyup');

    if (!up && e.type !== 'keydown') {
      return;
    }

    this.raycastVehicle.setBrake(0, 0);
    this.raycastVehicle.setBrake(0, 1);
    this.raycastVehicle.setBrake(0, 2);
    this.raycastVehicle.setBrake(0, 3);

    switch (e.keyCode) {
      
      case 87: // W
        this.raycastVehicle.applyEngineForce(up ? 0 : this.maxForce, 0);
        this.raycastVehicle.applyEngineForce(up ? 0 : this.maxForce, 1);
        break;
      
      case 83: // S
        this.raycastVehicle.applyEngineForce(up ? 0 : -this.maxForce, 0);
        this.raycastVehicle.applyEngineForce(up ? 0 : -this.maxForce, 1);
        break;

      case 32: // Spacebar
        this.raycastVehicle.setBrake(this.brakeForce, 0);
        this.raycastVehicle.setBrake(this.brakeForce, 1);
        break;

      case 68: // D
        this.raycastVehicle.setSteeringValue(up ? 0 : -this.maxSteerValue, 3);
        this.raycastVehicle.setSteeringValue(up ? 0 : -this.maxSteerValue, 1);
        break;
  
      case 65: // A
        this.raycastVehicle.setSteeringValue(up ? 0 : this.maxSteerValue, 3);
        this.raycastVehicle.setSteeringValue(up ? 0 : this.maxSteerValue, 1);
        break;

    }
    
  }

  updateWheels() {
    let i = 0;
    this.wheelObjects.forEach((wheel) => {
      let t = this.raycastVehicle.wheelInfos[i].worldTransform;
      wheel.position.copy(t.position)
      wheel.quaternion.copy(t.quaternion)
      // if (i === 0 || i === 2) wheel.rotation.z = Math.PI
      i++;
    })
  }

  updateCar() {
    this.carBody.position.copy(this.chassisBody.position)
    this.carBody.quaternion.copy(this.chassisBody.quaternion)    

    this.carCamera.position.copy(this.car.position)

  }

  updatePhysics() {

    this.updateCar()
    this.updateWheels()

  }

}
