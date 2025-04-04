import { mat4, vec3 } from 'gl-matrix'
import { Camera } from './Camera'
import { Triangle } from './Triangle'
import { Quad } from './Quad'
import { OBJECT_TYPES, RenderData } from './definitions'
import { Statue } from './Statue'

export class Scene {
    private triangles: Triangle[] = []

    private quads: Quad[] = []

    private statues: Statue[] = []

    private player: Camera

    private objectData: Float32Array

    constructor() {
        this.objectData = new Float32Array(16 * 1024)

        this.makeTriangles()

        this.makeQuads()

        // why is this position acting weird?
        this.statues = [new Statue([0, 0, 0], [0, 0, 0])]

        this.player = new Camera([-2, 0, 0.5], 0, 0)
    }

    private makeTriangles() {
        let i = 0

        for (let y = -10; y <= 10; y++) {
            this.triangles.push(new Triangle([2, y, 0], 0))

            const blankMatrix = mat4.create()

            for (let j = 0; j < 16; j++) {
                this.objectData[16 * i + j] = <number>blankMatrix[j]
            }

            i++
        }
    }

    private makeQuads() {
        let i = this.triangles.length

        for (let x = -10; x <= 10; x++) {
            for (let y = -10; y <= 10; y++) {
                this.quads.push(new Quad([x, y, 0]))

                const blankMatrix = mat4.create()

                for (let j = 0; j < 16; j++) {
                    this.objectData[16 * i + j] = <number>blankMatrix[j]
                }

                i++
            }
        }
    }

    public update() {
        let i = 0

        this.triangles.forEach((triangle) => {
            triangle.update()

            const model = triangle.getModel()

            for (let j = 0; j < 16; j++) {
                this.objectData[16 * i + j] = <number>model[j]
            }

            i++
        })

        this.quads.forEach((quad) => {
            quad.update()

            const model = quad.getModel()

            for (let j = 0; j < 16; j++) {
                this.objectData[16 * i + j] = <number>model[j]
            }

            i++
        })

        this.statues.forEach((statue) => {
            statue.update()

            const model = statue.getModel()

            for (let j = 0; j < 16; j++) {
                this.objectData[16 * i + j] = <number>model[j]
            }

            i++
        })

        this.player.update()
    }

    public spinPlayer(dX: number, dY: number) {
        this.player.eulers[2] -= dX
        this.player.eulers[2] %= 360

        this.player.eulers[1] = Math.min(
            89,
            Math.max(-89, this.player.eulers[1] - dY),
        )
    }

    public movePlayer(forwardsAmount: number, rightAmount: number) {
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

    public getPlayer(): Camera {
        return this.player
    }

    public getRenderables(): RenderData {
        return {
            view_transform: this.player.getView(),
            model_transforms: this.objectData,
            object_counts: {
                [OBJECT_TYPES.TRIANGLE]: this.triangles.length,
                [OBJECT_TYPES.QUAD]: this.quads.length,
            },
        }
    }
}
