import { mat4, vec3 } from 'gl-matrix'
import { Renderable } from './Renderable'

export interface Object {
    position: vec3

    model: mat4

    mesh: Renderable

    update(): void

    build(): void
}
