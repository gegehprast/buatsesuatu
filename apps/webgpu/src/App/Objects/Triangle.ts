import { mat4, vec3 } from 'gl-matrix'
import { TriangleMesh } from '../Meshes/TriangleMesh'
import { Object } from '../Interfaces/Object'

export class Triangle implements Object {
    public position: vec3

    public model: mat4

    public mesh: TriangleMesh

    constructor(position: vec3) {
        this.position = position
        this.model = mat4.create()
        this.mesh = new TriangleMesh()
    }
    
    public build() {
        this.mesh.build()
    }

    public update() {
        this.model = mat4.create()
        mat4.translate(this.model, this.model, this.position)
    }
}
