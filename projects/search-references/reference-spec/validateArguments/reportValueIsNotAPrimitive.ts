try {
  report(["foo", { foo: true }]);
}
catch (ex) {
  report(["valueIsNotAPrimitive", (ex as Error).message]);
}
