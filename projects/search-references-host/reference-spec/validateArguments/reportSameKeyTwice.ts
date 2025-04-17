report(["key", true]);

try {
  report(["key", false]);
}
catch (ex) {
  report(["sameKeyTwice", (ex as Error).message]);
}
