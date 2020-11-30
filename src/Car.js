import { MTLLoader } from '../node_modules/three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from '../node_modules/three/examples/jsm/loaders/OBJLoader'
import * as THREE from 'three'
import vehicle from '../assets/models/Muscle.obj'
import vehicleMat from '../assets/models/Muscle.mtl'

export default class Car {
    constructor(scene) {        
        this.scene = scene

        this.load()
    }

    load() {
        this.mtlLoader = new MTLLoader()
        this.mtlLoader.load(vehicleMat, (materials) => {
            materials.preload()

            this.objLoader = new OBJLoader()
            this.objLoader.setMaterials(materials)
            this.objLoader.load(vehicle, (obj) => {
                obj.castShadow = true
                obj.receiveShadow = true
                
                this.customMat = new THREE.MeshPhongMaterial({color: 0xFF0000})

                obj.traverse((n) => {
                    if (n.isMesh) {
                        n.castShadow = true
                        n.receiveShadow = true
                    }
                })

                obj.scale.set(0.03, 0.03, 0.03)
                obj.position.set(0,0,0)
                console.log('Object', obj)
                this.scene.add(obj)
            }, 
            (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'), 
            (err) => console.error(err))

        })

    }
}