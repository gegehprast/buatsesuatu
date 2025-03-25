import { mat4 } from 'gl-matrix'
import { Object } from './Interfaces/Object'

export class Scene {
    public objects: Object[] = []

    public objectData: Float32Array

    constructor() {
        this.objectData = new Float32Array(16 * 1024)
    }

    public addObject(object: Object) {
        this.objects.push(object)
        
        const i = this.objects.length - 1
        const blankMatrix = mat4.create()

        for (let j = 0; j < 16; j++) {
            this.objectData[16 * i + j] = blankMatrix[j]
        }
    }

    public update() {
        for (const [i, object] of this.objects.entries()) {
            object.update()
            
            for (let j = 0; j < 16; j++) {
                this.objectData[16 * i + j] = object.model[j]
            }
        }
    }

    public build() {
        for (const object of this.objects) {
            object.build()
        }
    }
}
