const MasterController = (function() {
"use strict";
return {
  /**
   * The currently visible HTML canvas or SVG diagram.
   */
  get selectedDiagram()
  {
    return document.getElementById("figureDisplays")
                   .getElementsByClassName("visible")[0];
  },
  set selectedDiagram(diagram)
  {
    const previous = this.selectedDiagram;
    previous.classList.remove("visible");
    diagram.classList.add("visible");
  },

  /**
   * When things go wrong, it needs to be obvious.
   *
   * @param e {Error} The thrown exception.
   *
   * @private
   */
  showError: function(e)
  {
    const panel = document.getElementById("error");
    panel.appendChild(
      document.createTextNode(e ? e.message + "\n\n" + e.stack : e)
    );
    this.selectedDiagram = panel;
    throw e;
  },

  /**
   * Set up the remaining controllers.
   */
  init: function()
  {
    var p;
    try
    {
      p = Promise.all([
        WebGLController.init(),
        PopcornController.init(),
        NavigationController.init(),
      ]);
    }
    catch (exn)
    {
      p = Promise.reject(exn);
    }
    finally {
      p = p.then(
        null,
        (e) =>
        {
          this.showError(e);
        }
      );
    }
  }
};
})();
void(MasterController);
