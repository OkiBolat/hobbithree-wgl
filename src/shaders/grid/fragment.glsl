uniform vec3 uColor;
uniform float uTime;

varying vec2 vUv;
varying float vElevation;

void main() {
    // Создаем базовый цвет с градиентом на основе высоты
    vec3 color = mix(uColor, vec3(1.0), vElevation * 2.0 + 0.5);
    
    // Добавляем сетку
    float grid = step(0.95, sin(vUv.x * 50.0)) + step(0.95, sin(vUv.y * 50.0));
    color = mix(color, vec3(1.0), grid * 0.3);
    
    // Добавляем пульсирующие точки пересечения
    float dots = step(0.98, sin(vUv.x * 50.0)) * step(0.98, sin(vUv.y * 50.0));
    float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
    color = mix(color, vec3(1.0), dots * pulse);

    gl_FragColor = vec4(color, 1.0);
} 