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
ObjectGraphHandler.prototype = Object.seal({
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
   * See modifyRules.replaceProxy method for details.
   */

  // ProxyHandler
  ownKeys: inGraphHandler("ownKeys", function(shadowTarget) {
    var target = getRealTarget(shadowTarget);
    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();
    var rv = this.externalHandler(function() {
      return Reflect.ownKeys(_this);
    });

    /* The key list is guaranteed through rv.length to be unique.  Make it so
     * for the newly added items.
     */
    rv = rv.concat(
      targetMap.localOwnKeys(targetMap.originField),
      targetMap.localOwnKeys(this.fieldName)
    );

    {
      let mustSkip = new Set();
      targetMap.appendDeletedNames(targetMap.originField, mustSkip);
      targetMap.appendDeletedNames(this.fieldName, mustSkip);
      /*
      let originFilter = targetMap.getOwnKeysFilter(targetMap.originField);
      let localFilter  = targetMap.getOwnKeysFilter(this.fieldName);
      */
      rv = rv.filter(function(elem) {
        if (mustSkip.has(elem))
          return false;
        mustSkip.add(elem);

        var accepted = true;
        /*
        if (originFilter)
          accepted = originFilter.apply(this, arguments);
        if (accepted && localFilter)
          accepted = localFilter.apply(this, arguments);
        */
        return accepted;
      });
    }

    if (this.membrane.showGraphName && !rv.includes("membraneGraphName")) {
      rv.push("membraneGraphName");
    }

    this.fixOwnProperties(shadowTarget, rv);
    return rv;
  }),

  // ProxyHandler
  has: inGraphHandler("has", function(shadowTarget, propName) {
    var target = getRealTarget(shadowTarget);
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

    // 1. Assert: IsPropertyKey(P) is true.
    AssertIsPropertyKey(propName);

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
  get: inGraphHandler("get", function(shadowTarget, propName, receiver) {
    var target = getRealTarget(shadowTarget);
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

    // 1. Assert: IsPropertyKey(P) is true.
    AssertIsPropertyKey(propName);

    var desc;
    {
      /* Special case:  Look for a local property descriptors first, and if we
       * find it, return it unwrapped.
       */
      let targetMap = this.membrane.map.get(target);
      desc = targetMap.getLocalDescriptor(this.fieldName, propName);

      if (desc) {
        // Quickly repeating steps 4-8 from above algorithm.
        if (isDataDescriptor(desc))
          return desc.value;
        if (!isAccessorDescriptor(desc))
          throw new Error("desc must be a data descriptor or an accessor descriptor!");
        let type = typeof desc.get;
        if (type === "undefined")
          return undefined;
        if (type !== "function")
          throw new Error("getter is not a function");
        return Reflect.apply(desc.get, receiver, []);
      }
    }

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
  inGraphHandler("getOwnPropertyDescriptor", function(shadowTarget, propName) {
    var target = getRealTarget(shadowTarget);
    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }

    if (this.membrane.showGraphName && (propName == "membraneGraphName")) {
      return this.graphNameDescriptor;
    }

    try {
      var targetMap = this.membrane.map.get(target);
      if (targetMap.wasDeletedLocally(targetMap.originField, propName) ||
          targetMap.wasDeletedLocally(this.fieldName, propName))
        return undefined;

      var desc = targetMap.getLocalDescriptor(this.fieldName, propName);
      if (desc !== undefined)
        return desc;

      var _this = targetMap.getOriginal();
      desc = this.externalHandler(function() {
        return Reflect.getOwnPropertyDescriptor(_this, propName);
      });
      if ((desc !== undefined) && (targetMap.originField !== this.fieldName)) {
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
  getPrototypeOf: inGraphHandler("getPrototypeOf", function(shadowTarget) {
    var target = getRealTarget(shadowTarget);
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
  isExtensible: inGraphHandler("isExtensible", function(shadowTarget) {
    if (!Reflect.isExtensible(shadowTarget))
      return false;
    var target = getRealTarget(shadowTarget);
    var shouldBeLocal = this.allowLocalProperties(target, true);
    if (shouldBeLocal)
      return true;
    
    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();
    var rv = this.externalHandler(function() {
      return Reflect.isExtensible(_this);
    });
    if (!rv)
      Reflect.preventExtensions(shadowTarget);
    return rv;
  }),

  // ProxyHandler
  preventExtensions: inGraphHandler("preventExtensions", function(shadowTarget) {
    var target = getRealTarget(shadowTarget);
    // Walk the prototype chain to look for shouldBeLocal.
    var shouldBeLocal = this.allowLocalProperties(target, true);
    if (shouldBeLocal) {
      // Call this.fixOwnProperties with all the properties we need.
      this.ownKeys(shadowTarget);

      return Reflect.preventExtensions(shadowTarget);
    }

    if (!this.isExtensible(target))
      return true;

    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();
    var rv = this.externalHandler(function() {
      return Reflect.preventExtensions(_this);
    });
    if (rv)
      Reflect.preventExtensions(shadowTarget);
    return rv;
  }),

  // ProxyHandler
  deleteProperty: inGraphHandler("deleteProperty", function(shadowTarget, propName) {
    var target = getRealTarget(shadowTarget);
    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }

    /*
    Assert: IsPropertyKey(P) is true.
    Let desc be ? O.[[GetOwnProperty]](P).
    If desc is undefined, return true.
    If desc.[[Configurable]] is true, then
        Remove the own property with name P from O.
        Return true.
    Return false. 
    */

    // 1. Assert: IsPropertyKey(P) is true.
    AssertIsPropertyKey(propName);

    let desc = this.getOwnPropertyDescriptor(target, propName);
    if (!desc)
      return true;

    if (!desc.configurable)
      return false;

    try {
      var targetMap = this.membrane.map.get(target);
      var shouldBeLocal = this.requiresDeletesBeLocal(target);
      targetMap.deleteLocalDescriptor(this.fieldName, propName, shouldBeLocal);

      if (!shouldBeLocal) {
        var _this = targetMap.getOriginal();
        this.externalHandler(function() {
          return Reflect.deleteProperty(_this, propName);
        });
      }
      return true;
    }
    catch (e) {
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }),

  /**
   * Define a property on a target.
   *
   * @param {Object}  target   The target object.
   * @param {String}  propName The name of the property to define.
   * @param {Object}  desc     The descriptor for the property being defined
   *                           or modified.
   * @param {Boolean} shouldBeLocal True if the property must be defined only
   *                                on the proxy (versus carried over to the
   *                                actual target).
   *
   * @note This is a ProxyHandler trap for defineProperty, modified to include 
   *       the shouldBeLocal argument.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/defineProperty
   */
  defineProperty:
  inGraphHandler("defineProperty", function(shadowTarget, propName, desc,
                                            shouldBeLocal = false) {
    var target = getRealTarget(shadowTarget);
    /* Regarding the funny indentation:  With long names such as defineProperty,
     * inGraphHandler, and shouldBeLocal, it's hard to make everything fit
     * within 80 characters on a line, and properly indent only two spaces.
     * I choose descriptiveness and preserving commit history over reformatting.
     */
    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }

    try {
      if (!this.isExtensible(shadowTarget))
        return false;
      var targetMap = this.membrane.map.get(target);
      var _this = targetMap.getOriginal();

      if (!shouldBeLocal) {
        // Walk the prototype chain to look for shouldBeLocal.
        shouldBeLocal = this.allowLocalProperties(target, true);
      }

      var rv;
      if (shouldBeLocal) {
        let hasOwn = this.externalHandler(function() {
          return Boolean(Reflect.getOwnPropertyDescriptor(_this, propName));
        });
        if (!hasOwn && desc) {
          rv = targetMap.setLocalDescriptor(this.fieldName, propName, desc);
          if (rv)
            this.ownKeys(shadowTarget); // fix up property list
          return rv;
        }
        else {
          targetMap.deleteLocalDescriptor(this.fieldName, propName, false);
          // fall through to Reflect's defineProperty
        }
      }

      if (desc !== undefined) {
        desc = this.membrane.wrapDescriptor(
          this.fieldName,
          targetMap.originField,
          desc
        );
      }

      rv = this.externalHandler(function() {
        return Reflect.defineProperty(_this, propName, desc);
      });
      if (rv) {
        targetMap.unmaskDeletion(this.fieldName, propName);
        this.ownKeys(shadowTarget); // fix up property list
      }
      return rv;
    }
    catch (e) {
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }),

  /**
   * Set a property on a target.
   *
   * @param {Object}  target   The target object.
   * @param {String}  propName The name of the property to set.
   * @param {Variant} value    The new value of the property to set.
   * @param {Object}  receiver The object to which the assignment was originally
   *                           directed. This is usually the proxy itself.  But
   *                           a set handler can also be called indirectly, via
   *                           the prototype chain or various other ways.
   * @param {Boolean} shouldBeLocal True if the property must be defined only
   *                                on the proxy (versus carried over to the
   *                                actual target).
   * @note This is a ProxyHandler trap for defineProperty, modified to include 
   *       the shouldBeLocal argument.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/set
   */
  set: inGraphHandler(
    "set",
    function(shadowTarget, propName, value, receiver,
             options = {}) {
    var target = getRealTarget(shadowTarget);
    var {
      checkedPropName = false,
      shouldBeLocal = false,
      walkedAllowLocal = false
    } = options;
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

    if (!checkedPropName) {
      // 1. Assert: IsPropertyKey(P) is true.
      AssertIsPropertyKey(propName);
      checkedPropName = true;
    }

    if (!shouldBeLocal && !walkedAllowLocal) {
      /* Think carefully before making this walk the prototype chain as in
         .defineProperty().  Remember, this.set() calls itself below, so you
         could accidentally create a O(n^2) operation here.
       */
      walkedAllowLocal = true;
      shouldBeLocal = this.allowLocalProperties(target, true);
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
          let [found, other] = this.membrane.getMembraneProxy(this.fieldName, parent);
          assert(found, "Must find membrane proxy for prototype");
          assert(other === parent, "Retrieved prototypes must match");
          return this.set(
            parent, propName, value, receiver, {
              checkedPropName,
              shouldBeLocal,
              walkedAllowLocal
            }
          );
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

      let origReceiver = receiverMap.getOriginal();
      let existingDesc = this.externalHandler(function() {
        return Reflect.getOwnPropertyDescriptor(origReceiver, propName);
      });
      if (existingDesc !== undefined) {
        if (isAccessorDescriptor(existingDesc) || !existingDesc.writable)
          return false;
      }

      let rvProxy;
      if (!shouldBeLocal && (receiverMap.originField !== this.fieldName)) {
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

      return this.defineProperty(receiver, propName, rvProxy, shouldBeLocal);
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
    if (!shouldBeLocal) {
      // Only now do we convert the value to the target object graph.
      let rvProxy = this.membrane.convertArgumentToProxy(
        this,
        this.membrane.getHandlerByField(receiverMap.originField),
        value
      );
      this.apply(setter, receiver, [ rvProxy ]);
    }
    else {
      this.defineProperty(receiver, propName, new DataDescriptor(value), shouldBeLocal);
    }

    // 9. Return true.
    return true;
  }),

  // ProxyHandler
  setPrototypeOf: inGraphHandler("setPrototypeOf", function(shadowTarget, proto) {
    var target = getRealTarget(shadowTarget);
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
  apply: inGraphHandler("apply", function(shadowTarget, thisArg, argumentsList) {
    var target = getRealTarget(shadowTarget);
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
  inGraphHandler("construct", function(shadowTarget, argumentsList, newTarget) {
    var target = getRealTarget(shadowTarget);
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
   * Determine if a target, or any prototype ancestor, wants local-to-the-proxy
   * properties.
   *
   * @argument target    {Object} The proxy target.
   * @argument recursive {Boolean} True if we should look at prototype ancestors.
   *
   * @returns {Boolean} True if local properties have been requested.
   *
   * @private
   */
  allowLocalProperties: function(target, recursive = false) {
    var shouldBeLocal = false;
    // Walk the prototype chain to look for shouldBeLocal.
    let targetMap = this.membrane.map.get(target);
    let map = targetMap, protoTarget = target;
    while (true) {
      shouldBeLocal = map.requiresUnknownAsLocal(this.fieldName) ||
                      map.requiresUnknownAsLocal(targetMap.originField);
      if (shouldBeLocal)
        return true;
      if (!recursive)
        return false;
      protoTarget = this.getPrototypeOf(protoTarget);
      if (!protoTarget)
        return false;
      map = this.membrane.map.get(protoTarget);
    }
  },

  requiresDeletesBeLocal: function(target) {
    let targetMap = this.membrane.map.get(target);
    let map = targetMap, protoTarget = target, shouldBeLocal = false;
    while (true) {
      shouldBeLocal = map.requiresDeletesBeLocal(this.fieldName) ||
                      map.requiresDeletesBeLocal(targetMap.originField);
      if (shouldBeLocal)
        return true;
      protoTarget = this.getPrototypeOf(protoTarget);
      if (!protoTarget)
        return false;
      map = this.membrane.map.get(protoTarget);
    }
  },

  fixOwnProperties: function(shadowTarget, keyList) {
    let mustDelKeys = Reflect.ownKeys(shadowTarget);
    for (let i = keyList.length - 1; i >= 0; i--) {
      let key = keyList[i];
      let index = mustDelKeys.indexOf(key);
      if (index == -1) {
        Reflect.defineProperty(
          shadowTarget,
          key,
          this.getOwnPropertyDescriptor(shadowTarget, key)
        );
      }
      else {
        mustDelKeys.splice(index, 1);
      }
    }
    for (let i = 0; i < mustDelKeys.length; i++) {
      let key = mustDelKeys[i];
      Reflect.deleteProperty(shadowTarget, key);
    }

    keyList = keyList.slice(0);
    keyList.sort();
    let latestKeys = Reflect.ownKeys(shadowTarget);
    latestKeys.sort();
    assert(keyList.length === latestKeys.length, "Key length mismatch!");
    for (let i = 0; i < keyList.length; i++)
      assert(keyList[i] === latestKeys[i], "Key item mismatch at " + keyList[i]);
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

  removeRevocable: function(revoke) {
    let index = this.__revokeFunctions__.indexOf(revoke);
    if (index == -1) {
      throw new Error("Unknown revoke function!");
    }
    this.__revokeFunctions__.splice(index, 1);
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
  }
});

} // end ObjectGraphHandler definition

Object.seal(ObjectGraphHandler);
