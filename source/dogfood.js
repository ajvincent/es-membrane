/*
We will wrap the Membrane constructor in a Membrane, to protect the internal API
from public usage.  This is known as "eating your own dogfood" in software
engineering parlance.  Not only is it an additional proof-of-concept that the
Membrane works, but it will help ensure external consumers of the membrane
module cannot rewrite how each individual Membrane works.
*/
var Membrane;
if (false) {
  var DogfoodMembrane = new MembraneInternal({
    /* configuration options here */
  });

  /* This provides a weak reference to each proxy coming out of a Membrane.
   *
   * Why have this tracking mechanism?  The "dogfood" membrane must ensure any
   * value it returns to an external customer is not wrapped in both the
   * "dogfood" membrane and another membrane.  This double-wrapping is harmful
   * for performance and causes unintended bugs.
   *
   * To do that, on any returned value, the "dogfood" membrane will follow this
   * algorithm:
   * (1) Let value be the value the "dogfood" membrane's "public" object graph
   *     handler would normally return.
   * (2) Let dogfood be the "dogfood" membrane.
   * (3) Let map be dogfood.map.get(value).  This will be a ProxyMapping
   *     instance belonging to the "dogfood" membrane.
   * (4) Let original be map.getOriginal().
   * (5) Let x be ProxyToMembraneMap.has(original).  This will either be true if
   *     original refers to a MembraneInternal instance, or false if there is no
   *     such reference.
   * (6) If x is false, return value.
   * (7) Otherwise, value has been incorrectly wrapped.  Return original.
   *
   * The reference is weak because we do not want to risk leaking memory with
   * strong references to the ProxyMapping instance.  The ProxyMapping instance
   * is referenced only by proxies exported from any Membrane, via another
   * WeakMap the ProxyMapping belongs to.
   */
  DogfoodMembrane.ProxyToMembraneMap = new WeakSet();

  let publicAPI   = DogfoodMembrane.getHandlerByName("public", true);
  let internalAPI = DogfoodMembrane.getHandlerByName("internal", true);

  // lockdown of the public API here

  // Define our Membrane constructor properly.
  Membrane = DogfoodMembrane.convertArgumentToProxy(
    internalAPI, publicAPI, MembraneInternal
  );
  /* XXX ajvincent Membrane.prototype should return an object with descriptor
   * "secured": new DataDescriptor(true, false, false, false)
   */

  if (false) {
    /* XXX ajvincent Right now it's unclear if this operation is safe.  It
     * probably isn't, but as long as DogfoodMembrane isn't exposed outside this
     * module, we're okay.
     */
    let finalWrap = DogfoodMembrane.convertArgumentToProxy(
      internalAPI, publicAPI, DogfoodMembrane
    );

    // Additional securing and API overrides of DogfoodMembrane here.

    DogfoodMembrane = finalWrap;
  }
}
else {
  Membrane = MembraneInternal;
}
MembraneInternal = null;
