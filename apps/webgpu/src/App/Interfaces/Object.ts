import { mat4, vec3 } from 'gl-matrix'
import { TriangleMesh } from '../Meshes/TriangleMesh'

export interface Object {
    position: vec3

    model: mat4

    mesh: TriangleMesh

    update(): void

    build(): void
}
