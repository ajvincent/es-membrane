try {
  report([0, false]);
}
catch (ex) {
  report(["keyIsNumber", (ex as Error).message]);
}
