const CodeMirrorManager = {
  setInitialState: function() {
    TestDriver.setLockStatus(this.lockSymbol, true);
  }
};

{
  Reflect.defineProperty(CodeMirrorManager, "lockSymbol", {
    value: Symbol("graphNames"),
    writable: false,
    enumerable: false,
    configurable: false
  });
}
