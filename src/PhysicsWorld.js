import * as CANNON from "cannon";

export default class PhysicsWorld {
    constructor() {
        this.init()
    }

    init() {
        // Initialise the physics world
        this.world = new CANNON.World();
        this.world.broadphase = new CANNON.SAPBroadphase(this.world); // Change the collision detection method
        this.world.gravity.set(0, 0, -9.82);

        // Ground material
        this.groundMaterial = new CANNON.Material('groudMaterial')
    }

    updatePhysics() {
        this.world.step(1 / 60)
    }
}