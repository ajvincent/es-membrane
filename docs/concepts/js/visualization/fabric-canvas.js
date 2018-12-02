const FabricCanvas = {
  init: function() {
    this.canvas = new fabric.Canvas('fabricCanvas');

    // create a rectangle object
    var rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'red',
      width: 20,
      height: 20
    });

    // "add" rectangle onto canvas
    this.canvas.add(rect);
  }
};
void(FabricCanvas);
