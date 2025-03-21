struct TransformData {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
}

struct ObjectData {
    model: array<mat4x4<f32>>,
}

@binding(0) @group(0) var<uniform> transformUBO: TransformData;
@binding(1) @group(0) var<storage, read> objects: ObjectData;

@binding(0) @group(1) var myTexture: texture_2d<f32>;
@binding(1) @group(1) var mySampler: sampler;

struct Fragment {
    @builtin(position) Position: vec4f,
    @location(0) TexCoord: vec2f,
}

@vertex
fn vert_main(
    @builtin(instance_index) ID: u32,
    @location(0) position: vec3f,
    @location(1) texCoord: vec2f
) -> Fragment {
    var output: Fragment;
    output.Position = transformUBO.projection * transformUBO.view * objects.model[ID] * vec4f(position, 1.0);
    output.TexCoord = texCoord;

    return output;
}

@fragment
fn frag_main(@location(0) texCoord: vec2f) -> @location(0) vec4f {
    return textureSample(myTexture, mySampler, texCoord);
}
