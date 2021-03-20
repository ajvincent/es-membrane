import {
  DataDescriptor,
  NWNCDataDescriptor,
  assert,
  defineNWNCProperties,
  getRealTarget,
  isAccessorDescriptor,
  isDataDescriptor,
  returnFalse,
  valueType,
} from "./sharedUtilities.mjs";

import {
  ProxyCylinder,
} from "./ProxyCylinder.mjs";

function AssertIsPropertyKey(propName) {
  var type = typeof propName;
  if ((type !== "string") && (type !== "symbol"))
    throw new Error("propName is not a symbol or a string!");
  return true;
}

/**
 * @type {WeakMap<ObjectGraph, function>}
 */
 const passThroughMap = new WeakMap();

/**
 * A proxy handler designed to return only primitives and objects in a given
 * object graph, defined by the graphName.
 *
 * @package
 */
export default class ObjectGraphHandler {
  constructor(membrane, graphName) {
    {
      let t = typeof graphName;
      if ((t != "string") && (t != "symbol"))
        throw new Error("graph name must be a string or a symbol!");
    }

    let boundMethods = {};
    [
      "apply",
      "construct",
    ].forEach(function(key) {
      Reflect.defineProperty(boundMethods, key, new NWNCDataDescriptor(
        this[key].bind(this), false
      ));
    }, this);
    Object.freeze(boundMethods);

    /**
     * @private
     * @type {boolean}
     */
    this.__isDead__ = false;

    /**
     * @public
     */
    defineNWNCProperties(this, {
      membrane,
      graphName,
    });

    defineNWNCProperties(this, {
      /**
       * @private
       */
      __proxyListeners__: new Set(),
    });

    /**
     * @package
     */
    defineNWNCProperties(this, {
      boundMethods,

      /**
       * @deprecated
       */
      graphNameDescriptor: new DataDescriptor(graphName),

      // see .defineLazyGetter, ProxyNotify for details.
      proxiesInConstruction: new WeakMap(/* original value: [callback() {}, ...]*/),
    }, false);

    Reflect.preventExtensions(this);
  }

  /* Strategy for each handler trap:
   * (1) Determine the target's origin graph name.
   * (2) Wrap all non-primitive arguments for Reflect in the target graph.
   * (3) var rv = Reflect[trapName].call(argList);
   * (4) Wrap rv in this.graphName's graph.
   * (5) return rv.
   *
   * Error stack trace hiding will be determined by the membrane itself.
   */

  // ProxyHandler
  ownKeys(shadowTarget) {
    this.validateTrapAndShadowTarget("ownKeys", shadowTarget);
    if (!Reflect.isExtensible(shadowTarget))
      return Reflect.ownKeys(shadowTarget);

    var target = getRealTarget(shadowTarget);
    var targetCylinder = this.membrane.cylinderMap.get(target);

    // cached keys are only valid if original keys have not changed
    var cached = targetCylinder.cachedOwnKeys(this.graphName);
    if (cached) {
      let _this = targetCylinder.getOriginal();
      let check = Reflect.ownKeys(_this);

      let pass = ((check.length == cached.original.length) &&
        (check.every(function(elem) {
          return cached.original.includes(elem);
        })));
      if (pass)
        return cached.keys.slice(0);
    }
    return this.setOwnKeys(shadowTarget);
  }

  // ProxyHandler
  has(shadowTarget, propName) {
    this.validateTrapAndShadowTarget("has", shadowTarget);

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
      let cylinder = this.membrane.cylinderMap.get(target);
      let shadow = cylinder.getShadowTarget(this.graphName);
      hasOwn = this.getOwnPropertyDescriptor(shadow, propName);
      if (typeof hasOwn !== "undefined")
        return true;
      target = this.getPrototypeOf(shadow);
      if (target === null)
        break;
      let foundProto;
      [foundProto, target] = this.membrane.getMembraneValue(
        this.graphName,
        target
      );
      assert(foundProto, "Must find membrane value for prototype");
    }
    return false;
  }

  // ProxyHandler
  get(shadowTarget, propName, receiver) {
    this.validateTrapAndShadowTarget("get", shadowTarget);

    var desc, target, found, rv;
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
      let targetCylinder = this.membrane.cylinderMap.get(target);
      {
        /* Special case:  Look for a local property descriptors first, and if we
         * find it, return it unwrapped.
         */
        desc = targetCylinder.getLocalDescriptor(this.graphName, propName);

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
      let shadow = targetCylinder.getShadowTarget(this.graphName);
      if (shadow)
        desc = this.getOwnPropertyDescriptor(shadow, propName);
      else
        desc = Reflect.getOwnPropertyDescriptor(target, propName);

      if (!desc) {
        let proto = this.getPrototypeOf(shadow);
        if (proto === null)
          return undefined;

        {
          let foundProto, other;
          [foundProto, other] = this.membrane.getMembraneProxy(
            this.graphName,
            proto
          );
          if (!foundProto)
            return Reflect.get(proto, propName, receiver);
          assert(other === proto, "Retrieved prototypes must match");
        }

        if (Reflect.isExtensible(shadow))
        {
          target = this.membrane.getMembraneValue(
            this.graphName,
            proto
          )[1];
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
        rv = Reflect.apply(getter, receiver, []);
        found = true;
      }
    }

    if (!found) {
      // end of the algorithm
      throw new Error("Membrane fall-through: we should not get here");
    }

    return rv;
  }

  // ProxyHandler
  getOwnPropertyDescriptor(shadowTarget, propName) {
    this.validateTrapAndShadowTarget("getOwnPropertyDescriptor", shadowTarget);

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }
    var target = getRealTarget(shadowTarget);
    {
      let [found, unwrapped] = this.membrane.getMembraneValue(this.graphName, target);
      assert(found, "Original target must be found after calling getRealTarget");
      assert(unwrapped === target, "Original target must match getMembraneValue's return value");
    }
    var targetCylinder = this.membrane.cylinderMap.get(target);

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
      if (targetCylinder.wasDeletedLocally(targetCylinder.originGraph, propName) ||
          targetCylinder.wasDeletedLocally(this.graphName, propName))
        return undefined;

      var desc = targetCylinder.getLocalDescriptor(this.graphName, propName);
      if (desc !== undefined)
        return desc;

      {
        let originFilter = targetCylinder.getOwnKeysFilter(targetCylinder.originGraph);
        if (originFilter && !originFilter(propName))
          return undefined;
      }
      {
        let localFilter  = targetCylinder.getOwnKeysFilter(this.graphName);
        if (localFilter && !localFilter(propName))
          return undefined;
      }

      var _this = targetCylinder.getOriginal();
      desc = Reflect.getOwnPropertyDescriptor(_this, propName);

      // See .getPrototypeOf trap comments for why this matters.
      const isProtoDesc = (propName === "prototype") && isDataDescriptor(desc);
      const isForeign = ((desc !== undefined) &&
                         (targetCylinder.originGraph !== this.graphName));
      if (isProtoDesc || isForeign) {
        // This is necessary to force desc.value to really be a proxy.
        let configurable = desc.configurable;
        desc.configurable = true;
        desc = this.membrane.wrapDescriptor(
          targetCylinder.originGraph, this.graphName, desc
        );
        desc.configurable = configurable;
      }

      // Non-configurable descriptors must apply on the actual proxy target.
      if (desc && !desc.configurable) {
        let current = Reflect.getOwnPropertyDescriptor(shadowTarget, propName);
        let attempt = Reflect.defineProperty(shadowTarget, propName, desc);
        assert(!current || attempt,
               "Non-configurable descriptors must apply on the actual proxy target.");
      }

      // If a shadow target has a non-configurable descriptor, we must return it.
      /* XXX ajvincent It's unclear why this block couldn't go earlier in this
       * function.  There's either a bug here, or a gap in my own understanding.
       */
      {
        let shadowDesc = Reflect.getOwnPropertyDescriptor(shadowTarget, propName);
        if (shadowDesc)
          return shadowDesc;
      }

      return desc;
    }
    catch (e) {
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }

  // ProxyHandler
  getPrototypeOf(shadowTarget) {
    this.validateTrapAndShadowTarget("getPrototypeOf", shadowTarget);

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
     * as an option.
     *
     * XXX ajvincent update this comment after fixing #76 to specify how the
     * user will extract the shadow target.
     */
    const target = getRealTarget(shadowTarget);
    const targetCylinder = this.membrane.cylinderMap.get(target);

    try {
      const proto = Reflect.getPrototypeOf(target);
      let proxy;
      if (targetCylinder.originGraph !== this.graphName)
        proxy = this.membrane.convertArgumentToProxy(
          this.membrane.getHandlerByName(targetCylinder.originGraph),
          this,
          proto
        );
      else
        proxy = proto;

      let cylinder = this.membrane.cylinderMap.get(proxy);
      if (cylinder && (cylinder.originGraph !== this.graphName)) {
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
  }

  // ProxyHandler
  isExtensible(shadowTarget) {
    this.validateTrapAndShadowTarget("isExtensible", shadowTarget);

    if (!Reflect.isExtensible(shadowTarget))
      return false;
    var target = getRealTarget(shadowTarget);
    var shouldBeLocal = this.getLocalFlag(target, "storeUnknownAsLocal", true);
    if (shouldBeLocal)
      return true;
    
    var targetCylinder = this.membrane.cylinderMap.get(target);
    var _this = targetCylinder.getOriginal();

    var rv = Reflect.isExtensible(_this);

    if (!rv)
      // This is our one and only chance to set properties on the shadow target.
      this.lockShadowTarget(shadowTarget);

    return rv;
  }

  // ProxyHandler
  preventExtensions(shadowTarget) {
    this.validateTrapAndShadowTarget("preventExtensions", shadowTarget);

    var target = getRealTarget(shadowTarget);
    var targetCylinder = this.membrane.cylinderMap.get(target);
    var _this = targetCylinder.getOriginal();

    // Walk the prototype chain to look for shouldBeLocal.
    var shouldBeLocal = this.getLocalFlag(target, "storeUnknownAsLocal", true);

    if (!shouldBeLocal && !this.isExtensible(shadowTarget))
      return true;

    // This is our one and only chance to set properties on the shadow target.
    var rv = this.lockShadowTarget(shadowTarget);

    if (!shouldBeLocal)
      rv = Reflect.preventExtensions(_this);
    return rv;
  }

  // ProxyHandler
  deleteProperty(shadowTarget, propName) {
    this.validateTrapAndShadowTarget("deleteProperty", shadowTarget);

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
    var targetCylinder, shouldBeLocal;

    try {
      targetCylinder = this.membrane.cylinderMap.get(target);
      shouldBeLocal = this.requiresDeletesBeLocal(target);

      if (!shouldBeLocal) {
        /* See .defineProperty trap for why.  Basically, if the property name
         * is blacklisted, we should treat it as if the property doesn't exist
         * on the original target.  The spec says if GetOwnProperty returns
         * undefined (which it will for our proxy), we should return true.
         */
        let originFilter = targetCylinder.getOwnKeysFilter(targetCylinder.originGraph);
        let localFilter  = targetCylinder.getOwnKeysFilter(this.graphName);
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
      targetCylinder.deleteLocalDescriptor(this.graphName, propName, shouldBeLocal);

      if (!shouldBeLocal) {
        var _this = targetCylinder.getOriginal();
        Reflect.deleteProperty(_this, propName);
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
  }

  /**
   * Define a property on a target.
   *
   * @param {Object}  target        The target object.
   * @param {String}  propName      The name of the property to define.
   * @param {Object}  desc          The descriptor for the property being defined
   *                                or modified.
   * @param {Boolean} shouldBeLocal True if the property must be defined only
   *                                on the proxy (versus carried over to the
   *                                actual target).
   *
   * @note This is a ProxyHandler trap for defineProperty, modified to include 
   *       the shouldBeLocal argument.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/defineProperty
   */
  defineProperty(shadowTarget, propName, desc, shouldBeLocal) {
    this.validateTrapAndShadowTarget("defineProperty", shadowTarget);

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
      var targetCylinder = this.membrane.cylinderMap.get(target);
      var _this = targetCylinder.getOriginal();

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
        originFilter = targetCylinder.getOwnKeysFilter(targetCylinder.originGraph);
        localFilter  = targetCylinder.getOwnKeysFilter(this.graphName);
        if (originFilter || localFilter)
          this.membrane.warnOnce(this.membrane.constants.warnings.FILTERED_KEYS_WITHOUT_LOCAL);
      }

      if (shouldBeLocal) {
        if (!Reflect.isExtensible(shadowTarget))
          return Reflect.defineProperty(shadowTarget, propName, desc);

        let hasOwn = true;

        // Own-keys filters modify hasOwn.
        if (hasOwn && originFilter && !originFilter(propName))
          hasOwn = false;
        if (hasOwn && localFilter && !localFilter(propName))
          hasOwn = false;

        // It's probably more expensive to look up a property than to filter the name.
        if (hasOwn)
          hasOwn = Boolean(Reflect.getOwnPropertyDescriptor(_this, propName));

        if (!hasOwn && desc) {
          rv = targetCylinder.setLocalDescriptor(this.graphName, propName, desc);
          if (rv)
            this.setOwnKeys(shadowTarget); // fix up property list
          if (!desc.configurable)
            Reflect.defineProperty(shadowTarget, propName, desc);
          return rv;
        }
        else {
          targetCylinder.deleteLocalDescriptor(this.graphName, propName, false);
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
          this.graphName,
          targetCylinder.originGraph,
          desc
        );
      }

      rv = Reflect.defineProperty(_this, propName, desc);
      if (rv) {
        targetCylinder.unmaskDeletion(this.graphName, propName);
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
  }

  // ProxyHandler
  set(shadowTarget, propName, value, receiver) {
    this.validateTrapAndShadowTarget("set", shadowTarget);

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

    //eslint-disable-next-line no-constant-condition
    while (true) {
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

      let cylinder = this.membrane.cylinderMap.get(target);
      let shadow;
      if (cylinder.originGraph === this.graphName) {
        shadow = cylinder.getOriginal();
        ownDesc = Reflect.getOwnPropertyDescriptor(cylinder.getOriginal(), propName);
      }
      else {
        shadow = cylinder.getShadowTarget(this.graphName);
        assert(shadow, "No shadow target?");
        ownDesc = this.getOwnPropertyDescriptor(shadow, propName);
      }

      if (ownDesc)
        break;

      {
        let proto = (cylinder.originGraph === this.graphName) ?
                    Reflect.getPrototypeOf(shadow) :
                    this.getPrototypeOf(shadow);
        if (proto === null) {
          ownDesc = new DataDescriptor(undefined, true);
          break;
        }

        let found = this.membrane.getMembraneProxy(
          this.graphName,
          proto
        )[0];
        assert(found, "Must find membrane proxy for prototype");
        let protoCylinder = this.membrane.cylinderMap.get(proto);
        assert(protoCylinder, "Missing a ProxyCylinder?");

        if (protoCylinder.originGraph != this.graphName) {
          [found, target] = this.membrane.getMembraneValue(
            this.graphName,
            proto
          );
          assert(found, "Must find membrane value for prototype");
        }
        else
        {
          target = proto;
        }
      }
    } // end optimization for ownDesc

    // Special step:  convert receiver to unwrapped value.
    let receiverMap = this.membrane.cylinderMap.get(receiver);
    if (!receiverMap) {
      // We may be under construction.
      let proto = Object.getPrototypeOf(receiver);
      let protoMap = this.membrane.cylinderMap.get(proto);
      let pHandler = this.membrane.getHandlerByName(protoMap.originGraph);

      if (this.membrane.cylinderMap.has(receiver)) {
        /* XXX ajvincent If you're stepping through in a debugger, the debugger
         * may have set this.membrane.cylinderMap.get(receiver) between actions.
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

      receiverMap = this.membrane.cylinderMap.get(receiver);
      if (!receiverMap)
        throw new Error("How do we still not have a receiverMap?");
      if (receiverMap.originGraph === this.graphName)
        throw new Error("Receiver's graph name should not match!");
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
      let existingDesc = Reflect.getOwnPropertyDescriptor(origReceiver, propName);
      if (existingDesc !== undefined) {
        if (isAccessorDescriptor(existingDesc) || !existingDesc.writable)
          return false;
      }

      let rvProxy;
      if (!shouldBeLocal && (receiverMap.originGraph !== this.graphName)) {
        rvProxy = new DataDescriptor(
          // Only now do we convert the value to the target object graph.
          this.membrane.convertArgumentToProxy(
            this,
            this.membrane.getHandlerByName(receiverMap.originGraph),
            value
          ),
          true
        );
      }
      else {
        rvProxy = new DataDescriptor(value, true);
      }

      if (!ownDesc.configurable)
      {
        rvProxy.configurable = false;
        rvProxy.enumerable = ownDesc.enumerable;
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

    if (!this.membrane.hasProxyForValue(this.graphName, setter))
      this.membrane.addPartsToCylinder(this, setter);

    // 8. Perform ? Call(setter, Receiver, « V »).

    if (!shouldBeLocal) {
      // Only now do we convert the value to the target object graph.
      let rvProxy = this.membrane.convertArgumentToProxy(
        this,
        this.membrane.getHandlerByName(receiverMap.originGraph),
        value
      );

      const shadow = this.getShadowTarget(setter);
      if (shadow)
        this.apply(this.getShadowTarget(setter), receiver, [ rvProxy ]);
      else
        Reflect.apply(setter, receiver, [ rvProxy ]);

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
  }

  // ProxyHandler
  setPrototypeOf(shadowTarget, proto) {
    this.validateTrapAndShadowTarget("setPrototypeOf", shadowTarget);

    var target = getRealTarget(shadowTarget);
    try {
      var targetCylinder = this.membrane.cylinderMap.get(target);
      var _this = targetCylinder.getOriginal();

      let protoProxy, wrappedProxy, found;
      if (targetCylinder.originGraph !== this.graphName) {
        protoProxy = this.membrane.convertArgumentToProxy(
          this,
          this.membrane.getHandlerByName(targetCylinder.originGraph),
          proto
        );
        [found, wrappedProxy] = this.membrane.getMembraneProxy(
          this.graphName, proto
        );
        assert(found, "Membrane proxy not found immediately after wrapping!");
      }
      else {
        protoProxy = proto;
        wrappedProxy = proto;
      }

      var rv = Reflect.setPrototypeOf(_this, protoProxy);
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
  }

  // ProxyHandler
  apply(shadowTarget, thisArg, argumentsList) {
    this.validateTrapAndShadowTarget("apply", shadowTarget);

    var target = getRealTarget(shadowTarget);
    var _this, args = [];
    let targetCylinder  = this.membrane.cylinderMap.get(target);
    let argHandler = this.membrane.getHandlerByName(targetCylinder.originGraph);

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug([
        "apply originGraphs: inbound = ",
        argHandler.graphName,
        ", outbound = ",
        this.graphName
      ].join(""));
    }

    argumentsList = this.truncateArguments(target, argumentsList);

    // This is where we are "counter-wrapping" an argument.
    const optionsBase = Object.seal({
      callable: target,
      trapName: "apply"
    });

    if (targetCylinder.originGraph !== this.graphName) {
      _this = this.membrane.convertArgumentToProxy(
        this,
        argHandler,
        thisArg,
        Object.create(optionsBase, { "isThis": new DataDescriptor(true) })
      );

      for (let i = 0; i < argumentsList.length; i++) {
        let nextArg = argumentsList[i];
        nextArg = this.membrane.convertArgumentToProxy(
          this,
          argHandler,
          nextArg,
          Object.create(optionsBase, { "argIndex": new DataDescriptor(i) })
        );
        args.push(nextArg);
      }
    }
    else {
      _this = thisArg;
      args = argumentsList.slice(0);
    }

    if (mayLog) {
      this.membrane.logger.debug("apply about to call function");
    }

    var rv = Reflect.apply(target, _this, args);

    if (mayLog) {
      this.membrane.logger.debug("apply wrapping return value");
    }

    if (targetCylinder.originGraph !== this.graphName)
      rv = this.membrane.convertArgumentToProxy(
        argHandler,
        this,
        rv
      );

    if (mayLog) {
      this.membrane.logger.debug("apply exiting");
    }
    return rv;
  }

  // ProxyHandler
  construct(shadowTarget, argumentsList, ctorTarget) {
    this.validateTrapAndShadowTarget("construct", shadowTarget);

    var target = getRealTarget(shadowTarget);
    var args = [];
    let targetCylinder  = this.membrane.cylinderMap.get(target);
    let argHandler = this.membrane.getHandlerByName(targetCylinder.originGraph);

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug([
        "construct originGraphs: inbound = ",
        argHandler.graphName,
        ", outbound = ",
        this.graphName
      ].join(""));
    }

    argumentsList = this.truncateArguments(target, argumentsList);

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

    var rv = Reflect.construct(target, args, ctor);

    rv = this.membrane.convertArgumentToProxy(
      argHandler,
      this,
      rv
    );

    if (mayLog) {
      this.membrane.logger.debug("construct exiting");
    }
    return rv;
  }

  /**
   * Ensure the first argument is a known shadow target.
   *
   * @param {String} trapName     The name of the trap to run.
   * @param {Object} shadowTarget The supposed target.
   * @private
   */
  validateTrapAndShadowTarget(trapName, shadowTarget) {
    const target = getRealTarget(shadowTarget);
    const targetCylinder = this.membrane.cylinderMap.get(target);
    if (!(targetCylinder instanceof ProxyCylinder))
      throw new Error("No ProxyCylinder found for shadow target!");

    if (!targetCylinder.isShadowTarget(shadowTarget)) {
      throw new Error(
        "ObjectGraphHandler traps must be called with a shadow target!"
      );
    }
    const disableTrapFlag = `disableTrap(${trapName})`;
    if (targetCylinder.getLocalFlag(this.graphName, disableTrapFlag) ||
        targetCylinder.getLocalFlag(targetCylinder.originGraph, disableTrapFlag))
      throw new Error(`The ${trapName} trap is not executable.`);
  }

  /**
   * Get the shadow target associated with a real value.
   *
   * @private
   */
  getShadowTarget(target) {
    let targetCylinder = this.membrane.cylinderMap.get(target);
    return targetCylinder.getShadowTarget(this.graphName);
  }

  /**
   * Ensure a value has been wrapped in the membrane (and is available for distortions)
   *
   * @param target {Object} The value to wrap.
   *
   * @package
   */
  ensureProxyCylinder(target) {
    if (!this.membrane.hasProxyForValue(this.graphName, target))
      this.membrane.addPartsToCylinder(this, target);
  }

  /**
   * Add a listener for new proxies.
   *
   * @see ProxyNotify
   * @public
   */
  addProxyListener(listener) {
    if (typeof listener != "function")
      throw new Error("listener is not a function!");
    this.__proxyListeners__.add(listener);
  }

  /**
   * Remove a listener for new proxies.
   *
   * @see ProxyNotify
   * @public
   */
  removeProxyListener(listener) {
    if (typeof listener != "function")
      throw new Error("listener is not a function!");
    this.__proxyListeners__.remove(listener);
  }

  /**
   * Get the currently registered set of proxy listeners.
   *
   * @returns {Function[]}
   * @package
   */
  getProxyListeners() {
    return Array.from(this.__proxyListeners__);
  }

  /**
   * @type {function}
   * @public
   *
   */
  get passThroughFilter() {
    return passThroughMap.get(this) || returnFalse;
  }

  /**
   * @param {function} val
   *
   * @public
   */
  set passThroughFilter(val) {
    if (passThroughMap.has(this))
      throw new Error("passThroughFilter has been defined once already!");
    if (typeof val !== "function")
      throw new Error("passThroughFilter must be a function!");
    passThroughMap.set(this, val);
  }

  /**
   * @type {boolean}
   * @public
   */
  get mayReplacePassThrough() {
    return !passThroughMap.has(this);
  }

  /**
   * Set all properties on a shadow target, including prototype, and seal it.
   *
   * @private
   */
  lockShadowTarget(shadowTarget) {
    const target = getRealTarget(shadowTarget);
    const targetCylinder = this.membrane.cylinderMap.get(target);
    const _this = targetCylinder.getOriginal();
    const keys = this.setOwnKeys(shadowTarget);
    keys.forEach(function(propName) {
      if (this.membrane.showGraphName && (propName == "membraneGraphName")) {
        // Special case.
        Reflect.defineProperty(
          shadowTarget, propName, this.graphNameDescriptor
        );
      }
      else
        this.defineLazyGetter(_this, shadowTarget, propName);

      // We want to trigger the lazy getter so that the property can be sealed.
      void(Reflect.get(shadowTarget, propName));
    }, this);

    // fix the prototype;
    const proto = this.getPrototypeOf(shadowTarget);
    assert(Reflect.setPrototypeOf(shadowTarget, proto),
           "Failed to set unwrapped prototype on non-extensible?");
    return Reflect.preventExtensions(shadowTarget);
  }

  /**
   * Specify the list of ownKeys this proxy exposes.
   *
   * @param {Object} shadowTarget The proxy target
   * @private
   *
   * @returns {String[]} The list of exposed keys.
   */
  setOwnKeys(shadowTarget) {
    var target = getRealTarget(shadowTarget);
    var targetCylinder = this.membrane.cylinderMap.get(target);
    var _this = targetCylinder.getOriginal();

    // First, get the underlying object's key list, forming a base.
    var originalKeys = Reflect.ownKeys(_this);

    // Remove duplicated names and keys that have been deleted.
    {
      let mustSkip = new Set();
      targetCylinder.appendDeletedNames(targetCylinder.originGraph, mustSkip);
      targetCylinder.appendDeletedNames(this.graphName, mustSkip);

      let originFilter = targetCylinder.getOwnKeysFilter(targetCylinder.originGraph);
      let localFilter  = targetCylinder.getOwnKeysFilter(this.graphName);

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
    var rv;
    {
      let originExtraKeys = targetCylinder.localOwnKeys(targetCylinder.originGraph);
      let targetExtraKeys = targetCylinder.localOwnKeys(this.graphName);
      let known = new Set(originalKeys);
      let f = function(key) {
        if (known.has(key))
          return false;
        known.add(key);
        return true;
      };
      originExtraKeys = originExtraKeys.filter(f);
      targetExtraKeys = targetExtraKeys.filter(f);
      rv = originalKeys.concat(originExtraKeys, targetExtraKeys);
    }

    if (this.membrane.showGraphName && !rv.includes("membraneGraphName")) {
      rv.push("membraneGraphName");
    }

    // Optimization, storing the generated key list for future retrieval.
    targetCylinder.setCachedOwnKeys(this.graphName, rv, originalKeys);

    {
      /* Give the shadow target any non-configurable keys it needs.
         @see http://www.ecma-international.org/ecma-262/7.0/#sec-proxy-object-internal-methods-and-internal-slots-ownpropertykeys
         This code tries to fix steps 17 and 19.
      */

      // trap == rv, in step 5

      // step 9
      const extensibleTarget = Reflect.isExtensible(shadowTarget);

      // step 10
      let targetKeys = Reflect.ownKeys(shadowTarget);

      // step 12, 13
      let targetConfigurableKeys = [], targetNonconfigurableKeys = [];

      // step 14
      targetKeys.forEach(function(key) {
        let desc = Reflect.getOwnPropertyDescriptor(shadowTarget, key);
        if (desc && !desc.configurable)
          targetNonconfigurableKeys.push(key);
        else
          targetConfigurableKeys.push(key);
      });

      // step 15
      if (extensibleTarget && (targetNonconfigurableKeys.length === 0)) {
        return rv;
      }

      // step 16
      let uncheckedResultKeys = new Set(rv);

      // step 17
      targetNonconfigurableKeys.forEach(function(key) {
        if (!uncheckedResultKeys.has(key)) {
          rv.push(key);
        }
        uncheckedResultKeys.delete(key);
      }, this);

      // step 18
      if (extensibleTarget)
        return rv;

      // step 19
      targetConfigurableKeys.forEach(function(key) {
        if (!uncheckedResultKeys.has(key)) {
          rv.push(key);
        }
        uncheckedResultKeys.delete(key);
      });

      // step 20
      assert(uncheckedResultKeys.size === 0, "all required keys should be applied by now");
    }
    return rv;
  }

  /**
   * Define a "lazy" accessor descriptor which replaces itself with a direct
   * property descriptor when needed.
   *
   * @param {Object}          source       The source object holding a property.
   * @param {Object}          shadowTarget The shadow target for a proxy.
   * @param {String | Symbol} propName     The name of the property to copy.
   *
   * @returns {Boolean} true if the lazy property descriptor was defined.
   *
   * @private
   */
  defineLazyGetter(source, shadowTarget, propName) {
    const handler = this;

    let lockState = "none", lockedValue;
    function setLockedValue(value) {
      /* XXX ajvincent The intent is to mark this accessor descriptor as one
       * that can safely be converted to (new DataDescriptor(value)).
       * Unfortunately, a sealed accessor descriptor has the .configurable
       * property set to false, so we can never replace this getter in that
       * scenario with a data descriptor.  ES7 spec sections 7.3.14
       * (SetIntegrityLevel) and 9.1.6.3 (ValidateAndApplyPropertyDescriptor)
       * force that upon us.
       *
       * I hope that a ECMAScript engine can be written (and a future
       * specification written) that could detect this unbreakable contract and
       * internally convert the accessor descriptor to a data descriptor.  That
       * would be a nice optimization for a "just-in-time" compiler.
       *
       * Simply put:  (1) The only setter for lockedValue is setLockedValue.
       * (2) There are at most only two references to setLockedValue ever, and
       * that only briefly in a recursive chain of proxy creation operations.
       * (3) I go out of our way to ensure all references to the enclosed
       * setLockedValue function go away as soon as possible.  Therefore, (4)
       * when all references to setLockedValue go away, lockedValue is
       * effectively a constant.  (5) lockState can only be set to "finalized"
       * by setLockedState.  (6) the setter for this property has been removed
       * before then.  Therefore, (7) lazyDesc.get() can return only one
       * possible value once lockState has become "finalized", and (8) despite
       * the property descriptor's [[Configurable]] flag being set to false, it
       * is completely safe to convert the property to a data descriptor.
       *
       * Lacking such an automated optimization, it would be nice if a future
       * ECMAScript standard could define
       * Object.lockPropertyDescriptor(obj, propName) which could quickly assert
       * the accessor descriptor really can only generate one value in the
       * future, and then internally do the data conversion.
       */

      // This lockState check should be treated as an assertion.
      if (lockState !== "transient")
        throw new Error("setLockedValue should be callable exactly once!");
      lockedValue = value;
      lockState = "finalized";
    }

    const lazyDesc = {
      get: function() {
        if (lockState === "finalized")
          return lockedValue;
        if (lockState === "transient")
          return handler.membrane.getMembraneProxy(
            handler.graphName, shadowTarget
          ).proxy;

        /* When the shadow target is sealed, desc.configurable is not updated.
         * But the shadow target's properties all get the [[Configurable]] flag
         * removed.  So an attempt to delete the property will fail, which means
         * the assert below will throw.
         * 
         * The tests required only that an exception be thrown.  However,
         * asserts are for internal errors, and in theory can be disabled at any
         * time:  they're not for catching mistakes by the end-user.  That's why
         * I am deliberately throwing an exception here, before the assert call.
         */
        let current = Reflect.getOwnPropertyDescriptor(shadowTarget, propName);
        if (!current.configurable)
          throw new Error("lazy getter descriptor is not configurable -- this is fatal");

        handler.validateTrapAndShadowTarget("defineLazyGetter", shadowTarget);

        const target = getRealTarget(shadowTarget);
        const targetCylinder = handler.membrane.cylinderMap.get(target);

        // sourceDesc is the descriptor we really want
        let sourceDesc = (
          targetCylinder.getLocalDescriptor(handler.graphName, propName) ||
          Reflect.getOwnPropertyDescriptor(source, propName)
        );

        if ((sourceDesc !== undefined) &&
            (targetCylinder.originGraph !== handler.graphName)) {
          let hasUnwrapped = "value" in sourceDesc,
              unwrapped = sourceDesc.value;

          // This is necessary to force desc.value to be wrapped in the membrane.
          let configurable = sourceDesc.configurable;
          sourceDesc.configurable = true;
          sourceDesc = handler.membrane.wrapDescriptor(
            targetCylinder.originGraph, handler.graphName, sourceDesc
          );
          sourceDesc.configurable = configurable;

          if (hasUnwrapped && handler.proxiesInConstruction.has(unwrapped)) {
            /* Ah, nuts.  Somewhere in our stack trace, the unwrapped value has
             * a proxy in this object graph under construction.  That's not
             * supposed to happen very often, but can happen during a recursive
             * Object.seal() or Object.freeze() call.  What that means is that
             * we may not be able to replace the lazy getter (which is an
             * accessor descriptor) with a data descriptor when external code
             * looks up the property on the shadow target.
             */
            handler.proxiesInConstruction.get(unwrapped).push(setLockedValue);
            sourceDesc = lazyDesc;
            delete sourceDesc.set;
            lockState = "transient";
          }
        }

        assert(
          Reflect.deleteProperty(shadowTarget, propName),
          "Couldn't delete original descriptor?"
        );
        assert(
          Reflect.defineProperty(this, propName, sourceDesc),
          "Couldn't redefine shadowTarget with descriptor?"
        );

        // Finally, run the actual getter.
        if (sourceDesc === undefined)
          return undefined;
        if ("get" in sourceDesc)
          return sourceDesc.get.apply(this);
        if ("value" in sourceDesc)
          return sourceDesc.value;
        return undefined;
      },

      set: function(value) {
        handler.validateTrapAndShadowTarget("defineLazyGetter", shadowTarget);

        if (valueType(value) !== "primitive") {
          // Maybe we have to wrap the actual descriptor.
          const target = getRealTarget(shadowTarget);
          const targetCylinder = handler.membrane.cylinderMap.get(target);
          if (targetCylinder.originGraph !== handler.graphName) {
            let originHandler = handler.membrane.getHandlerByName(
              targetCylinder.originGraph
            );
            value = handler.membrane.convertArgumentToProxy(
              originHandler, handler, value
            );
          }
        }

        /* When the shadow target is sealed, desc.configurable is not updated.
         * But the shadow target's properties all get the [[Configurable]] flag
         * removed.  So an attempt to delete the property will fail, which means
         * the assert below will throw.
         * 
         * The tests required only that an exception be thrown.  However,
         * asserts are for internal errors, and in theory can be disabled at any
         * time:  they're not for catching mistakes by the end-user.  That's why
         * I am deliberately throwing an exception here, before the assert call.
         */
        let current = Reflect.getOwnPropertyDescriptor(shadowTarget, propName);
        if (!current.configurable)
          throw new Error("lazy getter descriptor is not configurable -- this is fatal");

        const desc = new DataDescriptor(value, true, current.enumerable, true);

        assert(
          Reflect.deleteProperty(shadowTarget, propName),
          "Couldn't delete original descriptor?"
        );
        assert(
          Reflect.defineProperty(this, propName, desc),
          "Couldn't redefine shadowTarget with descriptor?"
        );

        return value;
      },

      enumerable: true,
      configurable: true,
    };

    {
      handler.membrane.addPartsToCylinder(handler, lazyDesc.get);
      handler.membrane.addPartsToCylinder(handler, lazyDesc.set);
    }

    {
      let current = Reflect.getOwnPropertyDescriptor(source, propName);
      if (current && !current.enumerable)
        lazyDesc.enumerable = false;
    }

    return Reflect.defineProperty(shadowTarget, propName, lazyDesc);
  }

  /**
   * Determine if a target, or any prototype ancestor, has a local-to-the-proxy
   * flag.
   *
   * @argument {Object}  target   The proxy target.
   * @argument {String}  flagName The name of the flag.
   * @argument {Boolean} recurse  True if we should look at prototype ancestors.
   *
   * @returns {Boolean} True if local properties have been requested.
   * @private
   */
  getLocalFlag(target, flagName, recurse) {
    let cylinder = this.membrane.cylinderMap.get(target);
    const originGraph = cylinder.originGraph;

    //eslint-disable-next-line no-constant-condition
    while (true) {
      let shouldBeLocal = cylinder.getLocalFlag(this.graphName, flagName) ||
                          cylinder.getLocalFlag(originGraph, flagName);
      if (shouldBeLocal)
        return true;
      if (!recurse)
        return false;
      let shadowTarget = cylinder.getShadowTarget(this.graphName);

      /* XXX ajvincent I suspect this assertion might fail if
       * this.graphName == map.originGraph:  if the graph represents an original
       * value.
       */
      assert(shadowTarget, "getLocalFlag failed to get a shadow target!");

      let protoTarget = this.getPrototypeOf(shadowTarget);
      if (!protoTarget)
        return false;
      cylinder = this.membrane.cylinderMap.get(protoTarget);
      if (!cylinder)
        return false;
    }
  }

  /**
   * Determine whether this proxy (or one it inherits from) requires local
   * property deletions.
   *
   * @param {Object} target The proxy target.
   *
   * @returns {Boolean} True if deletes should be local.
   * @private
   */
  requiresDeletesBeLocal(target) {
    let protoTarget = target;
    let cylinder = this.membrane.cylinderMap.get(protoTarget);
    const originGraph = cylinder.originGraph;

    //eslint-disable-next-line no-constant-condition
    while (true) {
      let shouldBeLocal = cylinder.getLocalFlag(this.graphName, "requireLocalDelete") ||
                          cylinder.getLocalFlag(originGraph, "requireLocalDelete");
      if (shouldBeLocal)
        return true;
      let shadowTarget = cylinder.getShadowTarget(this.graphName);
      protoTarget = this.getPrototypeOf(shadowTarget);
      if (!protoTarget)
        return false;
      cylinder = this.membrane.cylinderMap.get(protoTarget);
    }
  }

  /**
   * Truncate the argument list, if necessary.
   *
   * @param target        {Function} The method about to be invoked.
   * @param argumentsList {Value[]}  The list of arguments
   *
   * returns {Value[]} a copy of the list of arguments, truncated.
   *
   * @private
   */
  truncateArguments(target, argumentsList) {
    assert(Array.isArray(argumentsList), "argumentsList must be an array!");
    const cylinder = this.membrane.cylinderMap.get(target);

    var originCount = cylinder.getTruncateArgList(cylinder.originGraph);
    if (typeof originCount === "boolean") {
      originCount = originCount ? target.length : Infinity;
    }
    else {
      assert(Number.isInteger(originCount) && (originCount >= 0),
             "must call slice with a non-negative integer length");
    }

    var targetCount = cylinder.getTruncateArgList(this.graphName);
    if (typeof targetCount === "boolean") {
      targetCount = targetCount ? target.length : Infinity;
    }
    else {
      assert(Number.isInteger(targetCount) && (targetCount >= 0),
             "must call slice with a non-negative integer length");
    }

    const count = Math.min(originCount, targetCount);
    return argumentsList.slice(0, count);
  }

  /**
   * Add a revoker function to our list.
   *
   * @param {Function} revoke The revoker.
   * @package
   */
  addRevocable(revoke) {
    this.membrane.revokerMultiMap.set(this, revoke);
  }

  /**
   * Revoke the entire object graph.
   *
   * @public
   */
  revokeEverything() {
    if (this.__isDead__)
      throw new Error("This membrane handler is dead!");
    Object.defineProperty(this, "__isDead__", new NWNCDataDescriptor(true));

    this.membrane.revokerMultiMap.revoke(this);
  }
}

Object.freeze(ObjectGraphHandler);
Object.freeze(ObjectGraphHandler.prototype);
