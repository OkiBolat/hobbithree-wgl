export function setupEventHandlers({ sizes, camera, renderer, cursor, currentSection, transitionToSection }) {
    window.addEventListener('resize', () => {
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight
        sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(sizes.pixelRatio)
    })

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY
        const newSection = Math.round(scrollY / sizes.height)

        if(newSection != currentSection.value) {
            currentSection.value = newSection
            const sectionName = getSectionName(newSection)
            transitionToSection(sectionName)
        }
    })

    window.addEventListener('mousemove', (event) => {
        cursor.x = event.clientX / sizes.width - 0.5
        cursor.y = event.clientY / sizes.height - 0.5
    })
}

export function setupNavigation({ navLinks, currentSection, sizes, transitionToSection }) {
    navLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault()
            currentSection.value = index
            window.scrollTo({
                top: currentSection.value * sizes.height,
                behavior: 'smooth'
            })
            const sectionName = getSectionName(index)
            transitionToSection(sectionName)
        })
    })
}

export function updateNavigation(navLinks, currentSection) {
    navLinks.forEach((link, index) => {
        if(index === currentSection.value)
            link.classList.add('active')
        else
            link.classList.remove('active')
    })
}

export function getSectionName(index) {
    const sections = ['galaxy', 'cursor','water']
    return sections[index] || sections[0]
} 