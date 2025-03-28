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
    output.TexCoord = pos;

    return output;
}

@fragment
fn frag_main(@location(0) texCoord: vec2f) -> @location(0) vec4f {
    var pos = vec2f(texCoord.x, 0.85 * (texCoord.y + 0.25 * sin(texCoord.y) * cos(texCoord.x)));

    if (pos.y < - 1.0 || pos.y > 1.0) {
        discard;
    }

    pos = (pos + vec2f(1.0)) * vec2f(0.5, -0.5);

    return textureSample(myTexture, mySampler, pos);
}
