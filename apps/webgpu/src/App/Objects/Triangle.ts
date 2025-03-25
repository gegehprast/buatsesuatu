import { mat4, vec3 } from 'gl-matrix'
import { TriangleMesh } from '../Meshes/TriangleMesh'
import { Object } from '../Interfaces/Object'

export class Triangle implements Object {
    public position: vec3

    public model: mat4

    public mesh: TriangleMesh

    public rotationX: number

    public rotationY: number

    public rotationZ: number

    constructor(
        position: vec3,
        rotationX: number = 0,
        rotationY: number = 0,
        rotationZ: number = 0
    ) {
        this.position = position
        this.rotationX = rotationX
        this.rotationY = rotationY
        this.rotationZ = rotationZ
        this.model = mat4.create()
        this.mesh = new TriangleMesh()
    }

    public build() {
        this.mesh.build()
    }

    public setRotationX(rotation: number) {
        this.rotationX = rotation
    }

    public setRotationY(rotation: number) {
        console.log(this.rotationY)
        this.rotationY = rotation
    }

    public setRotationZ(rotation: number) {
        this.rotationZ = rotation
    }

    public update() {
        this.model = mat4.create()
        mat4.translate(this.model, this.model, this.position)
        mat4.rotateX(this.model, this.model, this.rotationX)
        mat4.rotateY(this.model, this.model, this.rotationY)
        mat4.rotateZ(this.model, this.model, this.rotationZ)
    }
}
