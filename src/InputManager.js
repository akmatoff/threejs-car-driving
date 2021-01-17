export class InputManager {
    constructor(raycastVehicle) {
        this.raycastVehicle = raycastVehicle

        this.maxSteerValue = 0.4;
        this.maxForce = 2800;
        this.brakeForce = 300;

        document.onkeydown = () => {
            this.onInput()
        }

        document.onkeyup = () => {
            this.onInput()
        }
    }

    onInput() {

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
            this.raycastVehicle.setBrake(up ? 0 : this.brakeForce, 0);
            this.raycastVehicle.setBrake(up ? 0 : this.brakeForce, 1);
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
}