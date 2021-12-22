import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { TextureLoader } from 'three'

const raycaster = new THREE.Raycaster()
const textureLoader = new THREE.TextureLoader()

const houseTexture = textureLoader.load('./models/tree/holidayBake2.jpg')
const treeTexture = textureLoader.load('./models/tree/tree/tree.jpg')
treeTexture.flipY = false
houseTexture.flipY= false

const treeMaterial = new THREE.MeshBasicMaterial({map:treeTexture})
const houseMaterial = new THREE.MeshBasicMaterial({map:houseTexture})


const mouse = new THREE.Vector2()
mouse.x = null
mouse.y=null

window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1

    // console.log(mouse)
})
/**
 * Base
 */
// Debug
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Models
 */
// const dracoLoader = new DRACOLoader()
// dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
// gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null
let action = null
let box = null
let tree = null



gltfLoader.load(
    './models/tree/boxer.gltf',
    (gltf) =>
    {

        gltfLoader.load(
            './models/tree/tree.gltf',
            (gltf) =>
            {   tree = gltf.scene
                tree.traverse((child) =>
                {
                    child.material = treeMaterial
                })
                tree.scale.set(0.25, 0.25, 0.25)
                scene.add(tree)
        
        
                // // Animation
                // mixer = new THREE.AnimationMixer(gltf.scene)
                // const action = mixer.clipAction(gltf.animations[1])
                // action.play()
            }
        )
        
        gltfLoader.load(
            './models/tree/houses.gltf',
            (gltf) =>
            { gltf.scene.traverse((child) =>
                {
                    child.material = houseMaterial
                })
                gltf.scene.scale.set(0.25, 0.25, 0.25)
                scene.add(gltf.scene)
        
        
                // // Animation
                // mixer = new THREE.AnimationMixer(gltf.scene)
                // const action = mixer.clipAction(gltf.animations[1])
                // action.play()
            }
        )

        box=gltf.scene

        box.scale.set(0.25, 0.25, 0.25)
        scene.add(box)
        box.children[0].children[1].material = houseMaterial

        // console.log(box)

        // Animation
        mixer = new THREE.AnimationMixer(gltf.scene)
        action = mixer.clipAction(gltf.animations[0]) 
        action.clampWhenFinished = true
        action.setLoop( THREE.LoopOnce )
        // console.log(action)
        // action.play()
    }
)
/** 
 * Floor
 */
// const floor = new THREE.Mesh(
//     new THREE.PlaneGeometry(10, 10),
//     new THREE.MeshStandardMaterial({
//         color: 'orange',
//         metalness: 0,
//         roughness: 0.5
//     })
// )
// floor.receiveShadow = true
// floor.rotation.x = - Math.PI * 0.5
// floor.position.y = -.5
// scene.add(floor)

/**
 * Lights
 */
// const ambientLight = new THREE.AmbientLight('green', 10)
// scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('pink', 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(- 5, 5, 0)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setClearColor( 'orange',.5);

// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{

    raycaster.setFromCamera(mouse, camera)

  



    if(box != null){
    const intersects = raycaster.intersectObject(box.children[0])

    if(intersects.length>0){
        // console.log(intersects)
          box.children[0].children[0].material.color.set("yellow")
          
            
        }
    else{

        
        box.children[0].children[0].material.color.set("violet")


    }

    window.addEventListener('click', (event) =>
    {
        action.play()
    
        // console.log(mouse)
    })


    }
    if(tree != null){
    tree.children[0].rotation.y += 0.01}

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Model animation
    if(mixer)
    {
        mixer.update(deltaTime)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()