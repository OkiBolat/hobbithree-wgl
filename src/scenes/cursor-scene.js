import * as THREE from 'three'
import particlesVertexShader from '../shaders/particles/vertex.glsl'
import particlesFragmentShader from '../shaders/particles/fragment.glsl'

export default {
    geometry: null,
    material: null,
    points: null,
    displacement: null,
    setup: function({ sizes, mainScene, camera, gui }) {
        const displacement = {}

        displacement.canvas = document.createElement('canvas')
        displacement.canvas.style.position = 'fixed'
        displacement.canvas.style.width = '0px'
        displacement.canvas.style.height = '0px'
        displacement.canvas.style.top = '0'
        displacement.canvas.style.left = '0'
        displacement.canvas.style.zIndex = '1'
        displacement.canvas.style.pointerEvents = 'none'
        document.body.appendChild(displacement.canvas)

        displacement.context = displacement.canvas.getContext('2d')
        displacement.context.fillStyle = '#000000'
        displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height)

        displacement.interactivePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 10),
            new THREE.MeshBasicMaterial({ visible: false })
        )
        displacement.interactivePlane.position.z = 0
        mainScene.add(displacement.interactivePlane)

        displacement.raycaster = new THREE.Raycaster()
        displacement.screenCursor = new THREE.Vector2(9999, 9999)
        displacement.canvasCursor = new THREE.Vector2(9999, 9999)
        displacement.canvasCursorPrevious = new THREE.Vector2(9999, 9999)
        displacement.texture = new THREE.CanvasTexture(displacement.canvas)

        const geometry = new THREE.PlaneGeometry(32, 18, 128, 128)
        geometry.setIndex(null)
        geometry.deleteAttribute('normal')

        const intensitiesArray = new Float32Array(geometry.attributes.position.count)
        const anglesArray = new Float32Array(geometry.attributes.position.count)

        for(let i = 0; i < geometry.attributes.position.count; i++) {
            intensitiesArray[i] = Math.random()
            anglesArray[i] = Math.random() * Math.PI * 2
        }

        geometry.setAttribute('aIntensity', new THREE.BufferAttribute(intensitiesArray, 1))
        geometry.setAttribute('aAngle', new THREE.BufferAttribute(anglesArray, 1))

        const textureLoader = new THREE.TextureLoader()
        const pictureTexture = textureLoader.load(
            './picture-2.png',
            (texture) => {
                console.log('Picture texture loaded successfully')
                texture.needsUpdate = true
            },
            undefined,
            (error) => {
                console.error('Error loading picture texture:', error)
            }
        )

        const material = new THREE.ShaderMaterial({
            vertexShader: particlesVertexShader,
            fragmentShader: particlesFragmentShader,
            uniforms: {
                uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
                uDisplacementTexture: new THREE.Uniform(displacement.texture),
                uPictureTexture: new THREE.Uniform(pictureTexture),
                uTime: { value: 0 },
                uColor: { value: new THREE.Color('#ffffff') },
                uSize: { value: 3.0 },
                uScale: { value: 10.0 }
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })

        const points = new THREE.Points(geometry, material)
        points.position.y = 0
        points.position.z = 0
        points.scale.set(1, 1, 1)

        if (gui) {
            const folder = gui.addFolder('Particles')
            folder.add(points.scale, 'x', 0.1, 5, 0.1).name('Scale X')
            folder.add(points.scale, 'y', 0.1, 5, 0.1).name('Scale Y')
            folder.add(material.uniforms.uSize, 'value', 1, 10, 0.1).name('Particle Size')
            folder.add(points.position, 'y', -10, 10, 0.1).name('Position Y')
            folder.close()
        }

        window.addEventListener('pointermove', (event) => {
            if(this.currentSectionName === 'cursor') {
                displacement.screenCursor.x = (event.clientX / sizes.width) * 2 - 1
                displacement.screenCursor.y = - (event.clientY / sizes.height) * 2 + 1
            }
        })

        return { 
            geometry, 
            material, 
            mesh: points,
            points,  
            displacement,
            updateDisplacement: () => {
                displacement.interactivePlane.position.copy(points.position)
                displacement.interactivePlane.scale.copy(points.scale)

                displacement.raycaster.setFromCamera(displacement.screenCursor, camera)
                const intersections = displacement.raycaster.intersectObject(displacement.interactivePlane)

                if(intersections.length) {
                    const uv = intersections[0].uv
                    displacement.canvasCursor.x = uv.x * displacement.canvas.width
                    displacement.canvasCursor.y = (1 - uv.y) * displacement.canvas.height
                }

                displacement.context.globalCompositeOperation = 'source-over'
                displacement.context.globalAlpha = 0.02
                displacement.context.fillStyle = '#000000'
                displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height)

                const cursorDistance = displacement.canvasCursorPrevious.distanceTo(displacement.canvasCursor)
                displacement.canvasCursorPrevious.copy(displacement.canvasCursor)
                const alpha = Math.min(cursorDistance * 0.05, 1)
                
                const glowSize = displacement.canvas.width * 0.15
                displacement.context.globalCompositeOperation = 'lighten'
                displacement.context.globalAlpha = alpha
                
                const gradient = displacement.context.createRadialGradient(
                    displacement.canvasCursor.x, 
                    displacement.canvasCursor.y, 
                    0,
                    displacement.canvasCursor.x, 
                    displacement.canvasCursor.y, 
                    glowSize * 0.5
                )
                
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
                gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.5)')
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
                
                displacement.context.fillStyle = gradient
                displacement.context.fillRect(
                    displacement.canvasCursor.x - glowSize * 0.5,
                    displacement.canvasCursor.y - glowSize * 0.5,
                    glowSize,
                    glowSize
                )

                displacement.texture.needsUpdate = true
            },
            update: function(elapsedTime) {
                if (this.material) {
                    this.material.uniforms.uTime.value = elapsedTime
                }
            }
        }
    }
} 
