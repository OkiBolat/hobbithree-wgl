import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import gsap from 'gsap'

import { scenes } from './scenes'
import { cameraSettings } from './config/camera'
import { setupEventHandlers, setupNavigation, updateNavigation, getSectionName } from './utils/eventHandlers'

// Debug
const gui = new GUI()
gui.close()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const mainScene = new THREE.Scene()

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

// Camera
const cameraGroup = new THREE.Group()
mainScene.add(cameraGroup)

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.copy(cameraSettings.galaxy.position)
camera.lookAt(0, 0, 0)
mainScene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

// Controls
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

// Scene transition
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

    if(!isControlEnabled && currentSectionName !== 'galaxy') {
        const parallaxX = cursor.x * 0.5
        const parallaxY = - cursor.y * 0.5
        
        cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
        cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime
    }

    if(!isControlEnabled && currentSectionName !== 'water') {
        const parallaxX = cursor.x * 0.5
        const parallaxY = - cursor.y * 0.5
        
        cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
        cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime
    }

    const currentScene = scenes[currentSectionName]
    
    if(currentScene) {
        if(currentScene.update) {
            currentScene.update(elapsedTime)
        }
        
        if(currentScene.updateDisplacement) {
            currentScene.updateDisplacement()
        }
        
        if(currentSectionName === 'galaxy' && isControlEnabled) {
            controls.update()
        }
    }

    renderer.render(mainScene, camera)
    window.requestAnimationFrame(tick)
}

tick() 