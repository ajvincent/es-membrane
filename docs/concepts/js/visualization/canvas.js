const CanvasController = {
  graphNames: new Map(),

  renderer: null,
  scene: null,
  camera: null,

  init: function()
  {
    try {
      this._init();
    }
    catch (e) {
      document.getElementById("error").appendChild(
        document.createTextNode(e.message + "\n\n" + e.stack)
      );
      throw e;
    }
  },

  _init: function()
  {
    this.initGraphNames();
    this.initCanvas();
  },

  initGraphNames: function() {
    this.graphNames.set("wet", 0);
    this.graphNames.set("dry", 2);
  },

  initCanvas: function()
  {
    document.getElementById("goButton").remove();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( 800, 600 );
    document.body.appendChild( this.renderer.domElement );

    this.scene = new THREE.Scene();
    this.buildGraph("wet", 0);

    // cx = 0, cy = 0, aspect ratio = 4/3
    this.camera = new THREE.OrthographicCamera(
      -200, 200, -150, 150, -100, 500
    );

    this.camera.position.x = this.camera.right - 20;
    this.camera.position.y = this.camera.bottom - 20;
    this.camera.position.z = 0;

    this.renderer.render(this.scene, this.camera);
  },

  buildGraph: function(graphName, zIndex)
  {
    void(graphName); // we'll get back to this when it comes time 

    const group = new THREE.Group();
    group.translateZ(200 * zIndex + 10);

    const sphereGeometry = new THREE.SphereGeometry(10, 100, 100);
    const meshes = new Map();

    const cylinderGeometry = new THREE.CylinderGeometry(
      10, 10, 1000000, 100, 1, true
    );
    cylinderGeometry.rotateX(Math.PI / 2);

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x7fffff,
    });
    const OFFSET = 25;

    let maxDepth = 0;
    Mocks.forEach(function(mock, index) {
      if (!meshes.has(mock.color))
      {
        const opaque = new THREE.MeshBasicMaterial({
          color: mock.color,
        });
        const translucent = opaque.clone();
        translucent.transparent = true;
        translucent.opacity = 0.3;
        meshes.set(mock.color, {
          opaque: opaque,
          translucent: translucent,
        });
      }

      const meshBases = meshes.get(mock.color);
      const sphere = new THREE.Mesh(sphereGeometry, meshBases.opaque);

      sphere.position.x = 10 + mock.depth * OFFSET;
      sphere.position.y = 10 + index * OFFSET;
      sphere.position.z = 0;
      group.add(sphere);

      if (graphName == mock.graph)
      {
        const cylinder = new THREE.Mesh(cylinderGeometry, meshBases.translucent);
        cylinder.position.x = sphere.position.x;
        cylinder.position.y = sphere.position.y;
        cylinder.position.z = 0;
        this.scene.add(cylinder);
      }

      if (mock.parent)
      {
        const parentIndex = Mocks.indexOf(mock.parent);
        const geometry = new THREE.Geometry();

        geometry.vertices.push(new THREE.Vector3(
          sphere.position.x,
          sphere.position.y,
          0
        ));
        geometry.vertices.push(new THREE.Vector3(
          sphere.position.x - OFFSET,
          sphere.position.y,
          0
        ));
        geometry.vertices.push(new THREE.Vector3(
          sphere.position.x - OFFSET,
          sphere.position.y - OFFSET * (index - parentIndex),
          0
        ));

        const line = new THREE.Line( geometry, edgeMaterial );
        group.add(line);
      }

      if (mock.depth > maxDepth)
        maxDepth = mock.depth;
    }, this);

    plane = new THREE.PlaneGeometry(400, 300, 1);
    const lightblue = new THREE.MeshBasicMaterial({
      color: 0x7f7fff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    group.add(new THREE.Mesh(plane, lightblue));
    this.scene.add(group);
  }
};
if (true)
  window.addEventListener("load", function() {
    CanvasController.init();
  }, true);
