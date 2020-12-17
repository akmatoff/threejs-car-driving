import { OBJLoader } from "three-obj-mtl-loader";
import * as THREE from "three";
import * as CANNON from 'cannon'

// Obj files
const vehicle = require("../../assets/models/car_v-1.obj");
const wheel = require("../../assets/models/wheel.obj");

export default class Car {
  constructor(scene, world, {materials = []} = {}) {
    this.scene = scene;
    this.world = world
    this.materials = materials
    this.raycastVehicle;

    this.load();
    this.loadWheels();

    // Group for car (body and wheels)
    this.car = new THREE.Group()
    this.wheelObjects = [];

    this.scene.add(this.car)

    this.addCarPhysics()

  }

  load() {
    // Object loader
    this.objLoader = new OBJLoader();
    this.objLoader.load(vehicle, (obj) => {
      obj.castShadow = true;
      obj.receiveShadow = true;

      // Custom materials for the vehicle
      this.engineMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
      this.engineMat.shininess = 600;
      this.bodyMat = new THREE.MeshPhongMaterial({ color: 0xe04000 });
      this.bodyMat.shininess = 500;
      this.bodyMat.combine = 10;
      this.windowMat = new THREE.MeshPhongMaterial({
        color: 0x090909,
        opacity: 0.80,
        transparent: true,
        shininess: 100,
        reflectivity: 1,
        envMap: this.engineMat.color,
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
    });
  }

  loadWheels() {
    for (let i = 0; i < 4; i++) {
      this.objLoader.load(wheel, (obj) => {
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
        obj.position.set(i % 2 == 0 ? 2.63 : -2.63, 1, i < 2 ? 4.2 : -4.0); // set the position of the wheel

        
        i % 2 != 0 ? obj.rotation.z = Math.PI : 0 // Rotate the wheel if it's on other side
        
        this.wheelObjects.push(obj);
        this.car.add(obj);
      });
    }
    
  }

  addCarPhysics() {
    this.wheelMaterial = new CANNON.Material('wheelMaterial')
    this.carMaterial = new CANNON.Material('carMaterial')
 
    this.chassicShape = new CANNON.Box(new CANNON.Vec3(4.5, 0.7, 7))
    this.chassicBody = new CANNON.Body({mass: 100, material: this.carMaterial})
    // this.chassicBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), -Math.PI / 2)
    this.chassicBody.addShape(this.chassicShape)
    this.chassicBody.position.set(0, 6, 0)
    this.chassicBody.angularVelocity.set(0, 0, 0)

    // Wheel options
    this.options = {
      radius: 3.7,
      directionLocal: new CANNON.Vec3(0, 0, -1),
      suspensionStiffness: 30,
      suspensionRestLength: 0.3,
      frictionSlip: 5,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 100000,
      rollInfluence:  0.01,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(0, 0, 0),
      maxSuspensionTravel: 0.3,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true,
    };

    // Create the vehicle
    this.raycastVehicle = new CANNON.RaycastVehicle({
      chassisBody: this.chassicBody,
      indexRightAxis: 0,
      indexUpAxis: 1,
      indexForwardAxis: 2 
    })

    for (let i = 1; i <= 4; i++) {
      this.options.chassisConnectionPointLocal.set(i % 2 == 0 ? 2.63 : -2.63, 1, i <= 2 ? 4.2 : -4.0)
      this.raycastVehicle.addWheel(this.options)
    }

    this.raycastVehicle.addToWorld(this.world)

    this.wheelBodies = [];

    let i = 0;
    this.raycastVehicle.wheelInfos.forEach((wheel) => {
      var cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 35);
      this.wheelBody = new CANNON.Body({
        mass: 0, 
        angularVelocity: new CANNON.Vec3(0, 0, 0), 
        material: this.wheelMaterial, 
        position: new CANNON.Vec3(0, 0, 0),
        // quaternion: new CANNON.Quaternion(1, 0, 0, Math.PI)
      })
      this.wheelBody.type = CANNON.Body.KINEMATIC;
      // this.wheelBody.collisionFilterGroup = 0; // turn off collisions
      var q = new CANNON.Quaternion();
      q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
      this.wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
      this.wheelBodies.push(this.wheelBody);
      this.world.addBody(this.wheelBody);

      i++;
    })

    // Update wheels
    this.world.addEventListener('postStep', () => {
      for (var i = 0; i < this.raycastVehicle.wheelInfos.length; i++) {
          this.raycastVehicle.updateWheelTransform(i);
          var t = this.raycastVehicle.wheelInfos[i].worldTransform;
          var wheelBody = this.wheelBodies[i];
          wheelBody.position.copy(t.position);
          wheelBody.position.y = 1;
          wheelBody.quaternion.copy(t.quaternion);
      }
    });

    // Contact materials
    this.wheelGroundContactMaterial = new CANNON.ContactMaterial(this.wheelMaterial, this.materials[0], {
      friction: 0.3,
      restitution: 0,
      contactEquationStiffness: 1000
    })

    this.carGroundContactMaterial = new CANNON.ContactMaterial(this.carMaterial, this.materials[0], {
      friction: 0.3,
      restitution: 0.0,
    })

    this.world.addContactMaterial(this.wheelGroundContactMaterial)
    this.world.addContactMaterial(this.carGroundContactMaterial)


    // Vehicle handler
    this.maxSteerValue = 1;
    this.maxForce = 1000;
    this.brakeForce = 10000;

    document.onkeydown = () => this.handler({
      vehicle: this.raycastVehicle,
      maxForce: this.maxForce,
      brakeForce: this.brakeForce,
      maxSteerValue: this.maxSteerValue
    })
    document.onkeyup = () => this.handler({
      vehicle: this.raycastVehicle,
      maxForce: this.maxForce,
      brakeForce: this.brakeForce,
      maxSteerValue: this.maxSteerValue
    })
    
  }

  handler({
    vehicle = null,
    maxForce = 0,
    brakeForce = 0,
    maxSteerValue = 1
  } = {}) {
    const e = window.event;
    var up = (e.type == 'keyup');

    if (!up && e.type !== 'keydown') {
      return;
    }

    vehicle.setBrake(0, 0);
    vehicle.setBrake(0, 1);
    vehicle.setBrake(0, 2);
    vehicle.setBrake(0, 3);

    switch (e.keyCode) {
      
      case 87: // W
        vehicle.applyEngineForce(up ? 0 : maxForce, 0);
        vehicle.applyEngineForce(up ? 0 : maxForce, 1);
        break;
      
      case 83: // S
        vehicle.applyEngineForce(up ? 0 : -maxForce, 0);
        vehicle.applyEngineForce(up ? 0 : -maxForce, 1);
        break;

      case 32: // Spacebar
        vehicle.setBrake(brakeForce, 0);
        vehicle.setBrake(brakeForce, 1);
        vehicle.setBrake(brakeForce, 2);
        vehicle.setBrake(brakeForce, 3);
        break;

      case 68: // right
        vehicle.setSteeringValue(up ? 0 : -maxSteerValue, 2);
        vehicle.setSteeringValue(up ? 0 : -maxSteerValue, 3);
        break;
  
      case 65: // left
        vehicle.setSteeringValue(up ? 0 : maxSteerValue, 2);
        vehicle.setSteeringValue(up ? 0 : maxSteerValue, 3);
        break;

    }
    
  
  }

  updateWheels() {
    let i = 0;
    this.wheelObjects.forEach((wheel) => {
      // wheel.position.copy(this.wheelBodies[i].position)
      wheel.quaternion.copy(this.wheelBodies[i].quaternion)
      i++;
    })
  }

  updateCar() {
    this.car.position.copy(this.raycastVehicle.chassisBody.position)
    this.car.quaternion.copy(this.raycastVehicle.chassisBody.quaternion)
  }

  updatePhysics() {
    this.updateCar()
    this.updateWheels()
  }
}
