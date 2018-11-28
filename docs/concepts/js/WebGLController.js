const WebGLController = (function() {
"use strict";
return {
  // THREE.js primary objects.  @private
  renderer: null,
  camera: null,
  scene: null,
  emptyScene: null,
  font: null,

  /**
   * True if we're painting the scene continuously.
   *
   * @private
   */
  autoRepaint: false,

  /**
   * Load a three.js font for use in WebGL.
   *
   * @returns {Promise<undefined>} A callback to indicate success.
   *
   * @private
   */
  loadFont: function() {
    var resolve;
    const p = new Promise(function(res) {
      resolve = res;
    });
    const loader = new THREE.FontLoader();
    loader.load(
      MasterController.baseURI + '/libraries/three-js-r98/fonts/droid/droid_sans_regular.typeface.json',
      function(font) {
        WebGLController.font = font;
        resolve();
      }
    );
    return p;
  },

  /**
   * True if we should continue to paint the canvas.
   *
   * @private
   */
  get isPaintingContinuous() {
    return (this.scene && this.autoRepaint &&
            (MasterController.selectedSlide == this.renderer.domElement));
  },

  /**
   * Replace the scene that the camera sees.
   *
   * @param scene       {THREE.Scene} The scene to paint.
   * @param autoRepaint {Boolean} True for repainting the scene continuously.
   */
  setSceneAndShow: function(scene, autoRepaint)
  {
    const wasPainting = this.isPaintingContinuous;
    MasterController.selectedSlide = this.renderer.domElement;
    this.scene = scene;
    this.autoRepaint = autoRepaint;
    if (!wasPainting)
      this.repaint();
  },

  /**
   * Redraw the scene and potentially schedule the next draw.
   *
   * @private
   */
  repaint: function() {
    this.renderer.render(this.scene || this.emptyScene, this.camera);
    if (this.isPaintingContinuous)
      requestAnimationFrame(this.repaint);
  },

  /**
   * Initialize the WebGL controller.
   */
  init: async function()
  {
    if (!this.font)
      await this.loadFont();

    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("WebGLCanvas")
    });

    this.emptyScene = new THREE.Scene();
    this.emptyScene.background = new THREE.Color( 0xffffff );

    // cx = 0, cy = 0, aspect ratio = 4/3
    this.camera = new THREE.OrthographicCamera(
      -200, 200, -150, 150, -100, 500
    );

    this.camera.position.x = this.camera.right - 20;
    this.camera.position.y = this.camera.bottom - 20;
    this.camera.position.z = 0;

    this.repaint = this.repaint.bind(this);
    this.repaint();
  }
};
})();
void(WebGLController);
