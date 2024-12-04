import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import gsap from 'gsap'

import { scenes } from './scenes'
import { cameraSettings } from './config/camera'
import { setupEventHandlers, setupNavigation, updateNavigation, getSectionName } from './utils/eventHandlers'

const gui = new GUI()
gui.close()

const canvas = document.querySelector('canvas.webgl')

const mainScene = new THREE.Scene()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

const cameraGroup = new THREE.Group()
mainScene.add(cameraGroup)

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.copy(cameraSettings.galaxy.position)
camera.lookAt(0, 0, 0)
mainScene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enabled = false
controls.autoRotate = true
controls.autoRotateSpeed = 0.5
controls.enableZoom = true
controls.maxDistance = 20
controls.minDistance = 2

let isControlEnabled = false
let currentMesh = null
let currentSectionName = ''
const currentSection = { value: 0 }
const cursor = { x: 0, y: 0 }

setupEventHandlers({ 
    sizes, 
    camera, 
    renderer, 
    cursor, 
    currentSection, 
    transitionToSection 
})

const navLinks = document.querySelectorAll('nav a')
setupNavigation({ 
    navLinks, 
    currentSection, 
    sizes, 
    transitionToSection 
})

function transitionToSection(sectionName) {
    if(currentSectionName === sectionName) return

    if(isControlEnabled) {
        isControlEnabled = false
        controls.enabled = false
        document.body.style.cursor = 'default'
    }

    const settings = cameraSettings[sectionName]
    if(settings) {
        gsap.to(camera.position, {
            duration: 1,
            x: settings.position.x,
            y: settings.position.y,
            z: settings.position.z,
            onUpdate: () => camera.lookAt(0, 0, 0),
            onComplete: () => {
                camera.position.copy(settings.position)
                camera.lookAt(0, 0, 0)
            }
        })
    }

    const scene = scenes[sectionName]
    if(!scene) {
        console.error('Scene not found:', sectionName)
        return
    }

    if(!scene.mesh) {
        try {
            const setupParams = {
                sizes,
                mainScene,
                camera,
                gui,
                renderer
            }
            const setup = scene.setup(setupParams)
            if(setup) {
                Object.assign(scene, setup)
            }
        } catch(error) {
            console.error('Error in setup for scene:', sectionName, error)
            return
        }
    }

    if(currentMesh) {
        mainScene.remove(currentMesh)
    }

    currentMesh = scene.mesh
    if(currentMesh) {
        mainScene.add(currentMesh)
    }
    
    currentSectionName = sectionName
    updateNavigation(navLinks, currentSection)
}

transitionToSection('galaxy')

window.addEventListener('click', (event) => {
    if(currentSectionName === 'galaxy') {
        isControlEnabled = !isControlEnabled
        controls.enabled = isControlEnabled
        
        if(isControlEnabled) {
            document.body.style.cursor = 'grab'
        } else {
            document.body.style.cursor = 'default'
            const settings = cameraSettings[currentSectionName]
            gsap.to(camera.position, {
                duration: 1,
                x: settings.position.x,
                y: settings.position.y,
                z: settings.position.z,
                onUpdate: () => camera.lookAt(0, 0, 0),
                onComplete: () => {
                    camera.position.copy(settings.position)
                    camera.lookAt(0, 0, 0)
                }
            })
        }
    }
})

const clock = new THREE.Clock()
let previousTime = 0

function tick() {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    const currentScene = scenes[currentSectionName]
    
    if(currentScene) {
        if(currentSectionName === 'galaxy') {
            if(currentScene.material) {
                currentScene.material.uniforms.uTime.value = elapsedTime
            }
            if(isControlEnabled) {
                controls.update()
            }
        }
        else if(currentSectionName === 'cursor') {
            if(currentScene.material) {
                currentScene.material.uniforms.uTime.value = elapsedTime
            }
            if(currentScene.updateDisplacement) {
                currentScene.updateDisplacement()
            }
        }
        else if(currentMesh && currentSectionName !== 'water') {
            currentMesh.rotation.x = elapsedTime * 0.5
            currentMesh.rotation.y = elapsedTime * 0.5
        }

        if(currentScene.update) {
            currentScene.update(elapsedTime)
        }
    }

    renderer.render(mainScene, camera)
    window.requestAnimationFrame(tick)
}

tick() 

window.addEventListener('pointermove', (event) => {
    if(currentSectionName === 'cursor') {
        const currentScene = scenes[currentSectionName]
        if(currentScene && currentScene.displacement) {
            currentScene.displacement.screenCursor.x = (event.clientX / sizes.width) * 2 - 1
            currentScene.displacement.screenCursor.y = - (event.clientY / sizes.height) * 2 + 1
        }
    }
}) 