// Authors: Sam Goertzen and Andrew Coldsmith

// We used code from a lot of tutorials and
// previous assignments then patched it all
// together to get this. A lot of the physics
// engine elements especially were copied from
// tutorials.
// Andrew worked on the physics and ball
// control, while Sam worked on the environment
// generation and camera controls.


//variable declaration section
let physicsWorld, scene, camera, renderer, rigidBodies = [], tmpTrans = null
let pos = new THREE.Vector3()
let mouseCoords = new THREE.Vector2(), raycaster = new THREE.Raycaster();
let wall, ball;
let platform = null;
let xClickD = 0;
let yClickD = 0;
let xClickU = 0;
let yClickU = 0;
let radius = 6;
let cv = document.querySelector("#canvas");
const ballStartPos = {x: 0, y: 4, z: 40};
const goalPos = {x: (Math.random() - 0.5) * 60, y: 1.3, z: (Math.random() * -10) - 20};
const STATE = { DISABLE_DEACTIVATION : 4 };
//Camera stuff
const cameraCenter = new THREE.Vector3();
const cameraHorzLimit = 50;
const cameraVertLimit = 50;
const mouse = new THREE.Vector2();

Ammo().then(start)

function start (){

    tmpTrans = new Ammo.btTransform();

    //set up mouse stuff
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    // window.addEventListener("mouseup", mouseupHandler);
    // window.addEventListener("mousedown", onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    setupPhysicsWorld();

    setupGraphics();
    createBalls();
    createDonuts();
    createCylinders();
    createStart();
    createBlock();
    ball = createBall(ballStartPos);
    createGoal(goalPos);
    setupEventHandlers();

    renderFrame();

}

function setupPhysicsWorld(){

    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

}


function setupGraphics(){

    //create clock for timing
    clock = new THREE.Clock();

    //create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xbfd1e5 );

    //create camera
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
    camera.position.set( 0, 30, 70 );
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    //Add hemisphere light
    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
    hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
    hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );

    //Add directional light
    let dirLight = new THREE.DirectionalLight( 0xffffff , 1);
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( -1, 1.75, 1 );
    dirLight.position.multiplyScalar( 100 );
    scene.add( dirLight );

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    let d = 50;

    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 13500;

    //Setup the renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xbfd1e5 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;

}


function renderFrame(){

    let deltaTime = clock.getDelta();

    updateCamera();

    renderer.render(scene, camera);

    updatePhysics( deltaTime );

    renderer.render( scene, camera );

    requestAnimationFrame( renderFrame );

}


function createBlock(){
    
    let pos = {x: 0, y: 0, z: 0};
    let scale = {x: 200, y: 2, z: 200};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    //threeJS Section
    let blockPlane = platform = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0x00ff00}));

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;

    scene.add(blockPlane);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody( body );
}


function createBall(pos){
    
    // let pos = {x: 0, y: 4, z: 40};
    let radius = 2;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;

    //threeJS Section
    let createdBall = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0xffffff}));

    createdBall.position.set(pos.x, pos.y, pos.z);
    
    createdBall.castShadow = true;
    createdBall.receiveShadow = true;

    scene.add(createdBall);

    
    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btSphereShape( radius );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    body.setActivationState( STATE.DISABLE_DEACTIVATION )

    physicsWorld.addRigidBody( body );
    rigidBodies.push(createdBall);
    
    createdBall.userData.physicsBody = body;
    createdBall.userData.tag = "ball";
                
    return createdBall;
}


function createGoal(pos){
    
    // let pos = {x: 0, y: 1.3, z: -30};
    let radius = 2;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;

    //threeJS Section
    let goal = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0x050505}));

    goal.position.set(pos.x, pos.y, pos.z);
    
    goal.castShadow = true;
    goal.receiveShadow = true;

    scene.add(goal);
}


function updatePhysics( deltaTime ){

    // Step world
    physicsWorld.stepSimulation( deltaTime, 10 );

    // Update rigid bodies
    for ( let i = 0; i < rigidBodies.length; i++ ) {
        let objThree = rigidBodies[ i ];
        let objAmmo = objThree.userData.physicsBody;
        let ms = objAmmo.getMotionState();
        if ( ms ) {

            ms.getWorldTransform( tmpTrans );
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

        }
    }
}

function setupEventHandlers(){

    window.addEventListener( 'mousedown', onMouseDown, false );
    
}

function onMouseDown (event) {
    xClickD = event.pageX;
    yClickD = event.pageY;
    console.log(`down: ${xClickD.toFixed(2)}, ${yClickD.toFixed(2)}`);
    window.removeEventListener("mousedown", onMouseDown);
    window.addEventListener( "mouseup", onMouseUp, false );
}

function onMouseUp (event) {
    xClickU = event.pageX;
    yClickU = event.pageY;
    console.log(`up: ${xClickU.toFixed(2)}, ${yClickU.toFixed(2)}`);
    window.removeEventListener("mouseup", onMouseUp);

    let resultantImpulse = new Ammo.btVector3(0.5 * (xClickD - xClickU), 0.5 * (yClickU - yClickD), -8)
    ball.userData.physicsBody.applyImpulse( resultantImpulse );
}

document.body.onkeyup = function(e) {
    if(e.keyCode == 32) {
        scene.remove(ball);
        ball = createBall(ballStartPos);
        setupEventHandlers();
    }
}

function getBallVelocity( ballPos, rimPos, angleDegrees, gravity ){
 
    // Get angle in radians, from angleDegrees argument
    const angle = THREE.Math.degToRad( angleDegrees );
   
    gravity = gravity || 9.81;
   
    // Positions of this object and the target on the same plane
    const planarRimPos  = new THREE.Vector3( rimPos.x, 0, rimPos.z ),
          planarBallPos = new THREE.Vector3( ballPos.x, 0, ballPos.z );
   
    // Planar distance between objects
    const distance = planarRimPos.distanceTo( planarBallPos );
   
    // Distance along the y axis between objects
    const yOffset = ballPos.y - rimPos.y;
   
    // Calculate velocity
    const initialVelocity = ( 1 / Math.cos( angle ) ) * Math.sqrt( ( 0.5 * gravity * Math.pow( distance, 2 ) ) / ( distance * Math.tan( angle ) + yOffset ) ),
          velocity = new THREE.Vector3( 0, initialVelocity * Math.sin( angle ), initialVelocity * Math.cos( angle ) );
     
    // Rotate our velocity to match the direction between the two objects
    const dy = planarRimPos.x - planarBallPos.x,
          dx = planarRimPos.z - planarBallPos.z,
          theta = Math.atan2( dy, dx ),
          finalVelocity = velocity.applyAxisAngle( PopAShotAR.Vector3.up, theta )
   
    return finalVelocity;
}

function randInt(min, max) {
    return parseInt(Math.random()*(max-min)+min);
}

function rand(min, max) {
    return Math.random()*(max-min)+min;
}

// Creates the five green panels of the room
// and the invisible wall for us to look into.
function createRoom() {
    const plane1Geo = new THREE.PlaneGeometry(50 + (2 * radius), 36 + (2 * radius));
    const plane1Mat = new THREE.MeshPhongMaterial({
    color: 0x60c95d, side: THREE.DoubleSide, wireframe: false});
    const plane1 = new THREE.Mesh(plane1Geo, plane1Mat);
    plane1.receiveShadow = true;
    plane1.rotateY(Math.PI / 2);
    plane1.position.x = -(40 + radius);
    scene.add(plane1);

    const plane2Geo = new THREE.PlaneGeometry(50 + (2 * radius), 36 + (2 * radius));
    const plane2Mat = new THREE.MeshPhongMaterial({
    color: 0x60c95d, side: THREE.DoubleSide, wireframe: false});
    const plane2 = new THREE.Mesh(plane2Geo, plane2Mat);
    plane2.receiveShadow = true;
    plane2.rotateY(Math.PI / 2);
    plane2.position.x = 40 + radius;
    scene.add(plane2);

    const plane3Geo = new THREE.PlaneGeometry(80 + (2 * radius), 36 + (2 * radius));
    const plane3Mat = new THREE.MeshPhongMaterial({
    color: 0x60c95d, side: THREE.DoubleSide, wireframe: false});
    const plane3 = new THREE.Mesh(plane3Geo, plane3Mat);
    plane3.receiveShadow = true;
    plane3.position.z = -(25 + radius);
    scene.add(plane3);

    const plane4Geo = new THREE.PlaneGeometry(80 + (2 * radius), 50 + (2 * radius));
    const plane4Mat = new THREE.MeshPhongMaterial({
    color: 0x60c95d, side: THREE.DoubleSide, wireframe: false});
    const plane4 = new THREE.Mesh(plane4Geo, plane4Mat);
    plane4.receiveShadow = true;
    plane4.rotateX(Math.PI / 2);
    plane4.position.y = -(18 + radius);
    scene.add(plane4);

    const plane5Geo = new THREE.PlaneGeometry(80 + (2 * radius), 50 + (2 * radius));
    const plane5Mat = new THREE.MeshPhongMaterial({
    color: 0x60c95d, side: THREE.DoubleSide, wireframe: false});
    const plane5 = new THREE.Mesh(plane5Geo, plane5Mat);
    plane5.receiveShadow = true;
    plane5.rotateX(Math.PI / 2);
    plane5.position.y = 18 + radius;
    scene.add(plane5);
}

// Generates a random amount of colored balls
// of random size and position throughout the golf course.
function createBalls() {
    let n = randInt(5, 12);
    for (let i=0; i < n; i++) {
        // let pos = {x: 0, y: 4, z: 40};
        let radius = 2;
        let quat = {x: 0, y: 0, z: 0, w: 1};
        let mass = 1;

        const r = randInt(1, 6);
        const bigSphereGeo = new THREE.SphereGeometry(r, 32, 16);
        const bigSphereMat = new THREE.MeshPhongMaterial({wireframe: false});
        const bigSphere = new THREE.Mesh(bigSphereGeo, bigSphereMat);
        bigSphere.material.color.setHSL(rand(0, 1), 4, 0.5);
        bigSphere.castShadow = true;
        bigSphere.receiveShadow = true;
        bigSphere.position.x = randInt(-40, 40);
        bigSphere.position.y = randInt(-18, 16);
        bigSphere.position.z = randInt(-25, 25);
        scene.add(bigSphere);

        //Ammojs Section
        // let transform = new Ammo.btTransform();
        // transform.setIdentity();
        // transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        // transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        // let motionState = new Ammo.btDefaultMotionState( transform );

        // let colShape = new Ammo.btSphereShape( radius );
        // colShape.setMargin( 0.05 );

        // let localInertia = new Ammo.btVector3( 0, 0, 0 );
        // colShape.calculateLocalInertia( mass, localInertia );

        // let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
        // let body = new Ammo.btRigidBody( rbInfo );

        // body.setFriction(4);
        // body.setRollingFriction(10);

        // body.setActivationState( STATE.DISABLE_DEACTIVATION )

        // physicsWorld.addRigidBody( body );
        // rigidBodies.push(bigSphere);
        
        // bigSphere.userData.physicsBody = body;
        // bigSphere.userData.tag = "ball";
    }
}

// Generates a random amount of toruses
// of random size and position throughout the golf course.
function createDonuts() {
    //Sam's blue donuts
    let n = randInt(2, 4);
    for (let i = 0; i < n; i++) {
        const R = randInt(6, 16);
        const r = randInt(2, 7);
        const donutGeo = new THREE.TorusGeometry(R, r, 30, 50);
        const donutMat = new THREE.MeshPhongMaterial({
            color: 0x3373ab, wireframe: false});
        const donut = new THREE.Mesh(donutGeo, donutMat);
        donut.rotateX(rand(0, 2*Math.PI));
        donut.rotateY(rand(0, 2*Math.PI));
        donut.rotateZ(rand(0, 2*Math.PI));
        donut.castShadow = true;
        donut.receiveShadow = true;
        donut.position.x = randInt(-40, 40);
        donut.position.y = randInt(-18, 0);
        donut.position.z = randInt(-25, 25);
        scene.add(donut);
    }
}

// Generates a random amount of cylinders or cones
// of random size and position throughout the golf course.
function createCylinders() {
    let n = randInt(2, 5);
    for (let i = 0; i < n; i++) {
        const r1 = randInt(0, 12);
        const r2 = randInt(0, 12);
        const h = randInt(3, 16);
        const cylinderGeo = new THREE.CylinderGeometry(r1, r2, h, 50, 2);
        const cylinderMat = new THREE.MeshPhongMaterial({
            color: 0x207a1d, wireframe: false});
        const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
        cylinder.rotateX(rand(0, 2*Math.PI));
        cylinder.rotateY(rand(0, 2*Math.PI));
        cylinder.rotateZ(rand(0, 2*Math.PI));
        cylinder.castShadow = true;
        cylinder.receiveShadow = true;
        cylinder.position.x = randInt(-40, 40);
        cylinder.position.y = randInt(-18, 0);
        cylinder.position.z = randInt(-25, 25);
        scene.add(cylinder);
    }
}

// Creates a white circle symbolizing the start of 
// the hole (the tee) at the lower right hand front
// side of the green.
function createStart() {
    const startGeo = new THREE.CircleGeometry(6, 50);
    const startMat = new THREE.MeshPhongMaterial(
        {color: 0xffffff, wireframe: false, side: THREE.DoubleSide});
    const start = new THREE.Mesh(startGeo, startMat);
    start.receiveShadow = true;
    start.position.x = 40;
    start.position.y = -15;
    start.position.z = 25;
    start.rotateX(-Math.PI/2);
    scene.add(start);
}

// Creates a black hexagon symbolizing the end of
// the hole (the flag) at the back lower left hand corner
// of the green.
// function createGoal() {
//     const goalGeo = new THREE.CircleGeometry(5, 6);
//     const goalMat = new THREE.MeshPhongMaterial(
//         {color: 0x000000, wireframe: false, side: THREE.DoubleSide});
//     const goal = new THREE.Mesh(goalGeo, goalMat);
//     goal.receiveShadow = true;
//     goal.position.x = -40;
//     goal.position.y = -23.99;
//     goal.position.z = -25;
//     goal.rotateX(-Math.PI/2);
//     scene.add(goal);
// }

function updateCamera() {
    //offset the camera x/y based on the mouse's position in the window
    camera.position.x = cameraCenter.x + (cameraHorzLimit * mouse.x);
    camera.position.y = cameraCenter.y + (cameraVertLimit * mouse.y) + 60;
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}