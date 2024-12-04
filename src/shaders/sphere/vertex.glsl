uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vNormal = normal;

    // Добавляем волны на поверхности
    vec3 pos = position;
    pos += normal * sin(pos.x * 10.0 + uTime) * 0.1;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
} 