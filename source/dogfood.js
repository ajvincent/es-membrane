/*
We will wrap the Membrane constructor in a Membrane, to protect the internal API
from public usage.  This is known as "eating your own dogfood" in software
engineering parlance.  Not only is it an additional proof-of-concept that the
Membrane works, but it will help ensure external consumers of the membrane
module cannot rewrite how each individual Membrane works.
*/
var Membrane;
var DogfoodMembrane;
if (false) {
  DogfoodMembrane = new MembraneInternal({
    /* configuration options here */
  });
  let publicAPI   = DogfoodMembrane.getHandlerByField("public");
  let internalAPI = DogfoodMembrane.getHandlerByField("internal");

  // lockdown of the public API here

  // Define our Membrane constructor properly.
  Membrane = DogfoodMembrane.convertArgumentToProxy(
    internalAPI, publicAPI, MembraneInternal
  );

  // Protect the dogfood membrane as well.
  DogfoodMembrane = DogfoodMembrane.convertArgumentToProxy(
    internalAPI, publicAPI, DogfoodMembrane
  );
}
else {
  Membrane = MembraneInternal;
}
