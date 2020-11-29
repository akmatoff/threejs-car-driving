import * as THREE from 'three'
import * as CANNON from 'cannon'
import Car from './Car'

export default class Scene {
    constructor() {
        this.init()
        this.addEvents()
    }

    addEvents() {
        window.addEventListener('resize', () => this.onWindowResize)
    }

    init() {
        // Initialise the physics world
        this.world = new CANNON.World()
        this.world.gravity.set(0, 0, -9.82)

        // Create the THREE Scene
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xFFFFFF)   
        this.scene.fog = new THREE.FogExp2(0xFFFFFF, 0.002)
        this.addObjects()
        this.setCamera()
        this.setRenderer()
        this.setLights()    
    }

    setRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        })

        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.shadowMap.enabled = true
        this.renderer.setAnimationLoop(() => {this.render()}) // Render 60 fps

        document.body.appendChild(this.renderer.domElement)
    }

    setCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
        this.camera.position.set(0, 5, 15)
    }

    setLights() {
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 1)
        this.scene.add(this.ambientLight)
    }

    addObjects() {
        // New instance of the car
        this.car = new Car(this.scene)
    }

    render() {
        this.camera.lookAt(this.car.scene.position.x, this.car.scene.position.y, this.car.scene.position.z)
        this.renderer.render(this.scene, this.camera)
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

}