function assert(mustBeTrue, errMsg) {
  if (!mustBeTrue) {
    debugger;
    throw new Error("AssertionError: " + errMsg);
  }
}
