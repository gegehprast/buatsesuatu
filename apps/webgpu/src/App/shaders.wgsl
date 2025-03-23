struct Fragment {
    @builtin(position) Position: vec4f,
    @location(0) Color: vec4f,
};

struct UTime {
    time: f32,
};

struct UMvp {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
};

@binding(0) @group(0) var<uniform> timeUniform: UTime;
@binding(1) @group(0) var<uniform> mvpUniform: UMvp;

@vertex
fn vert_main(
    @builtin(vertex_index) ID: u32,
) -> Fragment {
    var positions = array<vec2f, 3>(
        vec2f(0.0, 0.5),
        vec2f(-0.5, -0.5),
        vec2f(0.5, -0.5),
    );

    var colors = array<vec4f, 3>(
        vec4f(1.0, 0.0, 0.0, 1.0),
        vec4f(0.0, 1.0, 0.0, 1.0),
        vec4f(0.0, 0.0, 1.0, 1.0),
    );

    var output: Fragment;
    output.Position = vec4f(positions[ID], 0.0, 1.0);
    output.Color = colors[ID];

    return output;
}

@fragment
fn frag_main(@location(0) Color: vec4f) -> @location(0) vec4f {
    var r = 1.0;
    var g = 1.0;
    var b = 1.0;
    let minbrightness = 0.2;
    let maxbrightness = 4.0;
    let speed = 2.0;
    
    var time = timeUniform.time;
    // r = minbrightness + (maxbrightness - minbrightness) * 0.5 * (1.0 + cos(time * speed));
    // g = minbrightness + (maxbrightness - minbrightness) * 0.5 * (1.0 + cos(time * speed + 2.0));
    // b = minbrightness + (maxbrightness - minbrightness) * 0.5 * (1.0 + cos(time * speed + 4.0));
    
    r = mix(minbrightness, maxbrightness, 0.5 * (1.0 + cos(time * speed)));
    g = mix(minbrightness, maxbrightness, 0.5 * (1.0 + cos(time * speed + 2.0)));
    b = mix(minbrightness, maxbrightness, 0.5 * (1.0 + cos(time * speed + 4.0)));
    
    return vec4f(r, g, b, 1.0) * Color;
}
