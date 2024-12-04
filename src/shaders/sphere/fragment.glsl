uniform vec3 uColor;
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vec3 color = uColor;
    float gradient = sin(vUv.y * 10.0 + uTime) * 0.5 + 0.5;
    color *= gradient;

    gl_FragColor = vec4(color, 1.0);
} 