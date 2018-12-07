const FabricController = (function() {
"use strict";  
return {
  // FabricJS objects.  @private
  canvas: null,

  setGroupAndShow: function(group) {
    MasterController.selectedSlide = this.canvas.getElement().parentNode;
    this.canvas.add(group);
  },

  /**
   * Initialize the FabricJS controller.
   */
  init: function() {
    let p = Promise.resolve();
    const canvasElement = document.getElementById('FabricCanvas');
    const slideBox = MasterController.slideContent.getBoundingClientRect();

    this.canvas = new fabric.Canvas(canvasElement, {
      width: slideBox.width,
      height: slideBox.height,
    });
    this.canvas.setZoom(this.canvas.width / 1600);

    return p;
  }
};

})();
void(FabricController);
