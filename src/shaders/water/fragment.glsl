uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
uniform float uTime;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);

    // Динамическое освещение
    vec3 lightDirection = normalize(vec3(
        sin(uTime * 0.2) * 0.5, // Свет двигается по X
        0.5 + sin(uTime * 0.1) * 0.2, // И немного по Y
        cos(uTime * 0.2) * 0.5  // И по Z
    ));
    
    // Диффузное освещение
    float diffuse = max(0.0, dot(normal, lightDirection));
    
    // Блики (specular)
    vec3 reflectDir = reflect(-lightDirection, normal);
    float spec = pow(max(dot(viewDirection, reflectDir), 0.0), 32.0);
    float specularStrength = 0.5;
    
    // Ambient освещение с легкой пульсацией
    float ambientStrength = 0.3 + sin(uTime * 0.5) * 0.1;
    vec3 ambient = ambientStrength * vec3(1.0);

    // Смешиваем цвета воды
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    mixStrength = smoothstep(0.0, 1.0, mixStrength);
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    // Применяем все компоненты освещения
    vec3 lighting = ambient + 
                   diffuse * vec3(0.7) + 
                   spec * specularStrength * vec3(1.0);
    
    color *= lighting;
    
    // Добавляем легкое свечение на гребнях волн
    float waveCrest = smoothstep(0.1, 0.3, vElevation);
    color += waveCrest * vec3(0.2, 0.4, 0.6) * 0.5;
    
    gl_FragColor = vec4(color, 1.0);
}