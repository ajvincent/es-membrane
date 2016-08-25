/* A proxy handler designed to return only primitives and objects in a given
 * object graph, defined by the fieldName.
 */
function ObjectGraphHandler(membrane, fieldName) {
  if (typeof fieldName != "string")
    throw new Error("fieldName must be a string!");

  Object.defineProperties(this, {
    "membrane": new DataDescriptor(membrane, false, false, false),
    "fieldName": new DataDescriptor(fieldName, false, false, false),

    /* Temporary until membraneGraphName is defined on Object.prototype through
     * the object graph.
     */
    "graphNameDescriptor": new DataDescriptor(
      new DataDescriptor(fieldName), false, false, false
    ),

    "__revokeFunctions__": new DataDescriptor([], false, false, false),

    "__isDead__": new DataDescriptor(false, true, true, true),
  });
}
{ // ObjectGraphHandler definition
ObjectGraphHandler.prototype = {
  /* Strategy for each handler trap:
   * (1) Determine the target's origin field name.
   * (2) Wrap all non-primitive arguments for Reflect in the target field.
   * (3) var rv = Reflect[trapName].call(argList);
   * (4) Wrap rv in this.fieldName's field.
   * (5) return rv.
   *
   * Error stack trace hiding will be determined by the membrane itself.
   *
   * Hiding of properties should be done by another proxy altogether.
   * See replaceProxy method for details.
   */

  // ProxyHandler
  ownKeys: inGraphHandler("ownKeys", function(target) {
    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();
    var rv = this.externalHandler(function() {
      return Reflect.ownKeys(_this);
    });

    if (this.membrane.showGraphName && !rv.includes("membraneGraphName")) {
      rv.push("membraneGraphName");
    }
    return rv;
  }),

  // ProxyHandler
  has: inGraphHandler("has", function(target, propName) {
    /*
    http://www.ecma-international.org/ecma-262/7.0/#sec-ordinary-object-internal-methods-and-internal-slots-hasproperty-p

    1. Assert: IsPropertyKey(P) is true.
    2. Let hasOwn be ? O.[[GetOwnProperty]](P).
    3. If hasOwn is not undefined, return true.
    4. Let parent be ? O.[[GetPrototypeOf]]().
    5. If parent is not null, then
         a. Return ? parent.[[HasProperty]](P).
    6. Return false. 
    */

    {
      let type = typeof propName;
      if ((type != "string") && (type != "symbol"))
        throw new Error("propName is not a symbol or a string!");
    }

    var hasOwn;
    while (target !== null) {
      hasOwn = this.getOwnPropertyDescriptor(target, propName);
      if (typeof hasOwn !== "undefined")
        return true;
      target = this.getPrototypeOf(target);
    }
    return false;
  }),

  // ProxyHandler
  get: inGraphHandler("get", function(target, propName, receiver) {
    var found = false, rv;
    /*
    http://www.ecma-international.org/ecma-262/7.0/#sec-ordinary-object-internal-methods-and-internal-slots-get-p-receiver

    1. Assert: IsPropertyKey(P) is true.
    2. Let desc be ? O.[[GetOwnProperty]](P).
    3. If desc is undefined, then
         a. Let parent be ? O.[[GetPrototypeOf]]().
         b. If parent is null, return undefined.
         c. Return ? parent.[[Get]](P, Receiver).
    4. If IsDataDescriptor(desc) is true, return desc.[[Value]].
    5. Assert: IsAccessorDescriptor(desc) is true.
    6. Let getter be desc.[[Get]].
    7. If getter is undefined, return undefined.
    8. Return ? Call(getter, Receiver). 
     */

    {
      // 1. Assert: IsPropertyKey(P) is true.
      let type = typeof propName;
      if ((type != "string") && (type != "symbol"))
        throw new Error("propName is not a symbol or a string!");
    }

    var desc;
    /*
    2. Let desc be ? O.[[GetOwnProperty]](P).
    3. If desc is undefined, then
         a. Let parent be ? O.[[GetPrototypeOf]]().
         b. If parent is null, return undefined.
         c. Return ? parent.[[Get]](P, Receiver).
     */
    desc = this.getOwnPropertyDescriptor(target, propName);
    {
      if (!desc) {
        let parent = this.getPrototypeOf(target);
        if (parent === null)
          return undefined;

        let other;
        [found, other] = this.membrane.getMembraneProxy(this.fieldName, parent);
        assert(found, "Must find membrane proxy for prototype");
        assert(other === parent, "Retrieved prototypes must match");
        return this.get(parent, propName, receiver);
      }
    }

    // 4. If IsDataDescriptor(desc) is true, return desc.[[Value]].
    if (!found && isDataDescriptor(desc)) {
      rv = desc.value;
      found = true;
      if (!desc.configurable && !desc.writable)
        return rv;
    }

    if (!found) {
      // 5. Assert: IsAccessorDescriptor(desc) is true.

      if (!isAccessorDescriptor(desc))
        throw new Error("desc must be a data descriptor or an accessor descriptor!");

      // 6. Let getter be desc.[[Get]].
      var getter = desc.get;

      /*
      7. If getter is undefined, return undefined.
      8. Return ? Call(getter, Receiver). 
       */
      {
        let type = typeof getter;
        if (type === "undefined")
          return undefined;
        if (type !== "function")
          throw new Error("getter is not a function");
        rv = this.externalHandler(function() {
          return Reflect.apply(getter, receiver, []);
        });
        found = true;
      }
    }

    if (!found) {
      // end of the algorithm
      throw new Error("Membrane fall-through: we should not get here");
    }

    {
      let targetMap = this.membrane.map.get(target);
      return this.membrane.convertArgumentToProxy(
        this.membrane.getHandlerByField(targetMap.originField),
        this,
        rv
      );
    }
  }),

  // ProxyHandler
  getOwnPropertyDescriptor:
  inGraphHandler("getOwnPropertyDescriptor", function(target, propName) {
    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }

    if (this.membrane.showGraphName && (propName == "membraneGraphName")) {
      return this.graphNameDescriptor;
    }

    try {
      var targetMap = this.membrane.map.get(target);
      var _this = targetMap.getOriginal();

      var desc = this.externalHandler(function() {
        return Reflect.getOwnPropertyDescriptor(_this, propName);
      });
      if (desc !== undefined) {
        desc = this.membrane.wrapDescriptor(
          targetMap.originField,
          this.fieldName,
          desc
        );
      }
      return desc;
    }
    catch (e) {
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }),

  // ProxyHandler
  getPrototypeOf: inGraphHandler("getPrototypeOf", function(target) {
    try {
      var targetMap = this.membrane.map.get(target);
      if (targetMap.protoMapping === NOT_YET_DETERMINED) {
        let proto = this.externalHandler(function() {
          return Reflect.getPrototypeOf(target);
        });
        let pType = valueType(proto);
        if (pType == "primitive") {
          assert(proto === null,
                 "Reflect.getPrototypeOf(target) should return Object or null");
          targetMap.protoMapping = null;
        }
        else {
          let pMapping = this.membrane.map.get(proto);
          if (!pMapping) {
            this.membrane.wrapArgumentByProxyMapping(targetMap, proto);
            pMapping = this.membrane.map.get(proto);
            assert(pMapping instanceof ProxyMapping,
                   "We didn't get a proxy mapping for proto?");
          }
          targetMap.protoMapping = pMapping;
        }
      }

      {
        let pMapping = targetMap.protoMapping;
        if (pMapping === null)
          return null;
        assert(pMapping instanceof ProxyMapping,
               "We must have a property mapping by now!");
        if (!pMapping.hasField(this.fieldName)) {
          let proto = pMapping.getOriginal();
          this.membrane.wrapArgumentByHandler(this, proto);
          assert(pMapping.hasField(this.fieldName),
                 "wrapArgumentByHandler should've established a field name!");
        }

        let proxy = pMapping.getProxy(this.fieldName);
        return proxy;
      }
    }
    catch (e) {
      if (this.membrane.__mayLog__()) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }),

  // ProxyHandler
  isExtensible: inGraphHandler("isExtensible", function(target) {
    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();
    return this.externalHandler(function() {
      return Reflect.isExtensible(_this);
    });
  }),

  // ProxyHandler
  preventExtensions: inGraphHandler("preventExtensions", function(target) {
    if (!this.isExtensible(target))
      return true;
    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();
    return this.externalHandler(function() {
      return Reflect.preventExtensions(_this);
    });
  }),

  // ProxyHandler
  deleteProperty: inGraphHandler("deleteProperty", function(target, propName) {
    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }
    try {
      var targetMap = this.membrane.map.get(target);
      var _this = targetMap.getOriginal();
      return this.externalHandler(function() {
        return Reflect.deleteProperty(_this, propName);
      });
    }
    catch (e) {
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }),

  // ProxyHandler
  defineProperty:
  inGraphHandler("defineProperty", function(target, propName, desc) {
    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }

    try {
      var targetMap = this.membrane.map.get(target);
      var _this = targetMap.getOriginal();
      if (desc !== undefined) {
        desc = this.membrane.wrapDescriptor(
          this.fieldName,
          targetMap.originField,
          desc
        );
      }
      return this.externalHandler(function() {
        return Reflect.defineProperty(_this, propName, desc);
      });
    }
    catch (e) {
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }),

  // ProxyHandler
  set: inGraphHandler("set", function(target, propName, value, receiver) {
    /*
    http://www.ecma-international.org/ecma-262/7.0/#sec-ordinary-object-internal-methods-and-internal-slots-set-p-v-receiver

    1. Assert: IsPropertyKey(P) is true.
    2. Let ownDesc be ? O.[[GetOwnProperty]](P).
    3. If ownDesc is undefined, then
        a. Let parent be ? O.[[GetPrototypeOf]]().
        b. If parent is not null, then
            i.   Return ? parent.[[Set]](P, V, Receiver).
        c. Else,
            i.   Let ownDesc be the PropertyDescriptor{
                   [[Value]]: undefined,
                   [[Writable]]: true,
                   [[Enumerable]]: true,
                   [[Configurable]]: true
                 }.
    4. If IsDataDescriptor(ownDesc) is true, then
        a. If ownDesc.[[Writable]] is false, return false.
        b. If Type(Receiver) is not Object, return false.
        c. Let existingDescriptor be ? Receiver.[[GetOwnProperty]](P).
        d. If existingDescriptor is not undefined, then
            i.   If IsAccessorDescriptor(existingDescriptor) is true, return false.
            ii.  If existingDescriptor.[[Writable]] is false, return false.
            iii. Let valueDesc be the PropertyDescriptor{[[Value]]: V}.
            iv.  Return ? Receiver.[[DefineOwnProperty]](P, valueDesc).
        e. Else Receiver does not currently have a property P,
            i.   Return ? CreateDataProperty(Receiver, P, V).
    5. Assert: IsAccessorDescriptor(ownDesc) is true.
    6. Let setter be ownDesc.[[Set]].
    7. If setter is undefined, return false.
    8. Perform ? Call(setter, Receiver, « V »).
    9. Return true. 
    */

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("set propName: " + propName);
    }
    {
      // 1. Assert: IsPropertyKey(P) is true.
      let type = typeof propName;
      if ((type != "string") && (type != "symbol"))
        throw new Error("propName is not a symbol or a string!");
    }

    /*
    2. Let ownDesc be ? O.[[GetOwnProperty]](P).
    3. If ownDesc is undefined, then
        a. Let parent be ? O.[[GetPrototypeOf]]().
        b. If parent is not null, then
            i.   Return ? parent.[[Set]](P, V, Receiver).
        c. Else,
            i.   Let ownDesc be the PropertyDescriptor{
                   [[Value]]: undefined,
                   [[Writable]]: true,
                   [[Enumerable]]: true,
                   [[Configurable]]: true
                 }.
    */
    let ownDesc;
    {
      ownDesc = this.getOwnPropertyDescriptor(target, propName);
      if (!ownDesc) {
        let parent = this.getPrototypeOf(target);
        if (parent) {
          // This should call this.set(parent, propName, value, receiver);
          /* XXX ajvincent I tried calling this.set() directly, and a test
           * failed.  We need to find out why.
           */
          let [found, other] = this.membrane.getMembraneProxy(this.fieldName, parent);
          assert(found, "Must find membrane proxy for prototype");
          assert(other === parent, "Retrieved prototypes must match");
          return this.externalHandler(function() {
            return Reflect.set(parent, propName, value, receiver);
          });
        }
        else
          ownDesc = new DataDescriptor(undefined, true);
      }
    }

    // Special step:  convert receiver to unwrapped value.
    let receiverMap = this.membrane.map.get(receiver);
    if (!receiverMap) {
      // We may be under construction.
      let proto = Object.getPrototypeOf(receiver);
      let protoMap = this.membrane.map.get(proto);
      let pHandler = this.membrane.getHandlerByField(protoMap.originField);

      if (this.membrane.map.has(receiver)) {
        /* XXX ajvincent If you're stepping through in a debugger, the debugger
         * may have set this.membrane.map.get(receiver) between actions.
         * This is a true Heisenbug, where observing the behavior changes the
         * behavior.
         *
         * Therefore YOU MUST STEP OVER THE FOLLOWING LINE!  DO NOT STEP IN!
         * DO NOT FOOL AROUND WITH THE DEBUGGER, JUST STEP OVER!!!
         */
        this.membrane.convertArgumentToProxy(pHandler, this, receiver, {override: true});
      }
      else {
        this.membrane.convertArgumentToProxy(pHandler, this, receiver);
      }
      
      receiverMap = this.membrane.map.get(receiver);
      if (!receiverMap)
        throw new Error("How do we still not have a receiverMap?");
      if (receiverMap.originField === this.fieldName)
        throw new Error("Receiver's field name should not match!");
    }
    receiver = receiverMap.getOriginal();
    
    /*
    4. If IsDataDescriptor(ownDesc) is true, then
        a. If ownDesc.[[Writable]] is false, return false.
        b. If Type(Receiver) is not Object, return false.
        c. Let existingDescriptor be ? Receiver.[[GetOwnProperty]](P).
        d. If existingDescriptor is not undefined, then
            i.   If IsAccessorDescriptor(existingDescriptor) is true, return false.
            ii.  If existingDescriptor.[[Writable]] is false, return false.
            iii. Let valueDesc be the PropertyDescriptor{[[Value]]: V}.
            iv.  Return ? Receiver.[[DefineOwnProperty]](P, valueDesc).
        e. Else Receiver does not currently have a property P,
            i.   Return ? CreateDataProperty(Receiver, P, V).
    */
    if (isDataDescriptor(ownDesc)) {
      if (!ownDesc.writable || (valueType(receiver) == "primitive"))
        return false;
      
      let existingDesc = this.externalHandler(function() {
        return Reflect.getOwnPropertyDescriptor(receiver, propName);
      });
      if (existingDesc !== undefined) {
        if (isAccessorDescriptor(existingDesc) || !existingDesc.writable)
          return false;
      }

      let rvProxy;
      if (receiverMap.originField !== this.fieldName) {
        rvProxy = new DataDescriptor(
          // Only now do we convert the value to the target object graph.
          this.membrane.convertArgumentToProxy(
            this,
            this.membrane.getHandlerByField(receiverMap.originField),
            value
          ),
          true
        );
      }
      else {
        rvProxy = new DataDescriptor(value, true);
      }

      return this.externalHandler(function() {
        return Reflect.defineProperty(receiver, propName, rvProxy);
      });
    }

    // 5. Assert: IsAccessorDescriptor(ownDesc) is true.
    if (!isAccessorDescriptor(ownDesc))
      throw new Error("ownDesc must be a data descriptor or an accessor descriptor!");

    /*
    6. Let setter be ownDesc.[[Set]].
    7. If setter is undefined, return false.
    */
    let setter = ownDesc.set;
    if (typeof setter === "undefined")
      return false;
    // 8. Perform ? Call(setter, Receiver, « V »).
    {
      // Only now do we convert the value to the target object graph.
      let rvProxy = this.membrane.convertArgumentToProxy(
        this,
        this.membrane.getHandlerByField(receiverMap.originField),
        value
      );
      this.externalHandler(function() {
        Reflect.apply(setter, receiver, [ rvProxy ]);
      });
    }

    // 9. Return true.
    return true;
  }),

  // ProxyHandler
  setPrototypeOf: inGraphHandler("setPrototypeOf", function(target, proto) {
    try {
      var targetMap = this.membrane.map.get(target);
      var _this = targetMap.getOriginal();


      let protoProxy;
      if (targetMap.originField !== this.fieldName) {
        protoProxy = this.membrane.convertArgumentToProxy(
          this,
          this.membrane.getHandlerByField(targetMap.originField),
          proto
        );
      }
      else {
        protoProxy = proto;
      }

      var rv = this.externalHandler(function() {
        return Reflect.setPrototypeOf(_this, protoProxy);
      });

      // We want to break any links that this.getPrototypeOf might have cached.
      targetMap.protoMapping = NOT_YET_DETERMINED;

      return rv;
    }
    catch (e) {
      const mayLog = this.membrane.__mayLog__();
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }),

  // ProxyHandler
  apply: inGraphHandler("apply", function(target, thisArg, argumentsList) {
    var _this, args = [];
    let targetMap  = this.membrane.map.get(target);
    let argHandler = this.membrane.getHandlerByField(targetMap.originField);

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug([
        "apply originFields: inbound = ",
        argHandler.fieldName,
        ", outbound = ",
        this.fieldName
      ].join(""));
    }

    _this = this.membrane.convertArgumentToProxy(
      this,
      argHandler,
      thisArg
    );

    if (mayLog) {
      this.membrane.logger.debug("apply this.membraneGraphName: " + _this.membraneGraphName);
    }
    for (var i = 0; i < argumentsList.length; i++) {
      let nextArg = argumentsList[i];
      nextArg = this.membrane.convertArgumentToProxy(
        this,
        argHandler,
        nextArg
      );
      args.push(nextArg);

      if (mayLog && (valueType(nextArg) != "primitive")) {
        this.membrane.logger.debug("apply argument " + i + "'s membraneGraphName: " + nextArg.membraneGraphName);
      }
    }

    if (mayLog) {
      this.membrane.logger.debug("apply about to call function");
    }
    var rv = this.externalHandler(function() {
      return Reflect.apply(target, _this, args);
    });
    if (mayLog) {
      this.membrane.logger.debug("apply wrapping return value");
    }

    rv = this.membrane.convertArgumentToProxy(
      argHandler,
      this,
      rv
    );

    if (mayLog) {
      this.membrane.logger.debug("apply exiting");
    }
    return rv;
  }),

  // ProxyHandler
  construct:
  inGraphHandler("construct", function(target, argumentsList, newTarget) {
    var args = [];
    let targetMap  = this.membrane.map.get(target);
    let argHandler = this.membrane.getHandlerByField(targetMap.originField);

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug([
        "construct originFields: inbound = ",
        argHandler.fieldName,
        ", outbound = ",
        this.fieldName
      ].join(""));
    }

    for (var i = 0; i < argumentsList.length; i++) {
      let nextArg = argumentsList[i];
      nextArg = this.membrane.convertArgumentToProxy(
        this,
        argHandler,
        nextArg
      );
      args.push(nextArg);

      if (mayLog && (valueType(nextArg) != "primitive")) {
        this.membrane.logger.debug("construct argument " + i + "'s membraneGraphName: " + nextArg.membraneGraphName);
      }
    }

    var rv = this.externalHandler(function() {
      return Reflect.construct(target, args, newTarget);
    });

    rv = this.membrane.convertArgumentToProxy(
      argHandler,
      this,
      rv
    );

    let proto = this.get(target, "prototype");
    this.setPrototypeOf(rv, proto);

    if (mayLog) {
      this.membrane.logger.debug("construct exiting");
    }
    return rv;
  }),

  /**
   * Handle a call to code the membrane doesn't control.
   *
   * @private
   */
  externalHandler: function(callback) {
    return inGraphHandler("external", callback).apply(this);
  },

  /**
   * Add a ProxyMapping or a Proxy.revoke function to our list.
   *
   * @private
   */
  addRevocable: function(revoke) {
    if (this.__isDead__)
      throw new Error("This membrane handler is dead!");
    this.__revokeFunctions__.push(revoke);
  },

  /**
   * Revoke the entire object graph.
   *
   * @private
   */
  revokeEverything: function() {
    if (this.__isDead__)
      throw new Error("This membrane handler is dead!");
    Object.defineProperty(this, "__isDead__", {
      value: true,
      writable: false,
      enumerable: true,
      configurable: false
    });
    let length = this.__revokeFunctions__.length;
    for (var i = 0; i < length; i++) {
      let revocable = this.__revokeFunctions__[i];
      if (revocable instanceof ProxyMapping)
        revocable.revoke();
      else // typeof revocable == "function"
        revocable();
    }
  },

  replaceProxy: function(oldProxy, handler) {
    if (this.__isDead__)
      throw new Error("This membrane handler is dead!");

    /* These assertions are to make sure the proxy we're replacing is safe to
     * use in the membrane.
     *
     * First, ensure the proxy actually belongs to the object graph this
     * handler represents.
     */
    let map = this.membrane.map.get(oldProxy);
    let thisMsg = "this ObjectGraphHandler (" + this.fieldName + ")";
    if (!map || map.getProxy(this.fieldName) != oldProxy) {
      throw new Error("You cannot replace a proxy that doesn't belong to " + thisMsg + "!");
    }

    /* Second, to try and ensure the handler respects the rules of the
     * membrane and the object graph, ensure it has an appropriate
     * ProxyHandler on its prototype chain.  If the old proxy is actually the
     * original value, the handler must have Reflect on its prototype chain.
     * Otherwise, the handler must have this on its prototype chain.
     *
     * Note that the handler can be Reflect or this, respectively:  that's
     * perfectly legal, as a way of restoring original behavior for the given
     * object graph.
     */
    let isOrigin = (this.fieldName === map.originField);
    let baseProto = isOrigin ? Reflect : this;
    let desiredProto = handler;
    while (desiredProto !== baseProto) {
      desiredProto = Object.getPrototypeOf(desiredProto);
      if (!desiredProto)
        throw new Error("ProxyHandler must inherit from " + (isOrigin ? "Reflect" : thisMsg) + "!");
    }

    // Finally, do the actual proxy replacement.
    let original = map.getOriginal();
    let parts = Proxy.revocable(original, handler);
    parts.value = original;
    parts.override = true;
    map.set(this.membrane, this.fieldName, parts);
    this.addRevocable(map.originField === this.fieldName ? mapping : parts.revoke);
    return parts.proxy;
  },
};

} // end ObjectGraphHandler definition
