const NavigationController = (function() {
"use strict";

const allowedSlideTypes = [
  "THREE.Scene",
  "HTML",
  "SVG",
];

return {
  pageDrivers: new Map(/*
    path: {
      // Provided by the page script
      path: "templatePath",
      slideType: "HTML" or "THREE.Scene" or "SVG",
      init: function() { ... },
      show: function() { ... },
      hide: function() { ... }, // optional

      // Provided by this script:
      scene: THREE.Scene(),
      textContent: HTMLSectionElement,
      slideContent: HTMLSectionElement or SVGGElement,
    }
  */),

  /**
   * Add a page driver to listen for init, show, hide commands.
   *
   * @param driver {Object} The driver to add.
   */
  addPageDriver: function(driver) {
    // Validation
    const {resolve, reject} = PageContentLoader.scriptResolutions.get(driver.path);
    if (!allowedSlideTypes.includes(driver.slideType)) {
      reject(new Error(`Invalid slide type (${driver.slideType}) for driver ${driver.path}`));
      return;
    }

    if (typeof driver.init !== "function") {
      reject(new Error(`Missing init method for driver ${driver.path}`));
      return;
    }

    if (typeof driver.show === "undefined")
      driver.show = function() {};
    else if (typeof driver.show !== "function") {
      reject(new Error(`Missing show method for driver ${driver.path}`));
      return;
    }

    if (typeof driver.hide === "undefined")
      driver.hide = function() {};
    else if (typeof driver.hide !== "function") {
      reject(new Error(`Missing hide method for driver ${driver.path}`));
      return;
    }

    this.pageDrivers.set(driver.path, driver);
    resolve();
  },

  /**
   * @private
   */
  initPageDrivers: function() {
    this.pageDrivers.forEach(function(driver, path) {
      if (driver.slideType === "THREE.Scene") {
        driver.scene = new THREE.Scene();
      }
      else {
        driver.slideContent = document.getElementById("slide:" + path);
      }
      driver.textContent = document.getElementById("page:" + path);

      try {
        driver.init();
      }
      catch (e) {
        e.message = `Driver init failed for ${path}:\n` + e.message;
        throw e;
      }
    }, this);
  },

  /**
   * Build our links.
   */
  buildNavigationLinks: function()
  {
    const outline = document.getElementById("outline");
    const items = outline.getElementsByTagName("li");

    const a = document.createElement("a");
    a.setAttribute("href", "");
    for (let i = 0; i < items.length; i++)
    {
      const elem = items[i];
      const text = elem.firstChild;
      elem.insertBefore(a.cloneNode(true), text);
      elem.firstChild.appendChild(text);
      elem.firstChild.addEventListener("click", this, true);
    }
  },

  /**
   * Initialize the NavigationController.
   */
  init: function() {
    this.initPageDrivers();
    this.buildNavigationLinks();
  },

  // DOMEventListener
  handleEvent: function(event)
  {
    event.preventDefault();
    try {
      const path = event.target.parentNode.dataset.path;
      if (!path)
        return;
      MasterController.selectedPage = document.getElementById("page:" + path);

      if (this.currentPageDriver && this.currentPageDriver.hide)
        this.currentPageDriver.hide();

      const driver = this.currentPageDriver = this.pageDrivers.get(path);
      if (driver.slideType == "THREE.Scene") {
        WebGLController.setSceneAndShow(driver.scene, true);
      }
      else {
        MasterController.selectedSlide = document.getElementById("slide:" + path);
      }
      if (driver.show)
        driver.show();
    }
    catch (e) {
      MasterController.showError(e);
    }
  },
};
})();
void(NavigationController);
