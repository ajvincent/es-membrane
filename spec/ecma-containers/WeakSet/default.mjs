import Membrane from "../../../source/core/Membrane.mjs";

it(
  "WeakSet instances by default in a membrane work like they do without a membrane",
  function() {
    let membrane, wetHandler, dryHandler, wetSet, drySet;
    {
      const MUSTCREATE = Object.freeze({ mustCreate: true });
      membrane = new Membrane();
      wetHandler  = membrane.getGraphByName("wet", MUSTCREATE);
      dryHandler  = membrane.getGraphByName("dry", MUSTCREATE);

      wetSet  = new WeakSet();
      drySet  = membrane.convertArgumentToProxy(wetHandler, dryHandler,  wetSet);
    }
  
    function checkSet(set, values, shouldHave = true) {
      values.forEach(function(value) {
        expect(set.has(value)).toBe(shouldHave);
      });
    }
  
    const dryValue1 = {}, dryValue2 = {};
    drySet.add(dryValue1);
    checkSet(drySet, [dryValue1], true);
    checkSet(drySet, [dryValue2], false);
  
    const wetValue1 = {};
    wetSet.add(wetValue1);
    checkSet(drySet, [dryValue1], true);
    checkSet(drySet, [dryValue2], false);
    checkSet(wetSet, [wetValue1], true);
  
    drySet.add(dryValue2);
    checkSet(drySet, [dryValue1, dryValue2], true);
    checkSet(wetSet, [wetValue1], true);  

    // deleting a key it doesn't have
    drySet.delete({});
    checkSet(drySet, [dryValue1, dryValue2], true);
    checkSet(wetSet, [wetValue1], true);  

    drySet.delete(dryValue1);
    checkSet(drySet, [dryValue1], false);
    checkSet(drySet, [dryValue2], true);
    checkSet(wetSet, [wetValue1], true);
  }
);
