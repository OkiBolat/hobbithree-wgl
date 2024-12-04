uniform float uTime;
uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uBigWavesSpeed;

uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallIterations;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/perlinClassic3D.glsl

float waveElevation(vec3 position)
{
    // Основные волны с усиленным случайным сдвигом фазы
    float elevation = sin(position.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed + 
                         perlinClassic3D(vec3(position.xz * 0.2, uTime * 0.15)) * 8.0) *
                     sin(position.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed + 
                         perlinClassic3D(vec3(position.xz * 0.2, uTime * 0.15 + 100.0)) * 8.0) *
                     uBigWavesElevation;

    // Усиленные мелкие волны
    for(float i = 1.0; i <= uSmallIterations; i++)
    {
        elevation -= abs(
            perlinClassic3D(
                vec3(
                    position.xz * uSmallWavesFrequency * i * (1.0 + sin(uTime * 0.2) * 0.5), 
                    uTime * uSmallWavesSpeed * (1.0 + sin(uTime * 0.3 + i) * 0.3)
                )
            ) * uSmallWavesElevation / (i * 0.5) // Уменьшили делитель для более сильных волн
        );
    }

    // Усиленная случайная рябь
    elevation += perlinClassic3D(vec3(
        position.xz * 3.0 + uTime * 0.8, 
        uTime * 0.3
    )) * uSmallWavesElevation * 0.4;

    return elevation;
}

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float shift = 0.01;
    vec3 modelPositionA = modelPosition.xyz + vec3(shift, 0.0, 0.0);
    vec3 modelPositionB = modelPosition.xyz + vec3(0.0, 0.0, - shift);

    float elevation = waveElevation(modelPosition.xyz);
    float elevationA = waveElevation(modelPositionA);
    float elevationB = waveElevation(modelPositionB);
    
    modelPosition.y += elevation;
    modelPositionA.y += elevationA;
    modelPositionB.y += elevationB;

    // Compute normal
    vec3 toA = normalize(modelPositionA - modelPosition.xyz);
    vec3 toB = normalize(modelPositionB - modelPosition.xyz);
    vec3 computedNormal = cross(toA, toB);

    // Final position
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Varyings
    vElevation = elevation;
    vNormal = computedNormal;
    vPosition = modelPosition.xyz;
}