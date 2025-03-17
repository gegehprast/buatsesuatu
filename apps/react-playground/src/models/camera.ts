import { vec3, mat4 } from 'gl-matrix'
import { degToRad } from './math'

export class Camera {
    position: vec3
    eulers: vec3
    view: mat4
    forwards: vec3
    right: vec3
    up: vec3    

    constructor(position: vec3, theta: number, phi: number) {
        this.position = position
        this.eulers = [0, phi, theta]
        this.view = mat4.create()
    }

    update() {
        this.eulers[2] += 1
        this.eulers[2] %= 360

        mat4.translate(this.view, this.view, this.position)
        mat4.rotateZ(this.view, this.view, degToRad(this.eulers[2]))
    }

    getModel(): mat4 {
        return this.view
    }
}
