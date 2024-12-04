import * as THREE from "three";
import galaxyVertexShader from "../shaders/galaxy/vertex.glsl";
import galaxyFragmentShader from "../shaders/galaxy/fragment.glsl";

export default {
  geometry: null,
  material: null,
  points: null,
  parameters: {
    count: 200000,
    size: 0.005,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: "#ff6030",
    outsideColor: "#1b3984",
  },
  setup: function ({ renderer, gui }) {
    const parameters = this.parameters;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(parameters.count * 3);
    const randomness = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const scales = new Float32Array(parameters.count * 1);

    const insideColor = new THREE.Color(parameters.insideColor);
    const outsideColor = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;

      const radius = Math.random() * parameters.radius;
      const branchAngle =
        ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

      const randomX =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;
      const randomY =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;
      const randomZ =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;

      positions[i3] = Math.cos(branchAngle) * radius;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = Math.sin(branchAngle) * radius;

      randomness[i3] = randomX;
      randomness[i3 + 1] = randomY;
      randomness[i3 + 2] = randomZ;

      const mixedColor = insideColor.clone();
      mixedColor.lerp(outsideColor, radius / parameters.radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      scales[i] = Math.random();
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute(
      "aRandomness",
      new THREE.BufferAttribute(randomness, 3)
    );
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

    const material = new THREE.ShaderMaterial({
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 30 * renderer.getPixelRatio() },
      },
      vertexShader: galaxyVertexShader,
      fragmentShader: galaxyFragmentShader,
    });

    const points = new THREE.Points(geometry, material);

    if (gui) {
      const galaxyFolder = gui.addFolder("Galaxy");
      galaxyFolder
        .add(parameters, "count")
        .min(100)
        .max(1000000)
        .step(100)
        .name("Stars Count");
      galaxyFolder
        .add(parameters, "radius")
        .min(0.01)
        .max(20)
        .step(0.01)
        .name("Radius");
      galaxyFolder
        .add(parameters, "branches")
        .min(2)
        .max(20)
        .step(1)
        .name("Branches");
      galaxyFolder
        .add(parameters, "randomness")
        .min(0)
        .max(2)
        .step(0.001)
        .name("Randomness");
      galaxyFolder
        .add(parameters, "randomnessPower")
        .min(1)
        .max(10)
        .step(0.001)
        .name("Randomness Power");
      galaxyFolder.addColor(parameters, "insideColor").name("Inside Color");
      galaxyFolder.addColor(parameters, "outsideColor").name("Outside Color");
      galaxyFolder.close();
    }

    return { geometry, material, mesh: points, points };
  },
};
