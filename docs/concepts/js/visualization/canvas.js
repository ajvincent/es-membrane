const CanvasController = {
  enableDamp: false,

  // THREE.js primary objects
  renderer: null,
  scene: null,
  camera: null,
  font: null,

  graphNames: new Map(/* graphName: z-offset */),
  planeLabelMaterials: new Map(/* graphName: new THREE.Material() */),

  // HTML elements
  _delta: null,
  _autoRotate: null,

  /**
   * Run the initialization, and if it throws, log it.
   */
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

  /**
   * The real initialization function.
   *
   * @private
   */
  _init: function()
  {
    if (!this.font)
    {
      const loader = new THREE.FontLoader();
      var baseURI = '..';
      if (document.location.protocol == "file:")
        baseURI = "https://ajvincent.github.io/es-membrane";
      loader.load(
        baseURI + '/libraries/three-js-r98/fonts/droid/droid_sans_regular.typeface.json',
        function(font) {
          CanvasController.font = font;
          CanvasController.init();
        }
      );
      return;
    }

    document.getElementById("goButton").remove();
    document.getElementById("form").reset();
    this._delta = document.getElementById("delta");
    this._autoRotate = document.getElementById("autoRotate");

    this.initGraphNames();
    this.initCanvas();

    this.repaint = this.repaint.bind(this);
    this.maybeRepaint();
  },

  /**
   * Set a few constants for positioning the object graphs.
   *
   * @private
   */
  initGraphNames: function()
  {
    this.graphNames.set("wet", +1);
    this.graphNames.set("dry", -1);
    this.graphNames.set("damp", 0);
  },

  /**
   * Build the WebGL canvas and its contents.
   *
   * @private
   */
  initCanvas: function()
  {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( 800, 600 );
    document.body.appendChild( this.renderer.domElement );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffff );

    this.mainGroup = new THREE.Group();

    /* Yes, these are magic numbers... but they also represent the center of
     * rotation for the objects we care about.
     */
    this.mainGroup.translateX(100);
    this.mainGroup.translateY(75);
    this.mainGroup.translateZ(-210);

    this.scene.add(this.mainGroup);

    this.buildGraph("wet");
    this.buildGraph("dry");
    if (this.enableDamp)
      this.buildGraph("damp");

    // cx = 0, cy = 0, aspect ratio = 4/3
    this.camera = new THREE.OrthographicCamera(
      -200, 200, -150, 150, -100, 500
    );

    this.camera.position.x = this.camera.right - 20;
    this.camera.position.y = this.camera.bottom - 20;
    this.camera.position.z = 0;
  },

  /**
   * A Date.
   *
   * @private
   */
  startTime: null,

  /**
   * The current delta value.
   *
   * @private
   */
  currentDelta: 0,

  /**
   * Update the canvas's rotation and redraw it.
   */
  repaint: function() {
    var delta;
    if (this._autoRotate.checked)
    {
      delta = ((new Date() - this.startTime) / 5000) % 2;
      delta = 1 - Math.abs(delta - 1);
      this.currentDelta = delta;
    }
    else
      delta = this._delta.valueAsNumber;

    delta *= Math.PI / 2;
    this.mainGroup.rotation.set(delta * 2/3, 0, delta * -1/3);

    this.planeLabelMaterials.forEach(function(textMaterial, graphName) {
      if (graphName == "wet")
      {
        textMaterial.opacity = 1.0;
        return;
      }

      if (delta > 0.5)
        textMaterial.opacity = 1.0;
      else if (delta < 0.3)
        textMaterial.opacity = 0.0;
      else
        textMaterial.opacity = (delta - 0.3) * 5;
    });

    this.renderer.render(this.scene, this.camera);

    if (this._autoRotate.checked)
      requestAnimationFrame(this.repaint);
  },

  /**
   * Are we okay to repaint the image?
   */
  maybeRepaint: function()
  {
    if (!this._autoRotate.checked)
      this.repaint(this._delta.valueAsNumber);
  },

  /**
   * Start or stop automatic rotation.
   */
  setAutoRotate: function()
  {
    this._delta.disabled = this._autoRotate.checked;
    if (this._autoRotate.checked)
    {
      this.startTime = new Date();
      this.startTime -= this._delta.valueAsNumber * 5000;
      this.repaint();
    }
    else
    {
      this._delta.valueAsNumber = this.currentDelta;
    }
  },

  /**
   * Helper for illustrating where the x, y, and z axes are.
   */
  standardUnitVectors: function() {
    for (let i = 0; i < 3; i++) {
      const dirVector = new THREE.Vector3(0, 0, 0);
      const args = [0, 0, 0];
      args[i] = 1;
      dirVector.set.apply(dirVector, args);
      const origin = new THREE.Vector3( 0, 0, 0 );
      const length = 50;
      const hex = 0xff << ((2 - i) * 8);
      const arrow = new THREE.ArrowHelper(dirVector, origin, length, hex, 5, 10);

      this.mainGroup.add(arrow);
    }
  },

  /**
   * Build an object graph plane, its nodes and cylinders cutting through it.
   *
   * Objects are represented by solid spheres.  Proxies appear as wireframe
   * hemispheres with their flat edges facing the original objects.  Edges of a
   * graph live entirely within the object graph, and do not cross between
   * graphs.
   */
  buildGraph: function(graphName)
  {
    // Set-up.
    const group = new THREE.Group();
    const OFFSET = 25;
    let maxDepth = 0;
    group.translateX(-OFFSET);

    const textMaterial = new THREE.MeshBasicMaterial({
      color: "yellow",
      transparent: true,
      opacity: 1.0,
    });
    this.planeLabelMaterials.set(graphName, textMaterial);

    const sphereGeometry = new THREE.SphereGeometry(10, 100, 100);
    const cylinderGeometry = new THREE.CylinderGeometry(
      10, 10, 500, 100, 1, false
    );
    cylinderGeometry.rotateX(Math.PI / 2);
    const hemisphereGeometry = new THREE.SphereGeometry(
      10, 20, 4, 0, Math.PI * 2, Math.PI / 2,  Math.PI / 2
    );

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x7fffff,
    });
    const meshes = new Map();

    /* Build each node of the object graph and draw its sphere (or hemisphere),
     * cylinder connecting objects and proxies together, and the edges
     * connecting an object to its parent object.
     */
    const Mocks = DOM_Mocks();
    Mocks.forEach(function(mock, index) {
      if (!meshes.has(mock.color))
      {
        const opaque = new THREE.MeshBasicMaterial({
          color: mock.color,
        });

        const translucent = opaque.clone();
        translucent.transparent = true;
        translucent.opacity = 0.3;

        const hollow = opaque.clone();
        hollow.wireframe = true;

        meshes.set(mock.color, {
          opaque,
          translucent,
          hollow,
        });
      }

      const isMain = (graphName == mock.graph);
      const meshBases = meshes.get(mock.color);
      const sphere = new THREE.Mesh(
        isMain ? sphereGeometry : hemisphereGeometry,
        isMain ? meshBases.opaque : meshBases.hollow
      );

      sphere.position.x = mock.depth * OFFSET;
      sphere.position.y = index * OFFSET;
      sphere.position.z = 0;
      if (!isMain)
      {
        const z_orig = this.graphNames.get(mock.graph);
        const z_self = this.graphNames.get(graphName);
        const dir = Math.sign(z_orig - z_self);
        sphere.rotateX(dir * Math.PI / 2);
      }
      group.add(sphere);

      let labelText = mock.name;

      if (graphName == mock.graph)
      {
        const cylinder = new THREE.Mesh(cylinderGeometry, meshBases.translucent);
        cylinder.position.x = sphere.position.x - OFFSET;
        cylinder.position.y = sphere.position.y;
        cylinder.position.z = 0;
        this.mainGroup.add(cylinder);
      }
      else
      {
        labelText = `Proxy(${labelText})`;
      }

      {
        const textGeometry = new THREE.TextBufferGeometry(
          labelText,
          {
            font: this.font,
            size: 6,
            height: 1,
          }
        );
        const text = new THREE.Mesh(textGeometry, textMaterial);
        text.rotateX(Math.PI);
        text.position.x = sphere.position.x + sphere.geometry.parameters.radius + 2;
        text.position.y = sphere.position.y;
        text.position.z = 1;
        group.add(text);
      }

      if (mock.parent) // needs edge lines
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

    // The object graph itself as an Euclidean plane.
    {
      const planeGeo = new THREE.PlaneGeometry(200, 170, 1);
      const lightblue = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      plane = new THREE.Mesh(planeGeo, lightblue);
      plane.translateX(75);
      plane.translateY(60);
      group.add(plane);

      const textGeometry = new THREE.TextBufferGeometry(
        `"${graphName}" object graph`,
        {
          font: this.font,
          size: 6,
          height: 1,
        }
      );

      const text = new THREE.Mesh(textGeometry, textMaterial);
      text.rotateX(Math.PI);
      text.position.x = 95;
      text.position.y = 140;
      text.position.z = 1;
      group.add(text);
    }

    // Finalization.
    group.translateZ(100 * this.graphNames.get(graphName));
    this.mainGroup.add(group);
  }
};

if (true)
  window.addEventListener("load", function() {
    CanvasController.init();
  }, true);
