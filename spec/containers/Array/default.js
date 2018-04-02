xdescribe("Arrays by default in a membrane", function() {
  let originalArray;
  function buildElement(name) {
    let rv = {name};
    Object.freeze(rv);
    return rv;
  }
  const wetAlpha = buildElement("alpha"),
        wetBeta  = buildElement("beta"),
        wetGamma = buildElement("gamma"),
        wetPi    = buildElement("pi"),
        wetChi   = buildElement("chi");
  beforeEach(function() {
    originalArray = [wetAlpha, wetBeta, wetGamma, wetPi, wetChi];
  });

  /* Array.prototype has a lot of methods.  We can group them into types:
   * Modifiers:
   *   pop()
   *   push()
   *   shift()
   *   unshift()
   *   splice()
   *   sort()
   *   reverse()

   * Copies:
   *   slice()
   *   concat()
   *   join()

   * Searches:
   *   includes()
   *   indexOf()
   *   lastIndexOf()
   *   entries()
   *   find()
   *   findIndex()

   * Iteration over elements
   *   every()
   *   some()
   *   filter()
   *   forEach()
   *   keys()
   *   values()
   *   map()
   *   reduce()
   *   reduceRight()

   * Object.prototype overrides
   *   toLocaleString()
   *   toSource()
   *   toString()

   *   copyWithin()
   *   fill()
   *   [@@iterator]()
   * 
   */
});
