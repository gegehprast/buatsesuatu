struct TransformData {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
}

@binding(0) @group(0) var<uniform> transformUBO: TransformData;
@binding(0) @group(1) var myTexture: texture_2d<f32>;
@binding(1) @group(1) var mySampler: sampler;

struct Fragment {
    @builtin(position) Position: vec4f,
    @location(0) TexCoord: vec2f,
    @location(1) Normal: vec3f,
}

@vertex
fn vert_main(
    @location(0) vertexPosition: vec3f,
    @location(1) vertexTexCoord: vec2f,
    @location(2) vertexNormal: vec3f,
) -> Fragment {
    var output: Fragment;
    output.Position = transformUBO.projection * vec4f(vertexPosition, 1.0);
    output.TexCoord = vertexTexCoord;
    output.Normal = vertexNormal;

    return output;
}

@fragment
fn frag_main(@location(0) texCoord: vec2f) -> @location(0) vec4f {
    return textureSample(myTexture, mySampler, texCoord);
}
