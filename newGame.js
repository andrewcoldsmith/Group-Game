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
let cv = document.querySelector("#canvas");
const ballStartPos = {x: 0, y: 4, z: 40};
const goalPos = {x: (Math.random() - 0.5) * 60, y: 1.3, z: (Math.random() * -10) - 20};
const STATE = { DISABLE_DEACTIVATION : 4 };

Ammo().then(start)

function start (){

    tmpTrans = new Ammo.btTransform();

    setupPhysicsWorld();

    setupGraphics();
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
    let goal = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0x55ff55}));

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