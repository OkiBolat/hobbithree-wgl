uniform vec3 uColor;
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // Создаем узор на гранях куба
    vec3 color = uColor;
    
    // Добавляем градиент на основе позиции
    float gradient = sin(vPosition.x * 5.0 + vPosition.y * 5.0 + uTime) * 0.5 + 0.5;
    
    // Добавляем светлые линии
    float lines = step(0.98, sin(vUv.x * 20.0) * sin(vUv.y * 20.0));
    
    color = mix(color, vec3(1.0), lines * 0.5);
    color *= gradient;

    gl_FragColor = vec4(color, 1.0);
} 