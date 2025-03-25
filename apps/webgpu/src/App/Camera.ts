import { vec3, mat4 } from 'gl-matrix'
import { degToRad } from '../../../../packages/math/src'
import { App } from './App'

export class Camera {
    public position: vec3
    public phi: number
    public theta: number
    public view: mat4
    public forwards: vec3
    public right: vec3
    public up: vec3
    private app: App
    private forwardInput: number = 0
    private rightInput: number = 0

    constructor(position: vec3, phi: number, theta: number, app: App) {
        this.position = position
        this.phi = phi
        this.theta = theta
        this.view = mat4.create()
        this.forwards = vec3.create()
        this.right = vec3.create()
        this.up = vec3.create()
        this.app = app

        this.control()
    }

    private control() {
        this.app.input.observeControl(({ isInsideCanvas, keys, mouseMovementX, mouseMovementY }) => {
            this.forwardInput = 0
            this.rightInput = 0

            keys.forEach((key) => {
                switch (key) {
                    case 'KeyW':
                        this.forwardInput += 0.02
                        break
                    case 'KeyS':
                        this.forwardInput -= 0.02
                        break
                    case 'KeyA':
                        this.rightInput -= 0.02
                        break
                    case 'KeyD':
                        this.rightInput += 0.02
                        break
                }
            })
            
            if (isInsideCanvas) {
                this.look(mouseMovementX * 0.06, mouseMovementY * 0.06)
            }
        })
    }

    public look(dX: number, dY: number) {
        this.theta -= dX
        this.theta %= 360

        this.phi = Math.min(90, Math.max(-90, this.phi - dY))
    }

    public update() {
        vec3.scaleAndAdd(
            this.position,
            this.position,
            this.forwards,
            this.forwardInput,
        )

        vec3.scaleAndAdd(
            this.position,
            this.position,
            this.right,
            this.rightInput,
        )

        this.forwards = [
            Math.sin(degToRad(this.theta)) * Math.cos(degToRad(this.phi)),
            Math.sin(degToRad(this.phi)),
            Math.cos(degToRad(this.phi)) * Math.cos(degToRad(this.theta)),
        ]

        vec3.cross(this.right, this.forwards, [0, 1, 0])

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
