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
