const NavigationController = (function() {
"use strict";
return {
  // DOMEventListener
  handleEvent: function(event)
  {
    event.preventDefault();
  },

  /**
   * Build our links.
   */
  init: function()
  {
    const outline = document.getElementById("outline");
    outline.addEventListener("click", this, true);
    const items = outline.getElementsByTagName("li");

    const a = document.createElement("a");
    a.setAttribute("href", "");
    for (let i = 0; i < items.length; i++)
    {
      const elem = items[i];
      const text = elem.firstChild;
      elem.insertBefore(a.cloneNode(true), text);
      elem.firstChild.appendChild(text);
    }
    return Promise.resolve();
  }
};
})();
void(NavigationController);
