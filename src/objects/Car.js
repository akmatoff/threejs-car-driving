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

    this.wheelObjects = [];

    this.testWheel = new THREE.Object3D()

    // Group for car (body and wheels)
    this.car = new THREE.Group()
    
    this.scene.add(this.car)

    this.load();
    this.loadWheels();
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
        obj.position.set(i % 2 == 0 ? 2.5 : -2.5, 1, i < 2 ? 4.2 : -4.0); // set the position of the wheel
        obj.position.copy(this.wheelBodies[i].position)
        
        i % 2 != 0 ? obj.rotation.z = Math.PI : 0 // Rotate the wheel if it's on other side
        
        this.wheelObjects.push(obj);
        this.car.add(obj);
      });
    }
    
  }

  addCarPhysics() {
    this.wheelMaterial = new CANNON.Material('wheelMaterial')
    this.carMaterial = new CANNON.Material('carMaterial')

    // Contact materials
    this.wheelGroundContactMaterial = new CANNON.ContactMaterial(this.wheelMaterial, this.materials[0], {
      friction: 0.3,
      restitution: 0,
      contactEquationStiffness: 3000
    })


    this.world.addContactMaterial(this.wheelGroundContactMaterial)
 
    this.chassisShape = new CANNON.Box(new CANNON.Vec3(4.5, 2.3, 8.3))
    this.chassisBody = new CANNON.Body({mass: 1500, material: this.carMaterial})
    // this.chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1), Math.PI / 2)
    this.chassisBody.addShape(this.chassisShape)
    this.chassisBody.position.set(0, 3, 0)

    // Wheel options
    this.options = {
      radius: 0.7,
      directionLocal: new CANNON.Vec3(0, -1, 0),
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
      useCustomSlidingRotationalSpeed: true
    };

    // Create the vehicle
    this.raycastVehicle = new CANNON.RaycastVehicle({
      chassisBody: this.chassisBody,
      indexRightAxis: 0,
      indexUpAxis: 1,
      indexForwardAxis: 2,
    })

    for (let i = 1; i <= 4; i++) {
      this.options.chassisConnectionPointLocal.set(i % 2 == 0 ? 2.5 : -2.5, -1.5, i <= 2 ? 4.2 : -4.0)
      this.raycastVehicle.addWheel(this.options)
    }

    
    this.raycastVehicle.addToWorld(this.world)

    this.wheelBodies = [];

    this.raycastVehicle.wheelInfos.forEach((wheel) => {
      var cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 45);
      this.wheelBody = new CANNON.Body({
        mass: 20, 
        material: this.wheelMaterial, 
      })
 
      var q = new CANNON.Quaternion();
      q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2)
      this.wheelBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
      this.wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
      this.wheelBodies.push(this.wheelBody);
      this.world.addBody(this.wheelBody);

    })

    // Update wheels
    this.world.addEventListener('postStep', () => {
      for (var i = 0; i < this.raycastVehicle.wheelInfos.length; i++) {
          this.raycastVehicle.updateWheelTransform(i);
          var t = this.raycastVehicle.wheelInfos[i].worldTransform;
          var wheelBody = this.wheelBodies[i];
          wheelBody.position.copy(t.position);
          wheelBody.quaternion.copy(t.quaternion);
      }
    });


    // Vehicle handler
    this.maxSteerValue = 0.7;
    this.maxForce = 1000;
    this.brakeForce = 100000;

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
    maxSteerValue = 0.7
  } = {}) {
    const e = window.event;
    var up = (e.type === 'keyup');

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



  wheelTest() {
    var radius = 3.73
    var cylinderShape = new CANNON.Cylinder(radius, radius, radius, 45);
    this.wheelBody = new CANNON.Body({
      mass: 20, 
      material: this.wheelMaterial, 
    })

    var q = new CANNON.Quaternion();
    q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2)
    this.wheelBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    this.wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
    this.wheelBody.position.y = 15;
    this.world.addBody(this.wheelBody)

    this.objLoader.load(wheel, (obj) => {
      obj.scale.set(0.03, 0.03, 0.03)
      this.scene.add(obj)
      this.testWheel = obj;
    })
  }

  wheelTestUpdate() {
    this.testWheel.position.copy(this.wheelBody.position)
    this.testWheel.quaternion.copy(this.wheelBody.quaternion)
  }
}
