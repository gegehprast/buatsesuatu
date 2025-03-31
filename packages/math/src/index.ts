import Vector from './Vector.js'
import { add } from './add.js'
import { subtract } from './subtract.js'

function degToRad(degrees: number): number {
    return degrees * (Math.PI / 180)
}

export { Vector, add, subtract, degToRad }
