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

struct ObjectData {
    model: array<mat4x4<f32>>,
};

@binding(0) @group(0) var<uniform> v_timeUniform: UTime;
@binding(1) @group(0) var<uniform> v_mvpUniform: UMvp;
@binding(2) @group(0) var<uniform> f_timeUniform: UTime;
@binding(3) @group(0) var<uniform> f_mvpUniform: UMvp;
@binding(4) @group(0) var<storage, read> objects: ObjectData;

@vertex
fn vert_main(
    @builtin(instance_index) ID: u32,
    @location(0) vertexPosition: vec3f,
    @location(1) vertexColor: vec3f,
) -> Fragment {
    var output: Fragment;
    output.Position = v_mvpUniform.projection * v_mvpUniform.view * objects.model[ID] * vec4f(vertexPosition, 1.0);
    output.Color = vec4f(vertexColor, 1.0);

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
    
    var time = f_timeUniform.time;
    // r = minbrightness + (maxbrightness - minbrightness) * 0.5 * (1.0 + cos(time * speed));
    // g = minbrightness + (maxbrightness - minbrightness) * 0.5 * (1.0 + cos(time * speed + 2.0));
    // b = minbrightness + (maxbrightness - minbrightness) * 0.5 * (1.0 + cos(time * speed + 4.0));
    
    r = mix(minbrightness, maxbrightness, 0.5 * (1.0 + cos(time * speed)));
    g = mix(minbrightness, maxbrightness, 0.5 * (1.0 + cos(time * speed + 2.0)));
    b = mix(minbrightness, maxbrightness, 0.5 * (1.0 + cos(time * speed + 4.0)));
    
    // return Color;
    return vec4f(r, g, b, 1.0) * Color;
}
