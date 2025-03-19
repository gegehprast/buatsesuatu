import { vec3, mat4 } from 'gl-matrix'
import { degToRad } from './math'

export class Statue {
    private position: vec3
    private eulers: vec3
    private model: mat4

    constructor(position: vec3, eulers: vec3) {
        this.position = position
        this.eulers = eulers
        this.model = mat4.create()
    }

    public update() {
        this.eulers[2] += 1
        this.eulers[2] %= 360

        this.model = mat4.create()
        mat4.translate(this.model, this.model, this.position)
        mat4.rotateY(this.model, this.model, degToRad(this.eulers[1]))
        mat4.rotateZ(this.model, this.model, degToRad(this.eulers[2]))
    }

    public getModel(): mat4 {
        return this.model
    }
}
