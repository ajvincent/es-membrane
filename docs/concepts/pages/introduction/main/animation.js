NavigationController.addPageDriver({
  // The path specified in ../../../index.html for this page
  path: "introduction/main",

  // What kind of slide are we dealing with?
  slideType: "FabricJS",

  /**
   * Initializing the scene and/or the content.
   */
  init: function() {
    this.group = new fabric.Group();

    let resolve;
    let p = new Promise((res) => resolve = res);

    fabric.Image.fromURL(
      'https://ajvincent.github.io/es-membrane/concepts/abstract-art-artistic-459301-16:9.jpg',
      (image) => {
        this.backgroundImage = image;
        image.scale(1600 / image.width);
        resolve();
      }
    );

    p = p.then(() => {
      this.group.addWithUpdate(this.backgroundImage);

      this.group.addWithUpdate(new fabric.Textbox('Building Membranes in JavaScript', {
        fill: "white",
        fontFamily: "Verdana",
        top: 40,
        fontSize: 64,
        width: 1600,
        textAlign: 'center',
      }));

      this.group.addWithUpdate(new fabric.Textbox(
        'https://github.com/ajvincent/es-membrane/\n' +
        'https://ajvincent.github.io/es-membrane/',
        {
          fill: "yellow",
          fontFamily: "Verdana",
          top: 900 - 100,
          fontSize: 32,
          left: 40,
          fontStyle: "italic",
          textAlign: 'left',
        }
      ));

      this.group.addWithUpdate(new fabric.Textbox(
        'Alexander J. Vincent\n' +
        'ajvincent@gmail.com',
        {
          fill: "yellow",
          fontFamily: "Verdana",
          top: 900 - 100,
          fontSize: 32,
          left: 1600 - 440,
          width: 400,
          fontStyle: "italic",
          textAlign: 'right',
        }
      ));
    });

    return p;
  },

  // fabric.Group for the FabricController.
  group: null,

  // HTMLSectionElement from NavigationController for the HTML-based text.
  textContent: null,
});
