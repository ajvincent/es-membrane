import Membrane from "../../../source/core/Membrane.mjs";

it(
  "Set instances by default in a membrane work like they do without a membrane",
  function() {
    let membrane, wetHandler, dryHandler, dampHandler, wetSet, drySet, dampSet;
    {
      const MUSTCREATE = Object.freeze({ mustCreate: true });
      membrane = new Membrane();
      wetHandler  = membrane.getGraphByName("wet", MUSTCREATE);
      dryHandler  = membrane.getGraphByName("dry", MUSTCREATE);
      dampHandler = membrane.getGraphByName("damp", MUSTCREATE);
  
      wetSet  = new Set();
      drySet  = membrane.convertArgumentToProxy(wetHandler, dryHandler,  wetSet);
      // we rarely create proxies this way in our tests, so this'll be useful
      dampSet = membrane.convertArgumentToProxy(dryHandler, dampHandler, drySet);
    }
  
    function expectSize(s) {
      expect(wetSet.size ).toBe(s);
      expect(drySet.size ).toBe(s);
      expect(dampSet.size).toBe(s);
    }

    function checkSet(set, values, shouldHave = true) {
      values.forEach(function(value) {
        expect(set.has(value)).toBe(shouldHave);

        let items = new Set(set.values());
        expect(items.has(value)).toBe(shouldHave);

        items = Array.from(set.entries());
        expect(items.some(function(item) {
          return (item[0] == value) && (item[1] == value);
        })).toBe(shouldHave);

        let foundValue = 0, foundKey = 0, foundAll = 0, thisArg = { isThis: true };
        set.forEach(function(v, k, s) {
          expect(this).toBe(thisArg);
          expect(s === set).toBe(true);

          if (v === value)
            foundValue++;
          if (k === value)
            foundKey++;
          if ((v === value) && (k === value))
            foundAll++;
        }, thisArg);
        expect(foundValue).toBe(shouldHave ? 1 : 0);
        expect(foundKey).toBe(shouldHave ? 1 : 0);
        expect(foundAll).toBe(shouldHave ? 1 : 0);
      });
    }
  
    const dryValue1 = {}, dryValue2 = {};
    drySet.add(dryValue1);
    expectSize(1);
    checkSet(drySet, [dryValue1], true);
    checkSet(drySet, [dryValue2], false);
  
    const wetValue1 = {};
    wetSet.add(wetValue1);
    expectSize(2);
    checkSet(drySet, [dryValue1], true);
    checkSet(drySet, [dryValue2], false);
    checkSet(wetSet, [wetValue1], true);
  
    drySet.add(dryValue2);
    expectSize(3);
    checkSet(drySet, [dryValue1, dryValue2], true);
    checkSet(wetSet, [wetValue1], true);  

    // deleting a key it doesn't have
    drySet.delete({});
    expectSize(3);
    checkSet(drySet, [dryValue1, dryValue2], true);
    checkSet(wetSet, [wetValue1], true);  

    drySet.delete(dryValue1);
    expectSize(2);
    checkSet(drySet, [dryValue1], false);
    checkSet(drySet, [dryValue2], true);
    checkSet(wetSet, [wetValue1], true);

    drySet.clear();
    expectSize(0);
    checkSet(drySet, [dryValue1, dryValue2], false);
    checkSet(wetSet, [wetValue1], false);
  }
);
