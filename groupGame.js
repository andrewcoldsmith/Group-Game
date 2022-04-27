// Author Andrew Coldsmith
// I copied much of this from THREEJS documentation,
// but it was mostly individual lines that I then edited.
// I followed a tutorial called: Build a Mindblowing 3D 
// Portfolio Website by Fireship to help me set up THREEJS 
// with VS Code, but I didn't really use any code from that. 
// 3D objects, lights, and the camera were all builtin 
// features that I added and then edited. The bouncing
// animation, sphere collision, and color effects were
// all done by me.

// import './style.css';
import './three.js';
// import * as THREE from 'three';

const speed = 0.5
const sphereCount = 4;
let spheres = [];
let x = [];
let y = [];
let z = [];
let hue = [];
for (let i = 0; i < sphereCount; i++) {
  x.push(Math.random() < 0.5 ? -speed : speed);
  y.push(Math.random() < 0.5 ? -speed : speed);
  z.push(Math.random() < 0.5 ? -speed : speed);
}
for (let i = 0; i < sphereCount; i++) {
  hue.push(Math.trunc(Math.random() * 1000) / 1000);
}
let radius = 6;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth  / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.shadowMap.enabled = true;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(45);

renderer.render(scene, camera);

const ambLight = new THREE.AmbientLight(0x404040);
scene.add(ambLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 700);
pointLight.position.set(35, 10, 40);
pointLight.castShadow = true;
scene.add(pointLight);

pointLight.shadow.mapSize.width = 712;
pointLight.shadow.mapSize.height = 712;
pointLight.shadow.camera.near = 7;
pointLight.shadow.camera.far = 500;

const plane1Geo = new THREE.PlaneGeometry(50 + (2 * radius), 36 + (2 * radius));
const plane1Mat = new THREE.MeshPhongMaterial({
  color: 0x7c7d80, side: THREE.DoubleSide, wireframe: false});
const plane1 = new THREE.Mesh(plane1Geo, plane1Mat);
plane1.receiveShadow = true;
plane1.rotateY(Math.PI / 2);
plane1.position.x = -(40 + radius);
scene.add(plane1);

const plane2Geo = new THREE.PlaneGeometry(50 + (2 * radius), 36 + (2 * radius));
const plane2Mat = new THREE.MeshPhongMaterial({
  color: 0x7c7d80, side: THREE.DoubleSide, wireframe: false});
const plane2 = new THREE.Mesh(plane2Geo, plane2Mat);
plane2.receiveShadow = true;
plane2.rotateY(Math.PI / 2);
plane2.position.x = 40 + radius;
scene.add(plane2);

const plane3Geo = new THREE.PlaneGeometry(80 + (2 * radius), 36 + (2 * radius));
const plane3Mat = new THREE.MeshPhongMaterial({
  color: 0x7c7d80, side: THREE.DoubleSide, wireframe: false});
const plane3 = new THREE.Mesh(plane3Geo, plane3Mat);
plane3.receiveShadow = true;
plane3.position.z = -(25 + radius);
scene.add(plane3);

const plane4Geo = new THREE.PlaneGeometry(80 + (2 * radius), 50 + (2 * radius));
const plane4Mat = new THREE.MeshPhongMaterial({
  color: 0x7c7d80, side: THREE.DoubleSide, wireframe: false});
const plane4 = new THREE.Mesh(plane4Geo, plane4Mat);
plane4.receiveShadow = true;
plane4.rotateX(Math.PI / 2);
plane4.position.y = -(18 + radius);
scene.add(plane4);

const plane5Geo = new THREE.PlaneGeometry(80 + (2 * radius), 50 + (2 * radius));
const plane5Mat = new THREE.MeshPhongMaterial({
  color: 0x7c7d80, side: THREE.DoubleSide, wireframe: false});
const plane5 = new THREE.Mesh(plane5Geo, plane5Mat);
plane5.receiveShadow = true;
plane5.rotateX(Math.PI / 2);
plane5.position.y = 18 + radius;
scene.add(plane5);

const sphereGeo = new THREE.SphereGeometry(radius, 32, 16);
const sphereMat1 = new THREE.MeshPhongMaterial({wireframe: false});
const sphere1 = new THREE.Mesh(sphereGeo, sphereMat1);
sphere1.material.color.setHSL(hue[0], 1, 0.5);
sphere1.castShadow = true;
sphere1.receiveShadow = true;
spheres.push(sphere1);
sphere1.position.x = -30;
sphere1.position.y = 12;
sphere1.position.z = -18;
scene.add(sphere1);

const sphereMat2 = new THREE.MeshPhongMaterial({wireframe: false});
const sphere2 = new THREE.Mesh(sphereGeo, sphereMat2);
sphere2.material.color.setHSL(hue[1], 1, 0.5);
sphere2.castShadow = true;
sphere2.receiveShadow = true;
spheres.push(sphere2);
sphere2.position.x = 10;
sphere2.position.y = 10;
sphere2.position.z = -12;
scene.add(sphere2);

const sphereMat3 = new THREE.MeshPhongMaterial({wireframe: false});
const sphere3 = new THREE.Mesh(sphereGeo, sphereMat3);
sphere3.material.color.setHSL(hue[2], 1, 0.5);
sphere3.castShadow = true;
sphere3.receiveShadow = true;
spheres.push(sphere3);
sphere3.position.x = -10;
sphere3.position.y = -10;
sphere3.position.z = 12;
scene.add(sphere3);

const sphereMat4 = new THREE.MeshPhongMaterial({wireframe: false});
const sphere4 = new THREE.Mesh(sphereGeo, sphereMat4);
sphere4.material.color.setHSL(hue[3], 1, 0.5);
sphere4.castShadow = true;
sphere4.receiveShadow = true;
spheres.push(sphere4);
sphere4.position.x = 30;
sphere4.position.y = -12;
sphere4.position.z = 18;
scene.add(sphere4);

renderer.render(scene, camera);

function animate() {
  requestAnimationFrame(animate);

  for (let i = 0; i < sphereCount; i++) {
    hue[i] += (0.001 * (i + 1));
    if (hue[i] > 1) {
      hue[i] = 0.000;
    }
    spheres[i].material.color.setHSL(hue[i], 1, 0.5);

    spheres[i].position.x += x[i];
    spheres[i].position.y += y[i];
    spheres[i].position.z += z[i];

    if (spheres[i].position.x > 40) {
      x[i] = -speed;
    }
    if (spheres[i].position.x < -40) {
      x[i] = speed;
    }
    if (spheres[i].position.y > 18) {
      y[i] = -speed;
    }
    if (spheres[i].position.y < -18) {
      y[i] = speed;
    }
    if (spheres[i].position.z > 25) {
      z[i] = -speed;
    }
    if (spheres[i].position.z < -25) {
      z[i] = speed;
    }

    for (let j = i + 1; j < sphereCount; j++) {
      let xyzDif = [
        {axis: "x", value: Math.abs(spheres[i].position.x - spheres[j].position.x)},
        {axis: "y", value: Math.abs(spheres[i].position.y - spheres[j].position.y)},
        {axis: "z", value: Math.abs(spheres[i].position.z - spheres[j].position.z)}
      ];
      if (xyzDif[0].value < (2 * radius) && xyzDif[1].value < (2 * radius) && xyzDif[2].value < (2 * radius)) {
        console.log("*plink*");
        let hueSwitch = hue[i];
        hue[i] = hue[j];
        hue[j] = hueSwitch;
        xyzDif.sort(function(a, b){return b.value - a.value});
        if (xyzDif[0].axis == "x") {
          if (spheres[i].position.x > spheres[j].position.x) {
            x[i] = speed;
            x[j] = -speed;
          }
          else { // if (spheres[i].position.x < spheres[j].position.x)
            x[i] = -speed;
            x[j] = speed;
          }
        }
        else if (xyzDif[0].axis == "y") {
          if (spheres[i].position.y > spheres[j].position.y) {
            y[i] = speed;
            y[j] = -speed;
          }
          else { // if (spheres[i].position.y < spheres[j].position.y)
            y[i] = -speed;
            y[j] = speed;
          }
        }
        else { // if (xyzDif[0].axis == "z")
          if (spheres[i].position.z > spheres[j].position.z) {
            z[i] = speed;
            z[j] = -speed;
          }
          else { // if (spheres[i].position.z < spheres[j].position.z)
            z[i] = -speed;
            z[j] = speed;
          }
        }
      }
    }
  }

  renderer.render(scene, camera);
}

animate();