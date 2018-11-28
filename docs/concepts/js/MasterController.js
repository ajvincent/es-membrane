const MasterController = (function() {
"use strict";
return {
  /**
   * The currently visible HTML canvas or SVG diagram.
   */
  get selectedSlide()
  {
    return this.slideContent.getElementsByClassName("visible")[0];
  },
  set selectedSlide(slide)
  {
    const previous = this.selectedSlide;
    previous.classList.remove("visible");
    slide.classList.add("visible");
  },

  get selectedPage()
  {
    return this.pagedContent.getElementsByClassName("visible")[0];
  },
  set selectedPage(page)
  {
    const previous = this.selectedPage;
    previous.classList.remove("visible");
    page.classList.add("visible");
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
    this.selectedSlide = panel;
    throw e;
  },

  /**
   * Set up the remaining controllers.
   */
  init: function()
  {
    this.pagedContent = document.getElementById("pagedContent");
    this.slideContent = document.getElementById("slides");

    this.baseURI = '..';
    if (document.location.protocol == "file:")
      this.baseURI = "https://ajvincent.github.io/es-membrane";

    var p;
    try
    {
      p = Promise.all([
        WebGLController.init(),
        PopcornController.init(),
        PageContentLoader.init(),
      ]);
      p = p.then(function() {
        NavigationController.init();
      });
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
