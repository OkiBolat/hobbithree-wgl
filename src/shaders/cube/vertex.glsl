uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vNormal = normal;
    vPosition = position;

    // Добавляем пульсацию и вращение
    vec3 pos = position;
    float pulse = sin(uTime * 2.0) * 0.1 + 1.0;
    pos *= pulse;
    
    // Добавляем волнообразное искажение
    pos.x += sin(pos.y * 4.0 + uTime) * 0.1;
    pos.z += cos(pos.y * 4.0 + uTime) * 0.1;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
} 

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vNormal = normal;
    vPosition = position;

    // Добавляем пульсацию и вращение
    vec3 pos = position;
    float pulse = sin(uTime * 2.0) * 0.1 + 1.0;
    pos *= pulse;
    
    // Добавляем волнообразное искажение
    pos.x += sin(pos.y * 4.0 + uTime) * 0.1;
    pos.z += cos(pos.y * 4.0 + uTime) * 0.1;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}