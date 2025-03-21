import { vec3, mat4 } from 'gl-matrix'

export class Quad {
    private position: vec3
    
    private model: mat4

    constructor(position: vec3) {
        this.position = position
        this.model = mat4.create()
    }

    public update() {
        this.model = mat4.create()
        mat4.translate(this.model, this.model, this.position)
    }

    public getModel(): mat4 {
        return this.model
    }
}
