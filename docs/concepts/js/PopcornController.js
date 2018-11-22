const PopcornController = (function() {
"use strict";
return {
  // popcorn.js primary objects
  wrapper: null,
  popcorn: null,

  /**
   * Set up the Popcorn timings.
   */
  init: function()
  {
    this.wrapper = Popcorn.HTMLNullVideoElement( "#playerControls" );
    // This is 60 in seconds, if you want fractions of a second, use 60.5
    this.wrapper.src = "#t=,60";
    this.popcorn = new Popcorn(this.wrapper);

    /*
    this.popcorn.play();

    // Add popcorn events here and other functionality
    this.popcorn.footnote({
      start: 1,
      end: 5,
      text: "Works with the wrapper!",
      target: "footnote-div"
    });
    */

    return Promise.resolve();
  }
};
})();
void(PopcornController);
