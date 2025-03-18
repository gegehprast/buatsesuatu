import { mat4, vec3 } from 'gl-matrix'
import { Camera } from './Camera'
import { Triangle } from './Triangle'

export class Scene {
    triangles: Triangle[]
    
    triangleCount: number
    
    player: Camera
    
    objectData: Float32Array

    constructor() {
        this.triangles = []
        this.triangleCount = 0
        this.objectData = new Float32Array(16 * 1024)
        
        let i = 0

        for (let y = -5; y < 5; y++) {
            this.triangles.push(new Triangle([2, y, 0], 0))

            const blankMatrix = mat4.create()

            

            for (let j = 0; j < 16; j++) {
                this.objectData[16 * i + j] = <number>blankMatrix[j]
            }

            i++
            this.triangleCount++
        }

        this.player = new Camera([-2, 0, 0.5], 0, 0)
    }

    update() {
        let i = 0

        this.triangles.forEach((triangle) => {
            triangle.update()
            
            const model = triangle.getModel()

            for (let j = 0; j < 16; j++) {
                this.objectData[16 * i + j] = <number>model[j]
            }

            i++
        })

        this.player.update()
    }

    spinPlayer(dX: number, dY: number) {
        this.player.eulers[2] -= dX
        this.player.eulers[2] %= 360

        this.player.eulers[1] = Math.min(
            89,
            Math.max(-89, this.player.eulers[1] - dY),
        )
    }

    movePlayer(forwardsAmount: number, rightAmount: number) {
        vec3.scaleAndAdd(
            this.player.position,
            this.player.position,
            this.player.forwards,
            forwardsAmount,
        )

        vec3.scaleAndAdd(
            this.player.position,
            this.player.position,
            this.player.right,
            rightAmount,
        )
    }

    getPlayer(): Camera {
        return this.player
    }

    getTriangles(): Float32Array {
        return this.objectData
    }
}
