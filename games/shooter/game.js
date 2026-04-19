import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- CONFIG ---
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
if (isMobile) document.getElementById('mobile-overlay').style.display = 'block';

// --- SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- LIGHT ---
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
scene.add(light);

// --- OBJECTS ---
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const targetGeo = new THREE.SphereGeometry(0.5, 32, 32);
const targetMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const target = new THREE.Mesh(targetGeo, targetMat);
target.position.set(0, 1.6, -5);
scene.add(target);

// --- CONTROLS ---
const controls = new PointerLockControls(camera, document.body);
const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);

// Start-Logik
document.addEventListener('click', () => {
    if (!isMobile && !controls.isLocked) controls.lock();
});

// Schießen-Funktion
function shoot() {
    raycaster.setFromCamera(center, camera);
    const hits = raycaster.intersectObject(target);
    if (hits.length > 0) {
        target.position.x = (Math.random() - 0.5) * 10;
        target.position.z = -Math.random() * 10 - 2;
        target.material.color.set(Math.random() * 0xffffff);
    }
}

// --- INPUT HANDLING ---
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;

// Desktop
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') moveForward = true;
    if (e.code === 'KeyS') moveBackward = true;
    if (e.code === 'KeyA') moveLeft = true;
    if (e.code === 'KeyD') moveRight = true;
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') moveForward = false;
    if (e.code === 'KeyS') moveBackward = false;
    if (e.code === 'KeyA') moveLeft = false;
    if (e.code === 'KeyD') moveRight = false;
});
window.addEventListener('mousedown', () => { if(controls.isLocked) shoot(); });

// Mobile (Touch)
if (isMobile) {
    const lookArea = document.getElementById('look-area');
    const joyArea = document.getElementById('joystick-area');
    
    lookArea.addEventListener('touchstart', (e) => { shoot(); });
    lookArea.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        // Einfaches Umsehen per Wischen
        camera.rotation.y -= (touch.force || 0.1) * 0.1; 
    });

    joyArea.addEventListener('touchstart', () => { moveForward = true; });
    joyArea.addEventListener('touchend', () => { moveForward = false; });
}

// --- GAME LOOP ---
const velocity = new THREE.Vector3();
let prevTime = performance.now();

function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    if (controls.isLocked || isMobile) {
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.x -= velocity.x * 10.0 * delta;

        if (moveForward) velocity.z -= 50.0 * delta;
        if (moveBackward) velocity.z += 50.0 * delta;
        if (moveLeft) velocity.x -= 50.0 * delta;
        if (moveRight) velocity.x += 50.0 * delta;

        controls.moveForward(-velocity.z * delta);
        controls.moveRight(-velocity.x * delta);
    }

    renderer.render(scene, camera);
    prevTime = time;
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
