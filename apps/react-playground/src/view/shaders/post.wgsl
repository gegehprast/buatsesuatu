@binding(0) @group(0) var myTexture: texture_2d<f32>;
@binding(1) @group(0) var mySampler: sampler;

struct Fragment {
    @builtin(position) Position: vec4f,
    @location(0) TexCoord: vec2f,
}

@vertex
fn vert_main(
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {
    var positions = array<vec2f, 6>(
        vec2f(1.0, 1.0), // Top-right vertex
        vec2f(1.0, -1.0), // Bottom-right vertex
        vec2f(-1.0, -1.0), // Bottom-left vertex
        vec2f(1.0, 1.0), // Top-right vertex (again)
        vec2f(-1.0, -1.0), // Bottom-left vertex (again)
        vec2f(-1.0, 1.0) // Top-left vertex
    );

    var output: Fragment;

    var pos = positions[vertexIndex];
    output.Position = vec4f(pos, 0.0, 1.0);
    output.TexCoord = vec2f(0.5, -0.5) * (pos + vec2f(1.0));

    return output;
}

@fragment
fn frag_main(@location(0) texCoord: vec2f) -> @location(0) vec4f {
    var color = textureSample(myTexture, mySampler, texCoord);
    var intensity = (1.0 / 3.0) * (color.r + color.g + color.b);
    var dawnColor = intensity * vec3f(237.0 / 255.0, 52.0 / 255.0, 24.0 / 255.0);
    return vec4f(dawnColor, 1.0);
}
