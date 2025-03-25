import { mat4, quat, vec3 } from 'gl-matrix'
import { TriangleMesh } from '../Meshes/TriangleMesh'
import { Object } from '../Interfaces/Object'

export class Triangle implements Object {
    public position: vec3

    public model: mat4

    public mesh: TriangleMesh

    public thetaX: number = 0
    public thetaY: number = 0
    public thetaZ: number = 0

    public rX: mat4 = mat4.create()
    public rY: mat4 = mat4.create()
    public rZ: mat4 = mat4.create()

    constructor(position: vec3) {
        this.position = position
        
        const qX = quat.fromValues(Math.cos(this.thetaX / 2), 0, 0, 0)
        this.rX = mat4.fromQuat(mat4.create(), qX)

        const qY = quat.fromValues(Math.cos(this.thetaY / 2), 0, 0, 0)
        this.rY = mat4.fromQuat(mat4.create(), qY)

        const qZ = quat.fromValues(Math.cos(this.thetaZ / 2), 0, 0, 0)
        this.rZ = mat4.fromQuat(mat4.create(), qZ)
        
        this.model = mat4.create()
        this.mesh = new TriangleMesh()
    }

    public build() {
        this.mesh.build()
    }

    public rotateX(theta: number) {
        this.thetaX = theta

        const x = quat.fromValues(
            Math.cos(this.thetaX / 2),
            Math.sin(this.thetaX / 2) * 1.0,
            0,
            0,
        )
        
        mat4.fromQuat(this.rX, x)
    }

    public rotateY(theta: number) {
        this.thetaY = theta

        const y = quat.fromValues(
            Math.cos(this.thetaY / 2),
            0,
            Math.sin(this.thetaY / 2) * 1.0,
            0,
        )
        
        mat4.fromQuat(this.rY, y)
    }

    public rotateZ(theta: number) {
        this.thetaZ = theta

        const z = quat.fromValues(
            Math.cos(this.thetaZ / 2),
            0,
            0,
            Math.sin(this.thetaZ / 2) * 1.0,
        )
        
        mat4.fromQuat(this.rZ, z)
    }
    
    public rotate(thetaX: number, thetaY: number, thetaZ: number) {
        this.rotateX(thetaX)
        this.rotateY(thetaY)
        this.rotateZ(thetaZ)
    }

    public update() {
        this.model = mat4.create()
        mat4.translate(this.model, this.model, this.position)
        mat4.mul(this.model, this.model, this.rX)
        mat4.mul(this.model, this.model, this.rY)
        mat4.mul(this.model, this.model, this.rZ)
    }
}
