import * as THREE from 'three';

// --- SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Voodoo Blau

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // ECHTE SCHATTEN!
document.body.appendChild(renderer.domElement);

// --- LICHT (Macht den Look!) ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5, 10, 5);
sun.castShadow = true;
scene.add(sun);

// --- WELT ---
const groundGeo = new THREE.PlaneGeometry(100, 1000);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x9ACD32 }); // Gras
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// --- FLUGZEUG (Karton-Style) ---
const planeGroup = new THREE.Group();
const bodyGeo = new THREE.BoxGeometry(0.5, 0.4, 2);
const cardboardMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c }); // Karton
const body = new THREE.Mesh(bodyGeo, cardboardMat);
body.castShadow = true;
planeGroup.add(body);

// Flügel (werden später sichtbar bei Upgrades)
const wingGeo = new THREE.BoxGeometry(2.5, 0.05, 0.6);
const wings = new THREE.Mesh(wingGeo, cardboardMat);
wings.position.y = 0.1;
wings.visible = false; // Startet ohne Flügel
planeGroup.add(wings);

scene.add(planeGroup);
camera.position.set(0, 2, 5);

// --- LOGIK ---
let speed = 0;
let altitude = 0.5;
let isFlying = false;
let money = 0;
let dist = 0;
let lvlWings = false;

document.getElementById('start-btn').onclick = () => {
    isFlying = true;
    speed = 0.5; // Katapult-Schwung
    document.getElementById('menu').classList.add('hidden');
};

function animate() {
    requestAnimationFrame(animate);

    if (isFlying) {
        // Flug-Physik
        dist += speed;
        altitude += (speed * 0.1) - 0.05; // Steigen/Sinken
        speed *= 0.995; // Luftwiderstand

        planeGroup.position.z -= speed;
        planeGroup.position.y = altitude;

        // Kamera folgt dem Flugzeug
        camera.position.z = planeGroup.position.z + 5;
        camera.position.y = planeGroup.position.y + 2;
        camera.lookAt(planeGroup.position);

        // Boden-Loop (damit die Welt nicht endet)
        if (dist % 50 < 0.5) ground.position.z -= 50;

        // Landung
        if (altitude <= 0.2) {
            isFlying = false;
            money += Math.floor(dist / 2);
            document.getElementById('menu').classList.remove('hidden');
            // Reset für nächsten Start
            planeGroup.position.set(0, 0.5, 0);
            dist = 0; altitude = 0.5;
        }
    }

    updateUI();
    renderer.render(scene, camera);
}

function updateUI() {
    document.getElementById('money').innerText = money;
    document.getElementById('dist').innerText = Math.floor(dist);
}

// Global für Buttons
window.upgrade = (type) => {
    if (type === 'wings' && money >= 150) {
        money -= 150;
        wings.visible = true;
        lv wings = true;
    }
    updateUI();
};

animate();
