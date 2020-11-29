const THREE = require('three')
const OBJLoader = require('three-obj-loader')
OBJLoader(THREE)

export default class Car {
    constructor(scene) {        
        this.scene = scene

        this.load()
    }

    load() {
        const material = new THREE.MeshPhongMaterial({color: 0xFFcc00})
        this.loader = new THREE.OBJLoader()
        this.loader.load('../assets/models/vehicle_model.obj', (obj) => {
            obj.traverse((n) => {
                if (n.isMesh) {
                    n.castShadow = true
                    n.receiveShadow = true
                    n.material[0] = material
                }
            })
    
            console.log(obj)
            this.scene.add(obj)
        }, null, (err) => console.log(err))

    }
}