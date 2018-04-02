it("Array.prototype.splice generates reasonable results with a proxy", function() {
  const x = ["alpha", "beta", "gamma", "pi", "chi"];

  const handler = {};
  let events = [];
  Reflect.ownKeys(Reflect).forEach(function(trap) {
    handler[trap] = function() {
      let msg = trap + " called";
      if (typeof arguments[1] == "string")
        msg += ` for property "${arguments[1]}"`;
      if (trap === "set")
        msg += ` and value "${arguments[2]}"`;
      events.push("enter: " + msg);
      const rv = Reflect[trap].apply(Reflect, arguments);
      events.push("exit:  " + msg + ` and return value ${JSON.stringify(rv)}`);
      return rv;
    };
  });

  const X = new Proxy(x, handler);
  X.splice(1, 3, "delta", "epsilon");
  expect(x.length).toBe(4);

  /* XXX ajvincent Google Chrome has calls to isExtensible, while Mozilla Firefox
   * does not.  I don't know which one is correct.
   */
  events = events.filter((str) => !/isExtensible/.test(str));

  expect(events).toEqual([
    `enter: get called for property "splice"`,
    `exit:  get called for property "splice" and return value undefined`,
    `enter: get called for property "length"`,
    `exit:  get called for property "length" and return value 5`,
    `enter: get called for property "constructor"`,
    `exit:  get called for property "constructor" and return value undefined`,
    `enter: has called for property "1"`,
    `exit:  has called for property "1" and return value true`,
    `enter: get called for property "1"`,
    `exit:  get called for property "1" and return value "beta"`,
    `enter: has called for property "2"`,
    `exit:  has called for property "2" and return value true`,
    `enter: get called for property "2"`,
    `exit:  get called for property "2" and return value "gamma"`,
    `enter: has called for property "3"`,
    `exit:  has called for property "3" and return value true`,
    `enter: get called for property "3"`,
    `exit:  get called for property "3" and return value "pi"`,
    `enter: has called for property "4"`,
    `exit:  has called for property "4" and return value true`,
    `enter: get called for property "4"`,
    `exit:  get called for property "4" and return value "chi"`,
    `enter: set called for property "3" and value "chi"`,
    `enter: getOwnPropertyDescriptor called for property "3"`,
    `exit:  getOwnPropertyDescriptor called for property "3" and return value {"value":"pi","writable":true,"enumerable":true,"configurable":true}`,
    `enter: defineProperty called for property "3"`,
    `exit:  defineProperty called for property "3" and return value true`,
    `exit:  set called for property "3" and value "chi" and return value true`,
    `enter: deleteProperty called for property "4"`,
    `exit:  deleteProperty called for property "4" and return value true`,
    `enter: set called for property "1" and value "delta"`,
    `enter: getOwnPropertyDescriptor called for property "1"`,
    `exit:  getOwnPropertyDescriptor called for property "1" and return value {"value":"beta","writable":true,"enumerable":true,"configurable":true}`,
    `enter: defineProperty called for property "1"`,
    `exit:  defineProperty called for property "1" and return value true`,
    `exit:  set called for property "1" and value "delta" and return value true`,
    `enter: set called for property "2" and value "epsilon"`,
    `enter: getOwnPropertyDescriptor called for property "2"`,
    `exit:  getOwnPropertyDescriptor called for property "2" and return value {"value":"gamma","writable":true,"enumerable":true,"configurable":true}`,
    `enter: defineProperty called for property "2"`,
    `exit:  defineProperty called for property "2" and return value true`,
    `exit:  set called for property "2" and value "epsilon" and return value true`,
    `enter: set called for property "length" and value "4"`,
    `enter: getOwnPropertyDescriptor called for property "length"`,
    `exit:  getOwnPropertyDescriptor called for property "length" and return value {"value":5,"writable":true,"enumerable":false,"configurable":false}`,
    `enter: defineProperty called for property "length"`,
    `exit:  defineProperty called for property "length" and return value true`,
    `exit:  set called for property "length" and value "4" and return value true`
  ]);
});

/*
[
  `alpha`,
  `delta`,
  `epsilon`,
  `chi`
]
*/

it(
  "Setting a prototype on a proxy to an array doesn't affect directly modifying the array",
  function() {
    "use strict";
    var x = ["alpha", "beta", "gamma"];
  
    const handler = {};
    const events = [];
    Reflect.ownKeys(Reflect).forEach(function(trap) {
      handler[trap] = function() {
        var rv;
        events.push(`enter ${trap}`);
        try {
          rv = Reflect[trap].apply(x, arguments);
        }
        catch (e) {
          events.push(`error ${trap} ${e}`);
          throw e;
        }
        finally {
          events.push(`leave ${trap}`);
        }
        return rv;
      };
    });
  
    const proto = Proxy.revocable([], handler);
    Reflect.ownKeys(Array.prototype).forEach(function(key) {
      Reflect.defineProperty(
        proto,
        key,
        Reflect.getOwnPropertyDescriptor(Array.prototype, key)
      );
    });
    Reflect.setPrototypeOf(x, proto);

    expect(Reflect.getOwnPropertyDescriptor(x, "splice")).toBe(undefined);
    let spliceValue;
    {
      const desc = Reflect.getOwnPropertyDescriptor(proto, "splice");
      expect(desc).not.toBe(undefined);
      if (desc)
        spliceValue = desc.value;
      else
        spliceValue = undefined;
    }
    expect(Reflect.get(x, "splice")).toBe(spliceValue);
  
    events.push("start");
    x[1] = "delta";
    events.push("middle");
    x.splice(1, 1, "epsilon");
    events.push("end");
    expect(events).toEqual(["start", "middle", "end"]);
    expect(x).toEqual(["alpha", "epsilon", "gamma"]);
  }
);
