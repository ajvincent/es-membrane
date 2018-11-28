NavigationController.addPageDriver({
  // The path specified in ../../../index.html for this page
  path: "template/main",

  // What kind of slide are we dealing with?
  slideType: "HTML",

  /**
   * Initializing the scene and/or the content.
   */
  init: function() {
  },

  // THREE.Scene for the WebGLController.
  scene: null,

  // HTMLSectionElement from NavigationController for the HTML- or SVG-based slide.
  slideContent: null,

  // HTMLSectionElement from NavigationController for the HTML-based text.
  textContent: null,
});
