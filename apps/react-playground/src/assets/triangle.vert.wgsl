struct TransformData {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
}

@binding(0) @group(0) var<uniform> transformUBO: TransformData;

struct Fragment {
    @builtin(position) Position: vec4f,
    @location(0) Color: vec4f,
}

@vertex
fn vert_main(@location(0) position: vec3f, @location(1) color: vec3f) -> Fragment {
    var output: Fragment;
    output.Position = transformUBO.projection * transformUBO.view * transformUBO.model * vec4f(position, 1.0);
    output.Color = vec4f(color, 1.0);

    return output;
}

@fragment
fn frag_main(@location(0) color: vec4f) -> @location(0) vec4f {
    return color;
}
