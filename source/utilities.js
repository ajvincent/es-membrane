function NOT_IMPLEMENTED() {
  throw new Error("Not implemented!");
}

function DataDescriptor(value, writable = false, enumerable = true, configurable = true) {
  this.value = value;
  this.writable = writable;
  this.enumerable = enumerable;
  this.configurable = configurable;
}

function AccessorDescriptor(getter, setter, enumerable = true, configurable = true) {
  this.get = getter;
  this.set = setter;
  this.enumerable = enumerable;
  this.configurable = configurable;
}

const NOT_IMPLEMENTED_DESC = new AccessorDescriptor(
  NOT_IMPLEMENTED,
  NOT_IMPLEMENTED
);

function isDataDescriptor(desc) {
  if (typeof desc === "undefined")
    return false;
  if (!("value" in desc) && !("writable" in desc))
    return false;
  return true;
}

function isAccessorDescriptor(desc) {
  if (typeof desc === "undefined")
    return false;
  if (!("get" in desc) && !("set" in desc))
    return false;
  return true;
}

function valueType(value) {
  if (value === null)
    return "primitive";
  const type = typeof value;
  if ((type != "function") && (type != "object"))
    return "primitive";
  return type;
}

function inGraphHandler(trapName, callback) {
  return function() {
    this.membrane.handlerDepth++;

    if (typeof this.logger == "object") {
      this.logger.trace(trapName + " inGraphHandler++", this.membrane.handlerDepth);
    }

    var rv;
    try {
      rv = callback.apply(this, arguments);
    }

    // We might have a catch block here to wrap exceptions crossing the membrane.

    finally {
      this.membrane.handlerDepth--;
      if (typeof this.logger == "object") {
        this.logger.trace(trapName + " inGraphHandler--", this.membrane.handlerDepth);
      }
    }

    return rv;
  };
}

const NOT_YET_DETERMINED = {};
Object.defineProperty(
  NOT_YET_DETERMINED,
  "not_yet_determined",
  new DataDescriptor(true)
);
