import {OBJLoader, MTLLoader} from 'three-obj-mtl-loader'

export default class Car {
    constructor(scene) {        
        this.scene = scene

        this.load()
    }

    load() {
        this.objLoader = new OBJLoader()
        this.mtlLoader = new MTLLoader()
        
        this.mtlLoader.load('../assets/models/Muscle.mtl', (materials) => {
            materials.preload()

            this.objLoader.setMaterials(materials)
            this.objLoader.load('../assets/models/Muscle.obj', (obj) => {
                obj.traverse((n) => {
                    if (n.isMesh) {
                        n.castShadow = true
                        n.receiveShadow = true
                    }
                })
                this.scene.add(obj)
            })
        })

    }
}