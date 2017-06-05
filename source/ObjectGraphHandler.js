/* A proxy handler designed to return only primitives and objects in a given
 * object graph, defined by the fieldName.
 */
function ObjectGraphHandler(membrane, fieldName) {
  {
    let t = typeof fieldName;
    if ((t != "string") && (t != "symbol"))
      throw new Error("field must be a string or a symbol!");
  }

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

    "__proxyListeners__": new DataDescriptor([], false, false, false),
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
    this.ensureShadowTarget(shadowTarget);

    var target = getRealTarget(shadowTarget);
    var targetMap = this.membrane.map.get(target);

    // cached keys are only valid if original keys have not changed
    var cached = targetMap.cachedOwnKeys(this.fieldName);
    if (cached) {
      let _this = targetMap.getOriginal();
      let check = this.externalHandler(function() {
        return Reflect.ownKeys(_this);
      });

      let pass = ((check.length == cached.original.length) &&
        (check.every(function(elem) {
          return cached.original.includes(elem);
        })));
      if (pass)
        return cached.keys.slice(0);
    }
    return this.setOwnKeys(shadowTarget);
  }),

  // ProxyHandler
  has: inGraphHandler("has", function(shadowTarget, propName) {
    this.ensureShadowTarget(shadowTarget);

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
      let pMapping = this.membrane.map.get(target);
      let shadow = pMapping.getShadowTarget(this.fieldName);
      hasOwn = this.getOwnPropertyDescriptor(shadow, propName);
      if (typeof hasOwn !== "undefined")
        return true;
      target = this.getPrototypeOf(shadow);
      if (target === null)
        break;
      let foundProto;
      [foundProto, target] = this.membrane.getMembraneValue(
        this.fieldName,
        target
      );
      assert(foundProto, "Must find membrane value for prototype");
    }
    return false;
  }),

  // ProxyHandler
  get: inGraphHandler("get", function(shadowTarget, propName, receiver) {
    this.ensureShadowTarget(shadowTarget);

    var desc, target, found, rv, protoLookups = 0;
    target = getRealTarget(shadowTarget);

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
    // Optimization:  do this once!
    AssertIsPropertyKey(propName);

    /* Optimization:  Recursively calling this.get() is a pain in the neck,
     * especially for the stack trace.  So let's use a do...while loop to reset
     * only the entry arguments we need (specifically, target).
     * We should exit the loop with desc, or return from the function.
     */
    do {
      let targetMap = this.membrane.map.get(target);
      {
        /* Special case:  Look for a local property descriptors first, and if we
         * find it, return it unwrapped.
         */
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
      let shadow = targetMap.getShadowTarget(this.fieldName);
      desc = this.getOwnPropertyDescriptor(shadow, propName);
      if (!desc) {
        // this is just for debugging purposes and has no real meaning.
        protoLookups++;

        let proto = this.getPrototypeOf(shadow);
        if (proto === null)
          return undefined;

        {
          let foundProto, other;
          [foundProto, other] = this.membrane.getMembraneProxy(
            this.fieldName,
            proto
          );
          assert(foundProto, "Must find membrane proxy for prototype");
          assert(other === proto, "Retrieved prototypes must match");
        }

        if (Reflect.isExtensible(shadow))
        {
          let foundProto;
          [foundProto, target] = this.membrane.getMembraneValue(
            this.fieldName,
            proto
          );
        }
        else
          target = proto;
      }
    } while (!desc);

    found = false;
    rv = undefined;

    // 4. If IsDataDescriptor(desc) is true, return desc.[[Value]].
    if (isDataDescriptor(desc)) {
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

    return rv;
  }),

  // ProxyHandler
  getOwnPropertyDescriptor:
  inGraphHandler("getOwnPropertyDescriptor", function(shadowTarget, propName) {
    this.ensureShadowTarget(shadowTarget);

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }
    var target = getRealTarget(shadowTarget);
    {
      let [found, unwrapped] = this.membrane.getMembraneValue(this.fieldName, target);
      assert(found, "Original target must be found after calling getRealTarget");
      assert(unwrapped === target, "Original target must match getMembraneValue's return value");
    }
    var targetMap = this.membrane.map.get(target);

    if (this.membrane.showGraphName && (propName == "membraneGraphName")) {
      let checkDesc = Reflect.getOwnPropertyDescriptor(shadowTarget, propName);
      if (checkDesc && !checkDesc.configurable)
        return checkDesc;
      return this.graphNameDescriptor;
    }

    try {
      /* Order of operations:
       * (1) locally deleted property:  undefined
       * (2) locally set property:  the property
       * (3) own keys filtered property: undefined
       * (4) original property:  wrapped property.
       */
      if (targetMap.wasDeletedLocally(targetMap.originField, propName) ||
          targetMap.wasDeletedLocally(this.fieldName, propName))
        return undefined;

      var desc = targetMap.getLocalDescriptor(this.fieldName, propName);
      if (desc !== undefined)
        return desc;

      {
        let originFilter = targetMap.getOwnKeysFilter(targetMap.originField);
        if (originFilter && !originFilter(propName))
          return undefined;
      }
      {
        let localFilter  = targetMap.getOwnKeysFilter(this.fieldName);
        if (localFilter && !localFilter(propName))
          return undefined;
      }

      var _this = targetMap.getOriginal();
      desc = this.externalHandler(function() {
        return Reflect.getOwnPropertyDescriptor(_this, propName);
      });

      // See .getPrototypeOf trap comments for why this matters.
      const isProtoDesc = (propName === "prototype") && isDataDescriptor(desc);
      if (isProtoDesc) {
        // This is necessary to force desc.value to really be a proxy.
        let configurable = desc.configurable;
        desc.configurable = true;
        desc = this.membrane.wrapDescriptor(
          targetMap.originField, this.fieldName, desc
        );
        desc.configurable = configurable;
      }
      else if ((desc !== undefined) &&
               (targetMap.originField !== this.fieldName)) {
        desc = this.membrane.wrapDescriptor(
          targetMap.originField,
          this.fieldName,
          desc
        );
      }

      // Non-configurable descriptors must apply on the actual proxy target.
      if (desc && !desc.configurable) {
        let current = Reflect.getOwnPropertyDescriptor(shadowTarget, propName);
        let attempt = Reflect.defineProperty(shadowTarget, propName, desc);
        assert(!current || attempt,
               "Non-configurable descriptors must apply on the actual proxy target.");
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
    this.ensureShadowTarget(shadowTarget);

    /* Prototype objects are special in JavaScript, but with proxies there is a
     * major drawback.  If the prototype property of a function is
     * non-configurable on the proxy target, the proxy is required to return the
     * proxy target's actual prototype property instead of a wrapper.  You might
     * think "just store the wrapped prototype on the shadow target," and maybe
     * that would work.
     *
     * The trouble arises when you have multiple objects sharing the same
     * prototype object (either through .prototype on functions or through
     * Reflect.getPrototypeOf on ordinary objects).  Some of them may be frozen,
     * others may be sealed, still others not.  The point is .getPrototypeOf()
     * doesn't have a non-configurability requirement to exactly match the way
     * the .prototype property lookup does.
     *
     * It's also for this reason that getPrototypeOf and setPrototypeOf were
     * completely rewritten to more directly use the real prototype chain.
     *
     * One more thing:  it is a relatively safe practice to use a proxy to add,
     * remove or modify individual properties, and ModifyRulesAPI.js supports
     * that in several flavors.  It is doable, but NOT safe, to alter the
     * prototype chain in such a way that breaks the perfect mirroring between
     * object graphs.  Thus, this membrane code will never directly support that
     * as an option.  If you really insist, you should look at either
     * ModifyRulesAPI.prototype.replaceProxy(), or replacing the referring
     * membrane proxy in the object graph with its own shadow target.
     *
     * XXX ajvincent update this comment after fixing #76 to specify how the
     * user will extract the shadow target.
     */
    const target = getRealTarget(shadowTarget);
    const targetMap = this.membrane.map.get(target);

    try {
      const proto = Reflect.getPrototypeOf(target);
      let proxy;
      if (targetMap.originField !== this.fieldName)
        proxy = this.membrane.convertArgumentToProxy(
          this.membrane.getHandlerByField(targetMap.originField),
          this,
          proto
        );
      else
        proxy = proto;

      let pMapping = this.membrane.map.get(proxy);
      if (pMapping && (pMapping.originField !== this.fieldName)) {
        assert(Reflect.setPrototypeOf(shadowTarget, proxy),
               "shadowTarget could not receive prototype?");
      }
      return proxy;
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
    this.ensureShadowTarget(shadowTarget);

    if (!Reflect.isExtensible(shadowTarget))
      return false;
    var target = getRealTarget(shadowTarget);
    var shouldBeLocal = this.getLocalFlag(target, "storeUnknownAsLocal", true);
    if (shouldBeLocal)
      return true;
    
    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();

    var rv = this.externalHandler(function() {
      return Reflect.isExtensible(_this);
    });

    if (!rv)
      // This is our one and only chance to set properties on the shadow target.
      this.lockShadowTarget(shadowTarget);

    return rv;
  }),

  // ProxyHandler
  preventExtensions: inGraphHandler("preventExtensions", function(shadowTarget) {
    this.ensureShadowTarget(shadowTarget);

    var target = getRealTarget(shadowTarget);
    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();

    // Walk the prototype chain to look for shouldBeLocal.
    var shouldBeLocal = this.getLocalFlag(target, "storeUnknownAsLocal", true);

    if (!shouldBeLocal && !this.isExtensible(shadowTarget))
      return true;

    // This is our one and only chance to set properties on the shadow target.
    var rv = this.lockShadowTarget(shadowTarget);

    if (!shouldBeLocal)
      rv = Reflect.preventExtensions(_this);
    return rv;
  }),

  // ProxyHandler
  deleteProperty: inGraphHandler("deleteProperty", function(shadowTarget, propName) {
    this.ensureShadowTarget(shadowTarget);

    var target = getRealTarget(shadowTarget);
    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }

    /*
    http://www.ecma-international.org/ecma-262/7.0/#sec-ordinarydelete

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

    try {
      var targetMap = this.membrane.map.get(target);
      var shouldBeLocal = this.requiresDeletesBeLocal(target);

      if (!shouldBeLocal) {
        /* See .defineProperty trap for why.  Basically, if the property name
         * is blacklisted, we should treat it as if the property doesn't exist
         * on the original target.  The spec says if GetOwnProperty returns
         * undefined (which it will for our proxy), we should return true.
         */
        let originFilter = targetMap.getOwnKeysFilter(targetMap.originField);
        let localFilter  = targetMap.getOwnKeysFilter(this.fieldName);
        if (originFilter || localFilter)
          this.membrane.warnOnce(this.membrane.constants.warnings.FILTERED_KEYS_WITHOUT_LOCAL);
        if (originFilter && !originFilter(propName))
          return true;
        if (localFilter && !localFilter(propName))
          return true;
      }
    }
    catch (e) {
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }

    let desc = this.getOwnPropertyDescriptor(shadowTarget, propName);
    if (!desc)
      return true;

    if (!desc.configurable)
      return false;

    try {
      targetMap.deleteLocalDescriptor(this.fieldName, propName, shouldBeLocal);

      if (!shouldBeLocal) {
        var _this = targetMap.getOriginal();
        this.externalHandler(function() {
          return Reflect.deleteProperty(_this, propName);
        });
      }

      Reflect.deleteProperty(shadowTarget, propName);
      this.setOwnKeys(shadowTarget);

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
    this.ensureShadowTarget(shadowTarget);

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

    if (this.membrane.showGraphName && (propName == "membraneGraphName")) {
      return Reflect.defineProperty(shadowTarget, propName, desc);
    }

    try {
      var targetMap = this.membrane.map.get(target);
      var _this = targetMap.getOriginal();

      if (!shouldBeLocal) {
        // Walk the prototype chain to look for shouldBeLocal.
        shouldBeLocal = this.getLocalFlag(target, "storeUnknownAsLocal", true);
      }

      var rv, originFilter, localFilter;

      {
        /* It is dangerous to have an ownKeys filter and define a non-local
         * property.  It will work when the property name passes through the
         * filters.  But when that property name is not permitted, then we can
         * get some strange side effects.
         *
         * Specifically, if the descriptor's configurable property is set to
         * false, either the shadow target must get the property, or an
         * exception is thrown.
         *
         * If the descriptor's configurable property is true, the ECMAScript
         * specification doesn't object...
         *
         * In either case, the property would be set, but never retrievable.  I
         * think this is fundamentally a bad thing, so I'm going to play it safe
         * and return false here, denying the property being set on either the
         * proxy or the protected target.
         */
        originFilter = targetMap.getOwnKeysFilter(targetMap.originField);
        localFilter  = targetMap.getOwnKeysFilter(this.fieldName);
        if (originFilter || localFilter)
          this.membrane.warnOnce(this.membrane.constants.warnings.FILTERED_KEYS_WITHOUT_LOCAL);
      }

      if (shouldBeLocal) {
        if (!Reflect.isExtensible(shadowTarget))
          return false;

        let hasOwn = true;

        // Own-keys filters modify hasOwn.
        if (hasOwn && originFilter && !originFilter(propName))
          hasOwn = false;
        if (hasOwn && localFilter && !localFilter(propName))
          hasOwn = false;

        // It's probably more expensive to look up a property than to filter the name.
        if (hasOwn)
          hasOwn = this.externalHandler(function() {
            return Boolean(Reflect.getOwnPropertyDescriptor(_this, propName));
          });

        if (!hasOwn && desc) {
          rv = targetMap.setLocalDescriptor(this.fieldName, propName, desc);
          if (rv)
            this.setOwnKeys(shadowTarget); // fix up property list
          if (!desc.configurable)
            Reflect.defineProperty(shadowTarget, propName, desc);
          return rv;
        }
        else {
          targetMap.deleteLocalDescriptor(this.fieldName, propName, false);
          // fall through to Reflect's defineProperty
        }
      }
      else {
        if (originFilter && !originFilter(propName))
          return false;
        if (localFilter && !localFilter(propName))
          return false;
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
        this.setOwnKeys(shadowTarget); // fix up property list

        if (!desc.configurable)
          Reflect.defineProperty(shadowTarget, propName, desc);
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

  // ProxyHandler
  set: inGraphHandler("set", function(shadowTarget, propName, value, receiver) {
    this.ensureShadowTarget(shadowTarget);

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("set propName: " + propName);
    }
    let target = getRealTarget(shadowTarget);

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

    /* Optimization:  Recursively calling this.set() is a pain in the neck,
     * especially for the stack trace.  So let's use a do...while loop to reset
     * only the entry arguments we need (specifically, shadowTarget, target).
     * We should exit the loop with desc, or return from the function.
     */

    // 1. Assert: IsPropertyKey(P) is true.
    AssertIsPropertyKey(propName);

    var ownDesc,
        shouldBeLocal = this.getLocalFlag(target, "storeUnknownAsLocal", true);

    do {
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

      let pMapping = this.membrane.map.get(target);
      let shadow = pMapping.getShadowTarget(this.fieldName);
      ownDesc = this.getOwnPropertyDescriptor(shadow, propName);
      if (ownDesc)
        break;

      {
        let parent = this.getPrototypeOf(shadow);
        if (parent === null) {
          ownDesc = new DataDescriptor(undefined, true);
          break;
        }

        let [found, other] = this.membrane.getMembraneProxy(
          this.fieldName,
          parent
        );
        assert(found, "Must find membrane proxy for prototype");
        let sMapping = this.membrane.map.get(parent);
        assert(sMapping, "Missing a ProxyMapping?");

        if (sMapping.originField != this.fieldName) {
          [found, target] = this.membrane.getMembraneValue(
            this.fieldName,
            parent
          );
          assert(found, "Must find membrane value for prototype");
        }
        else
        {
          target = parent;
        }
      }
    } while (true); // end optimization for ownDesc

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

      return this.defineProperty(
        this.getShadowTarget(receiver),
        propName,
        rvProxy,
        shouldBeLocal
      );
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
      this.apply(this.getShadowTarget(setter), receiver, [ rvProxy ]);
    }
    else {
      this.defineProperty(
        this.getShadowTarget(receiver),
        propName,
        new DataDescriptor(value),
        shouldBeLocal
      );
    }

    // 9. Return true.
    return true;
  }),

  // ProxyHandler
  setPrototypeOf: inGraphHandler("setPrototypeOf", function(shadowTarget, proto) {
    this.ensureShadowTarget(shadowTarget);

    var target = getRealTarget(shadowTarget);
    try {
      var targetMap = this.membrane.map.get(target);
      var _this = targetMap.getOriginal();

      let protoProxy, wrappedProxy, found;
      if (targetMap.originField !== this.fieldName) {
        protoProxy = this.membrane.convertArgumentToProxy(
          this,
          this.membrane.getHandlerByField(targetMap.originField),
          proto
        );
        [found, wrappedProxy] = this.membrane.getMembraneProxy(
          this.fieldName, proto
        );
        assert(found, "Membrane proxy not found immediately after wrapping!");
      }
      else {
        protoProxy = proto;
        wrappedProxy = proto;
      }

      var rv = this.externalHandler(function() {
        return Reflect.setPrototypeOf(_this, protoProxy);
      });
      if (rv)
        assert(Reflect.setPrototypeOf(shadowTarget, wrappedProxy),
               "shadowTarget could not receive prototype?");

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
    this.ensureShadowTarget(shadowTarget);

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

    // This is where we are "counter-wrapping" an argument.
    const optionsBase = Object.seal({
      callable: target,
      trapName: "apply"
    });

    _this = this.membrane.convertArgumentToProxy(
      this,
      argHandler,
      thisArg,
      Object.create(optionsBase, { "isThis": new DataDescriptor(true) })
    );

    /* XXX ajvincent This seemed like a good idea, but I realized it adds execution time.
    if (mayLog) {
      this.membrane.logger.debug("apply this.membraneGraphName: " + _this.membraneGraphName);
    }
    */

    for (let i = 0; i < argumentsList.length; i++) {
      let nextArg = argumentsList[i];
      nextArg = this.membrane.convertArgumentToProxy(
        this,
        argHandler,
        nextArg,
        Object.create(optionsBase, { "argIndex": new DataDescriptor(i) })
      );
      args.push(nextArg);

      /* XXX ajvincent This seemed like a good idea, but I realized it adds execution time.
      if (mayLog && (valueType(nextArg) != "primitive")) {
        this.membrane.logger.debug("apply argument " + i + "'s membraneGraphName: " + nextArg.membraneGraphName);
      }
      */
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
  inGraphHandler("construct", function(shadowTarget, argumentsList, ctorTarget) {
    this.ensureShadowTarget(shadowTarget);

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

    // This is where we are "counter-wrapping" an argument.
    const optionsBase = Object.seal({
      callable: target,
      trapName: "construct"
    });

    for (let i = 0; i < argumentsList.length; i++) {
      let nextArg = argumentsList[i];
      nextArg = this.membrane.convertArgumentToProxy(
        this,
        argHandler,
        nextArg,
        Object.create(optionsBase, { "argIndex": new DataDescriptor(i) })
      );
      args.push(nextArg);

      if (mayLog && (valueType(nextArg) != "primitive")) {
        this.membrane.logger.debug("construct argument " + i + "'s membraneGraphName: " + nextArg.membraneGraphName);
      }
    }

    const ctor = this.membrane.convertArgumentToProxy(
      this,
      argHandler,
      ctorTarget
    );

    let rv = this.externalHandler(function() {
      return Reflect.construct(target, args, ctor);
    });

    rv = this.membrane.convertArgumentToProxy(
      argHandler,
      this,
      rv
    );

    if (mayLog) {
      this.membrane.logger.debug("construct exiting");
    }
    return rv;
  }),

  /**
   * Ensure the first argument is a known shadow target.
   *
   * @param {Object} shadowTarget The supposed target.
   * @private
   */
  ensureShadowTarget: function(shadowTarget) {
    var pass = false;
    try {
      const target = getRealTarget(shadowTarget);
      const targetMap = this.membrane.map.get(target);
      pass = (targetMap.getShadowTarget(this.fieldName) === shadowTarget);
    }
    finally {
      if (!pass) {
        throw new Error("ObjectGraphHandler traps must be called with a shadow target");
      }
    }
  },

  getShadowTarget: function(target) {
    let targetMap = this.membrane.map.get(target);
    return targetMap.getShadowTarget(this.fieldName);
  },

  /**
   * Add a listener for new proxies.
   *
   * @see ProxyNotify
   */
  addProxyListener: function(listener) {
    if (typeof listener != "function")
      throw new Error("listener is not a function!");
    if (!this.__proxyListeners__.includes(listener))
      this.__proxyListeners__.push(listener);
  },

  /**
   * Remove a listener for new proxies.
   *
   * @see ProxyNotify
   */
  removeProxyListener: function(listener) {
    let index = this.__proxyListeners__.indexOf(listener);
    if (index == -1)
      throw new Error("listener is not registered!");
    this.__proxyListeners__.splice(index, 1);
  },

  /**
   * Handle a call to code the membrane doesn't control.
   *
   * @private
   */
  externalHandler: function(callback) {
    return inGraphHandler("external", callback).apply(this);
  },

  /**
   * Set all properties on a shadow target, including prototype, and seal it.
   *
   * @private
   */
  lockShadowTarget: function(shadowTarget) {
    const target = getRealTarget(shadowTarget);
    const targetMap = this.membrane.map.get(target);
    const _this = targetMap.getOriginal();
    const keys = this.setOwnKeys(shadowTarget);
    keys.forEach(this.copyProperty.bind(this, _this, shadowTarget, targetMap.originField));

    // fix the prototype;
    const proto = this.getPrototypeOf(shadowTarget);
    assert(Reflect.setPrototypeOf(shadowTarget, proto),
           "Failed to set unwrapped prototype on non-extensible?");
    return Reflect.preventExtensions(shadowTarget);
  },

  /**
   * Specify the list of ownKeys this proxy exposes.
   *
   * @param {Object} shadowTarget The proxy target
   * @private
   *
   * @returns {String[]} The list of exposed keys.
   */
  setOwnKeys: function(shadowTarget) {
    var target = getRealTarget(shadowTarget);
    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();

    // First, get the underlying object's key list, forming a base.
    var originalKeys = this.externalHandler(function() {
      return Reflect.ownKeys(_this);
    });

    // Remove duplicated names and keys that have been deleted.
    {
      let mustSkip = new Set();
      targetMap.appendDeletedNames(targetMap.originField, mustSkip);
      targetMap.appendDeletedNames(this.fieldName, mustSkip);

      let originFilter = targetMap.getOwnKeysFilter(targetMap.originField);
      let localFilter  = targetMap.getOwnKeysFilter(this.fieldName);

      if ((mustSkip.size > 0) || originFilter || localFilter) {
        originalKeys = originalKeys.filter(function(elem) {
          if (mustSkip.has(elem))
            return false;
          if (originFilter && !originFilter.apply(this, arguments))
            return false;
          if (localFilter && !localFilter.apply(this, arguments))
            return false;
          return true;
        });
      }
    }

    // Append the local proxy keys.
    var rv = originalKeys.concat(
      targetMap.localOwnKeys(targetMap.originField),
      targetMap.localOwnKeys(this.fieldName)
    );

    if (this.membrane.showGraphName && !rv.includes("membraneGraphName")) {
      rv.push("membraneGraphName");
    }

    // Optimization, storing the generated key list for future retrieval.
    targetMap.setCachedOwnKeys(this.fieldName, rv, originalKeys);
    return rv;
  },

  /**
   * Copy a property from the original target to the shadow target.
   *
   * @param _this        {Object} The original target.
   * @param shadowTarget {Object} The target to apply the property to.
   * @param originField  {String|Symbol}
   *                     The graph name the original target is from.
   * @param propName     {String} The name of the property.
   *
   * @private
   */
  copyProperty: function(_this, shadowTarget, originField, propName) {
    if (this.membrane.showGraphName && (propName == "membraneGraphName")) {
      // Special case.
      Reflect.defineProperty(shadowTarget, propName, this.graphNameDescriptor);
      return;
    }

    var desc = Reflect.getOwnPropertyDescriptor(_this, propName);
    if (!desc)
      return;
    const isProtoDesc = (propName === "prototype") && isDataDescriptor(desc);
    if (isProtoDesc)
    {
      // This is necessary to force desc.value to be wrapped in the membrane.
      let configurable = desc.configurable;
      desc.configurable = true;
      desc = this.membrane.wrapDescriptor(originField, this.fieldName, desc);
      desc.configurable = configurable;
    }
    else
      desc = this.membrane.wrapDescriptor(originField, this.fieldName, desc);

    if (desc)
      Reflect.defineProperty(shadowTarget, propName, desc);
  },

  /**
   * Determine if a target, or any prototype ancestor, has a local-to-the-proxy
   * flag.
   *
   * @argument target    {Object} The proxy target.
   * @argument flagName  {String} The name of the flag.
   * @argument recurse {Boolean} True if we should look at prototype ancestors.
   *
   * @returns {Boolean} True if local properties have been requested.
   *
   * @private
   */
  getLocalFlag: function(target, flagName, recurse = false) {
    let map = this.membrane.map.get(target);
    const field = this.fieldName;
    const originField = map.originField;
    while (true) {
      let shouldBeLocal = map.getLocalFlag(field, flagName) ||
                          map.getLocalFlag(originField, flagName);
      if (shouldBeLocal)
        return true;
      if (!recurse)
        return false;
      let shadowTarget = map.getShadowTarget(this.fieldName);

      /* XXX ajvincent I suspect this assertion might fail if
       * this.fieldName == map.originField:  if the field represents an original
       * value.
       */
      assert(shadowTarget, "getLocalFlag failed to get a shadow target!");

      let protoTarget = this.getPrototypeOf(shadowTarget);
      if (!protoTarget)
        return false;
      map = this.membrane.map.get(protoTarget);
    }
  },

  /**
   * Determine whether this proxy (or one it inherits from) requires local
   * property deletions.
   *
   * @param target {Object} The proxy target.
   *
   * @returns {Boolean} True if deletes should be local.
   *
   * @private
   */
  requiresDeletesBeLocal: function(target) {
    var protoTarget = target;
    var map = this.membrane.map.get(protoTarget);
    const originField = map.originField;
    while (true) {
      let shouldBeLocal = map.getLocalFlag(this.fieldName, "requireLocalDelete") ||
                          map.getLocalFlag(originField, "requireLocalDelete");
      if (shouldBeLocal)
        return true;
      let shadowTarget = map.getShadowTarget(this.fieldName);
      protoTarget = this.getPrototypeOf(shadowTarget);
      if (!protoTarget)
        return false;
      map = this.membrane.map.get(protoTarget);
    }
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
   * Remove a ProxyMapping or a Proxy.revoke function from our list.
   *
   * @private
   */
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
    Object.defineProperty(this, "__isDead__", new DataDescriptor(true));
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
