uniform float uTime;

varying vec2 vUv;
varying float vElevation;

void main() {
    vUv = uv;
    
    // Создаем волнообразную поверхность
    vec3 pos = position;
    float elevation = sin(pos.x * 3.0 + uTime) * cos(pos.z * 3.0 + uTime) * 0.3;
    pos.y += elevation;
    vElevation = elevation;

    // Добавляем бегущие волны
    float wave = sin(pos.x * 5.0 - uTime * 2.0) * 0.1;
    wave += sin(pos.z * 5.0 - uTime * 2.0) * 0.1;
    pos.y += wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
} 