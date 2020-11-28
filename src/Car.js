const FBXLoader = require('three-fbx-loader')

export default class Car {
    constructor(scene) {        
        this.scene = scene

        this.load()
    }

    load() {
        this.loader = new FBXLoader()
        this.loader.load('../assets/models/vehicle/SportCar20.FBX', (obj) => {
            obj.traverse((n) => {
                if (n.isMesh) {
                    n.castShadow = true
                    n.receiveShadow = true
                }
            })
        
            this.scene.add(obj)
        }, null, (err) => console.log(err))

    }
}