import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { SphereGeometry, TextureLoader } from 'three'
import CANNON from 'cannon'
import $ from "./Jquery"
$(".close").css("display","none")

const textureLoader = new THREE.TextureLoader()

var audio = new Audio('/musicbox.wav');
var audiobounce = new Audio('/bounce.wav');

const playHitSound = (collision) =>
{
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()

    if(impactStrength > 2)
    {
        audiobounce.volume = Math.random()*.2
        audiobounce.currentTime = 0
        audiobounce.play()
    }
}


//material patterns

const wrapperTexture1 = textureLoader.load('/models/tree/checker1.jpg')
wrapperTexture1.repeat.set(2,2)
wrapperTexture1.wrapT = THREE.MirroredRepeatWrapping
wrapperTexture1.wrapS = THREE.MirroredRepeatWrapping

const WrapperMaterial1 = new THREE.MeshBasicMaterial({map:wrapperTexture1})
const wrapperTexture2 = textureLoader.load('/models/tree/checker2.jpg')
const WrapperMaterial2 = new THREE.MeshBasicMaterial({map:wrapperTexture2})
const wrapperTexture3 = textureLoader.load('/models/tree/dots2a.jpg')
const WrapperMaterial3 = new THREE.MeshBasicMaterial({map:wrapperTexture3})
const wrapperTexture4 = textureLoader.load('/models/tree/dots3a.jpg')
const WrapperMaterial4 = new THREE.MeshBasicMaterial({map:wrapperTexture4})
wrapperTexture3.repeat.set(5,5)
wrapperTexture3.wrapT = THREE.RepeatWrapping
wrapperTexture3.wrapS = THREE.RepeatWrapping
wrapperTexture4.wrapT = THREE.RepeatWrapping
wrapperTexture4.wrapS = THREE.RepeatWrapping
wrapperTexture2.wrapT = THREE.RepeatWrapping
wrapperTexture2.wrapS = THREE.RepeatWrapping
//debug

// const gui = new dat.GUI()
// const debugObject = {}

// debugObject.createBox = () =>
// {
//     createBox(
//         Math.random()*.4+.2,
//         Math.random()*.4+.2,
//         Math.random()*.4+.2,
//         {
//             x: (Math.random() - 0.5) * 3,
//             y: 3,
//             z: (Math.random() - 0.5) * 3
//         },
//        Math.floor( Math.random()*4)+1
//     )
// }
// gui.add(debugObject, 'createBox')

// debugObject.reset = () =>
// {
//     for(const object of objectsToUpdate)
//     {
//         // Remove body
//         object.body.removeEventListener('collide', playHitSound)
//         world.removeBody(object.body)

//         // Remove mesh
//         scene.remove(object.mesh)
//     }
// }
// gui.add(debugObject, 'reset')


//open button

const openButton=document.getElementsByClassName("open");
const closeButton = document.getElementsByClassName("close")
const moreButton = document.getElementsByClassName("more")

//raycaster
const raycaster = new THREE.Raycaster()

//cannon
console.log(CANNON)
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, - 9.82, 0)

const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.8,
        restitution: 0.1
    }
)
const bubbleShape = new CANNON.Sphere(3)
const bubbleBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, -1.5, 0),
    shape: bubbleShape,
    material: defaultMaterial
})


world.addBody(bubbleBody)

    
//physics floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1,0,0),
    Math.PI *0.5
)
//objects to update
const objectsToUpdate = []

//createbox

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial1 = new THREE.MeshStandardMaterial({
   map:wrapperTexture1
})
const boxMaterial2 = new THREE.MeshStandardMaterial({
    map:wrapperTexture2
 })
 const boxMaterial3 = new THREE.MeshStandardMaterial({
    map:wrapperTexture3
 })
 const boxMaterial4 = new THREE.MeshStandardMaterial({
    map:wrapperTexture4
 })

const createBox = (width, height, depth, position,rand) =>
{
    // Three.js mesh
    const mesh = new THREE.Mesh()
    switch(rand){
        case 1:
            mesh.material = boxMaterial1
        break;
        case 2:
            mesh.material = boxMaterial2
        break;
        case 3:
            mesh.material = boxMaterial3
        break;
        case 4:
            mesh.material = boxMaterial4
        break;
    }
    
    
    mesh.geometry=boxGeometry
    mesh.scale.set(width, height, depth)
    mesh.castShadow = true
    mesh.position.copy(position)
    mesh.geometry.computeBoundingBox();
    var max = mesh.geometry.boundingBox.max;
    var min = mesh.geometry.boundingBox.min;
    var height = max.y - min.y;
    var width = max.x - min.x;
    wrapperTexture3.repeat.set(width / 1 , height / 1);
    wrapperTexture3.needsUpdate = true;
    scene.add(mesh)

    // Cannon.js body
    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 10, 0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    body.addEventListener('collide', playHitSound)

    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ mesh, body })
}

// createBox(1, 1.5, 2, { x: 0, y: 3, z: 0 })




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


const houseTexture = textureLoader.load('/models/tree/holidayBake2.jpg')
const treeTexture = textureLoader.load('/models/tree/tree/tree.jpg')
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

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()




const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
 WrapperMaterial1
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
floor.position.y = -.5
scene.add(floor)

const clock = new THREE.Clock()
let oldElapsedTime = 0

floorBody.position.y = -.05
floorBody.addShape(floorShape)
floorBody.material=defaultMaterial
world.addBody(floorBody)
world.addContactMaterial(defaultContactMaterial)


/**
 * Models
 */
// const dracoLoader = new DRACOLoader()
// dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
// gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null
let action = null
let actionRev = null
let box = null
let tree = null



gltfLoader.load(
    '/models/tree/boxer.gltf',
    (gltf) =>
    {

        gltfLoader.load(
            '/models/tree/tree.gltf',
            (gltf) =>
            {   tree = gltf.scene
                tree.traverse((child) =>
                {
                    child.material = treeMaterial
                })
                tree.scale.set(0.25, 0.25, 0.25)
                scene.add(tree)
      
            }
        )
        
        gltfLoader.load(
            '/models/tree/houses.gltf',
            (gltf) =>
            { gltf.scene.traverse((child) =>
                {
                    child.material = houseMaterial
                })
                gltf.scene.scale.set(0.25, 0.25, 0.25)
                scene.add(gltf.scene)
     
            }
        )

        box=gltf.scene
        console.log(box)

        box.scale.set(0.25, 0.25, 0.25)
        box.position.y -=.03
        scene.add(box)
        box.children[0].children[1].children[1].material = houseMaterial
        box.children[0].children[1].children[1].castShadow=true
        box.children[0].children[1].castShadow=true
        box.children[0].castShadow=true
        box.castShadow=true


        // Animation
        mixer = new THREE.AnimationMixer(box)
        action = mixer.clipAction(gltf.animations[1]) 

        actionRev = mixer.clipAction(gltf.animations[0]) 

    }
)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('white', .5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('orange', 2)
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

raycaster.setFromCamera(mouse, camera)


    for (var i = 0; i < openButton.length; i++) {
        openButton[i].addEventListener('click',(event) =>
    {       
        $(".open").css("display","none")
        $(".close").css("display","block")
        audio.play()
        action.reset()
        action.weight=1
        actionRev.weight=0
          action.setEffectiveWeight(1)
        action.clampWhenFinished = true
        action.timeScale=3
        action.setLoop( THREE.LoopOnce )

        action.play()
        floor.position.copy(floorBody.position)
      })
}

for (var i = 0; i < closeButton.length; i++) {
    closeButton[i].addEventListener('click',(event) =>
{      
   
    $(".close").css("display","none")
    $(".open").css("display","block")
    audio.pause()
    actionRev.reset()
    actionRev.weight=1
    action.weight=0
    actionRev.setEffectiveWeight(1)
    actionRev.timeScale=3
    actionRev.clampWhenFinished = true
    actionRev.setLoop( THREE.LoopOnce )
    actionRev.stopFading ()
    actionRev.play()
  
})
}

for (var i = 0; i < moreButton.length; i++) {
    moreButton[i].addEventListener('click',(event) =>
{ 

    createBox(
        Math.random()*.4+.2,
        Math.random()*.4+.2,
        Math.random()*.4+.2,
        {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3
        },
       Math.floor( Math.random()*4)+1
    )
})
}

/**
 * Animate
 */


// const clock = new THREE.Clock()
let previousTime = 0
const tick = () =>
{
    for(const object of objectsToUpdate)
    {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }
    
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    world.step(1 / 60, deltaTime, 3)


    floor.position.copy( floorBody.position)
    floor.quaternion.copy(floorBody.quaternion)



    // if(box != null){
    // const intersects = raycaster.intersectObject(box.children[0].children[0])
    


    // if(intersects.length>0){

    //       box.children[0].children[1].children[0].material.color.set("yellow")
    //       console.log(intersects)
          
            
    //     }
    // else{

        
    //     box.children[0].children[1].children[0].material.color.set("violet")


    // }


    // }
    if(tree != null){
    tree.children[0].rotation.y += 0.01}

  

    if(mixer)
    {
        mixer.update(deltaTime)
    }

    controls.update()



    
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()