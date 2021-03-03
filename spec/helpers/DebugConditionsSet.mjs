export default class DebugConditionsSet {
  constructor(keys) {
    this.cache = keys;
    this.reset();
  }

  reset() {
    this.keys = new Set(this.cache);
  }

  found(key) {
    this.keys.delete(key);
    if (this.keys.size === 0) {
      //eslint-disable-next-line no-debugger
      debugger;
    }
  }
}
