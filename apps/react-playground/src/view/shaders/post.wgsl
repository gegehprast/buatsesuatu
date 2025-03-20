

struct Fragment {
    @builtin(position) Position: vec4f,
    @location(0) TexCoord: vec2f,
}

struct Uniforms {
    time: f32,
}

@binding(0) @group(0) var myTexture: texture_2d<f32>;
@binding(1) @group(0) var mySampler: sampler;
@binding(2) @group(0) var<uniform> uniforms: Uniforms;

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
    output.TexCoord = (pos + vec2f(1.0)) * vec2f(0.5, -0.5);

    return output;
}

@fragment
fn frag_main(@location(0) texCoord: vec2f) -> @location(0) vec4f {
    let frequency = 10.0;
    let amplitude = 0.04;
    let speed = 2.0;

    let distortionX = sin(texCoord.y * frequency + uniforms.time * speed) * amplitude;
    let distortionY = sin(texCoord.x * frequency + uniforms.time * speed) * amplitude;
    
    // Sample texture with both versions
    let distortedUV = vec2f(texCoord.x + distortionX, texCoord.y + distortionY);

    let color = textureSample(myTexture, mySampler, distortedUV);
    var intensity = (1.0 / 2.0) * (color.r + color.g + color.b);
    var redTint = vec3f(237.0 / 255.0, 52.0 / 255.0, 24.0 / 255.0);
    return vec4f(intensity * redTint, 1.0);
}
