struct Fragment {
    @builtin(position) Position: vec4f,
    @location(0) Color: vec4f,
}

@vertex
fn vert_main(@location(0) position: vec2f, @location(1) color: vec3f) -> Fragment {
    var output: Fragment;
    output.Position = vec4(position, 0.0, 1.0);
    output.Color = vec4(color, 1.0);

    return output;
}

@fragment
fn frag_main(@location(0) color: vec4f) -> @location(0) vec4f {
    return color;
}
