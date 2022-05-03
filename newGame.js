//variable declaration section
let physicsWorld, scene, camera, renderer, rigidBodies = [], tmpTrans = null
let platform = null;

Ammo().then(start)

function start (){

    tmpTrans = new Ammo.btTransform();

    setupPhysicsWorld();

    setupGraphics();
    createBlock();
    createBall();
    createGoal();

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


function createBall(){
    
    let pos = {x: 0, y: 4, z: 40};
    let radius = 2;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;

    //threeJS Section
    let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0xffffff}));

    ball.position.set(pos.x, pos.y, pos.z);
    
    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


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


    physicsWorld.addRigidBody( body );
    
    ball.userData.physicsBody = body;
    rigidBodies.push(ball);
}


function createGoal(){
    
    let pos = {x: 0, y: 1.3, z: -30};
    let radius = 2;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;

    //threeJS Section
    let goal = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0x55ff55}));

    goal.position.set(pos.x, pos.y, pos.z);
    
    goal.castShadow = true;
    goal.receiveShadow = true;

    scene.add(goal);


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


    // physicsWorld.addRigidBody( body );
    
    // goal.userData.physicsBody = body;
    // rigidBodies.push(goal);
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

    detectCollision();

}

function detectCollision(){

	let dispatcher = physicsWorld.getDispatcher();
	let numManifolds = dispatcher.getNumManifolds();

	for ( let i = 0; i < numManifolds; i ++ ) {

		let contactManifold = dispatcher.getManifoldByIndexInternal( i );
		let numContacts = contactManifold.getNumContacts();

		for ( let j = 0; j < numContacts; j++ ) {

			let contactPoint = contactManifold.getContactPoint( j );
			let distance = contactPoint.getDistance();

            if( distance > 0.0 ) {
			    console.log({manifoldIndex: i, contactIndex: j, distance: distance});
            }
		}


	}

}

// const speed = 0.5
// const sphereCount = 4;
// let spheres = [];
// let x = [];
// let y = [];
// let z = [];
// let hue = [];
// for (let i = 0; i < sphereCount; i++) {
//   x.push(Math.random() < 0.5 ? -speed : speed);
//   y.push(Math.random() < 0.5 ? -speed : speed);
//   z.push(Math.random() < 0.5 ? -speed : speed);
// }
// for (let i = 0; i < sphereCount; i++) {
//   hue.push(Math.trunc(Math.random() * 1000) / 1000);
// }
// let radius = 6;

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth  / window.innerHeight, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer({
//   canvas: document.querySelector('#bg'),
// });

// renderer.shadowMap.enabled = true;

// renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(window.innerWidth, window.innerHeight);
// camera.position.setZ(45);

// renderer.render(scene, camera);

// const ambLight = new THREE.AmbientLight(0x404040);
// scene.add(ambLight);

// const pointLight = new THREE.PointLight(0xffffff, 1, 700);
// pointLight.position.set(35, 10, 40);
// pointLight.castShadow = true;
// scene.add(pointLight);

// pointLight.shadow.mapSize.width = 712;
// pointLight.shadow.mapSize.height = 712;
// pointLight.shadow.camera.near = 7;
// pointLight.shadow.camera.far = 500;

// const plane4Geo = new THREE.PlaneGeometry(80 + (2 * radius), 50 + (2 * radius));
// const plane4Mat = new THREE.MeshPhongMaterial({
//   color: 0x7c7d80, side: THREE.DoubleSide, wireframe: false});
// const plane4 = new THREE.Mesh(plane4Geo, plane4Mat);
// plane4.receiveShadow = true;
// plane4.rotateX(Math.PI / 2);
// plane4.position.y = -(18 + radius);
// scene.add(plane4);

// renderer.render(scene, camera);