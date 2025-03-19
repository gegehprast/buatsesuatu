import { vec3, mat4 } from 'gl-matrix'
import { degToRad } from './math'

export class Camera {
    public position: vec3
    public eulers: vec3
    public view: mat4
    public forwards: vec3
    public right: vec3
    public up: vec3

    constructor(position: vec3, theta: number, phi: number) {
        this.position = position
        this.eulers = [0, phi, theta]
        this.view = mat4.create()
        this.forwards = vec3.create()
        this.right = vec3.create()
        this.up = vec3.create()
    }

    public update() {
        // prettier-ignore
        this.forwards = [
            Math.cos(degToRad(this.eulers[2])) * Math.cos(degToRad(this.eulers[1])),
            Math.sin(degToRad(this.eulers[2])) * Math.cos(degToRad(this.eulers[1])),
            Math.sin(degToRad(this.eulers[1])),
        ]

        vec3.cross(this.right, this.forwards, [0, 0, 1])

        vec3.cross(this.up, this.right, this.forwards)

        const target = vec3.create()
        vec3.add(target, this.position, this.forwards)

        this.view = mat4.create()
        mat4.lookAt(this.view, this.position, target, this.up)
    }

    public getView(): mat4 {
        return this.view
    }
}
