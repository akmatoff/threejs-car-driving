const FBXLoader = require('three-fbx-loader')

export default class Car {
    constructor(scene) {
        
        this.scene = scene

        this.load()
    }

    load() {
        this.loader = new FBXLoader()
        this.loader.load('assets/models/vehicle/SportCar20.fbx', (obj) => {
            obj.traverse((n) => {
                if (n.isMesh) {
                    n.castShadow = true
                    n.receiveShadow = true
                }
            })
            obj.position.set(0, 0, 0)
            scene.add(obj)
        })

    }
}