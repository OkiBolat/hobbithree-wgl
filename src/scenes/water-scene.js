import * as THREE from 'three'
import waterVertexShader from '../shaders/water/vertex.glsl'
import waterFragmentShader from '../shaders/water/fragment.glsl'

export default {
    scene: new THREE.Scene(),
    camera: null,
    geometry: null,
    material: null,
    mesh: null,
    debugObject: {
        depthColor: '#1e4d40',
        surfaceColor: '#4ac29a'
    },
    setup: function({ sizes, gui }) {
        const scene = new THREE.Scene()
        scene.background = null
        this.scene = scene
    
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
        camera.position.set(0, 15, 5)
        camera.lookAt(0, 0, 0)
        this.camera = camera
        scene.add(camera)

        const waterGeometry = new THREE.PlaneGeometry(20, 20, 512, 512)

        const waterMaterial = new THREE.ShaderMaterial({
            vertexShader: waterVertexShader,
            fragmentShader: waterFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                
                uBigWavesElevation: { value: 0.2 },
                uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
                uBigWavesSpeed: { value: 0.75 },

                uSmallWavesElevation: { value: 0.15 },
                uSmallWavesFrequency: { value: 3 },
                uSmallWavesSpeed: { value: 0.2 },
                uSmallIterations: { value: 4 },

                uDepthColor: { value: new THREE.Color('#0077be') },
                uSurfaceColor: { value: new THREE.Color('#00ffff') },
                uColorOffset: { value: 0.1 },
                uColorMultiplier: { value: 4.0 }
            },
            side: THREE.DoubleSide,
            transparent: true
        })

        const water = new THREE.Mesh(waterGeometry, waterMaterial)
        water.scale.set(0.8, 0.8, 0.8)
        water.rotation.x = - Math.PI * 0.5
        water.position.y = -2 
        scene.add(water)

        if (gui) {
            const waterFolder = gui.addFolder('Water')
            waterFolder.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('Wave Height')
            waterFolder.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('Wave Speed')
            waterFolder.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('Color Offset')
            waterFolder.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('Color Multiplier')
            waterFolder.addColor(this.debugObject, 'depthColor').onChange(() => {
                waterMaterial.uniforms.uDepthColor.value.set(this.debugObject.depthColor)
            })
            waterFolder.addColor(this.debugObject, 'surfaceColor').onChange(() => {
                waterMaterial.uniforms.uSurfaceColor.value.set(this.debugObject.surfaceColor)
            })
            waterFolder.close()
        }

        water.matrixAutoUpdate = false
        water.updateMatrix()
        camera.matrixAutoUpdate = false
        camera.updateMatrix()

        return { 
            geometry: waterGeometry, 
            material: waterMaterial, 
            mesh: water 
        }
    },
    update: function(elapsedTime) {
        if(this.mesh && this.mesh.material) {
            this.mesh.material.uniforms.uTime.value = elapsedTime
        }
    }
} 