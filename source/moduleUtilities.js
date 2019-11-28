function valueType(value) {
  if (value === null)
    return "primitive";
  const type = typeof value;
  if ((type != "function") && (type != "object"))
    return "primitive";
  return type;
}

function stringifyArg(arg) {
  if (arg === null)
    return "null";
  if (arg === undefined)
    return "undefined";
  if (Array.isArray(arg))
    return "[" + arg.map(stringifyArg).join(", ") + "]";

  let type = valueType(arg);
  if (type == "primitive")
    return arg.toString();
  if (type == "function")
    return "()";
  return "{}";
}

function WeakMapOfProxyMappings(map) {
  Reflect.defineProperty(
    map, "delete", new NWNCDataDescriptor(WeakMapOfProxyMappings.delete)
  );
  Reflect.defineProperty(
    map,
    "set",
    new NWNCDataDescriptor(WeakMapOfProxyMappings.set.bind(map, map.set))
  );
  Reflect.defineProperty(
    map,
    "revoke",
    new NWNCDataDescriptor(WeakMapOfProxyMappings.revoke)
  );
}
WeakMapOfProxyMappings.Dead = Symbol("dead map entry");

WeakMapOfProxyMappings.delete = function() {
  throw new Error("delete not allowed on WeakMapOfProxyMappings");
};

WeakMapOfProxyMappings.set = function(_set, key, value) {
  if (value !== WeakMapOfProxyMappings.Dead) {
    const current = this.get(key);
    if (current === WeakMapOfProxyMappings.Dead)
      throw new Error("WeakMapOfProxyMappings says this key is dead");
    else if (!(value instanceof ProxyMapping))
      throw new Error("WeakMapOfProxyMappings only allows values of .Dead or ProxyMapping");
    if ((current !== undefined) && (current !== value))
      throw new Error("WeakMapOfProxyMappings already has a value for this key");
  }
  return _set.apply(this, [key, value]);
};

WeakMapOfProxyMappings.revoke = function(key) {
  this.set(key, WeakMapOfProxyMappings.Dead);
};

Object.freeze(WeakMapOfProxyMappings);

/**
 * @deprecated
 */
function inGraphHandler(trapName, callback) {
  return callback;
  /* This seemed like a good idea at the time.  I wanted to know
     when the membrane was executing internal code or not.  But practically
     speaking, it's useless...

  return function() {
    if (this.__isDead__)
      throw new Error("This membrane handler is dead!");
    var msg;

    let mayLog = this.membrane.__mayLog__();

    this.membrane.handlerStack.unshift(trapName);
    if (mayLog) {
      msg = trapName + "(";
      for (let i = 0; i < arguments.length; i++) {
        let arg = arguments[i];
        msg += stringifyArg(arg) + ", ";
      }
      if (arguments.length)
        msg = msg.substr(0, msg.length - 2);
      msg += ")";

      this.membrane.logger.info(
        msg + " inGraphHandler++"
      );
    }

    var rv;
    try {
      rv = callback.apply(this, arguments);
    }

    // We might have a catch block here to wrap exceptions crossing the membrane.

    finally {
      this.membrane.handlerStack.shift();
      if (mayLog) {
        msg += " returned " + stringifyArg(rv);
        this.membrane.logger.info(
          msg + " inGraphHandler--"
        );
      }
    }

    return rv;
  };
  //*/
}

const NOT_YET_DETERMINED = {};
Object.defineProperty(
  NOT_YET_DETERMINED,
  "not_yet_determined",
  new DataDescriptor(true)
);

function makeRevokeDeleteRefs(parts, mapping, field) {
  let oldRevoke = parts.revoke;
  if (!oldRevoke)
    return;

  // necessary: in OverriddenProxyParts, revoke is inherited and read-only.
  Reflect.defineProperty(parts, "revoke", new DataDescriptor(function() {
    oldRevoke.apply(parts);
    mapping.remove(field);
  }, true));
}

/**
 * Helper function to determine if anyone may log.
 * @private
 *
 * @returns {Boolean} True if logging is permitted.
 */
// This function is here because I can blacklist moduleUtilities during debugging.
function MembraneMayLog() {
  return (typeof this.logger == "object") && Boolean(this.logger);
}

function AssertIsPropertyKey(propName) {
  var type = typeof propName;
  if ((type != "string") && (type != "symbol"))
    throw new Error("propName is not a symbol or a string!");
  return true;
}

const Constants = {
  warnings: {
    FILTERED_KEYS_WITHOUT_LOCAL: "Filtering own keys without allowing local property defines or deletes is dangerous",
    PROTOTYPE_FILTER_MISSING: "Proxy filter specified to inherit from prototype, but prototype provides no filter",
  }
};

Object.freeze(Constants.warnings);
Object.freeze(Constants);
