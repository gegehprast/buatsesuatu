import { mat4 } from 'gl-matrix'

export enum OBJECT_TYPES {
    TRIANGLE,
    QUAD,
}

export interface RenderData {
    view_transform: mat4
    model_transforms: Float32Array
    object_counts: { [obj in OBJECT_TYPES]: number }
}
