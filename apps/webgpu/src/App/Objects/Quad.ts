import { mat4, vec3 } from 'gl-matrix'
import { Object } from '../Interfaces/Object'
import { QuadMesh } from '../Meshes/QuadMesh'

export class Quad implements Object {
    public position: vec3

    public model: mat4

    public mesh: QuadMesh

    constructor(position: vec3) {
        this.position = position
        this.model = mat4.create()
        this.mesh = new QuadMesh()
    }
    
    public build() {
        this.mesh.build()
    }

    public update() {
        this.model = mat4.create()
        mat4.translate(this.model, this.model, this.position)
    }
}
