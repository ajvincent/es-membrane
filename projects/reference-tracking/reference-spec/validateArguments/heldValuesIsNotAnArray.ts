let success: string | undefined;
try {
  //@ts-expect-error heldValues is not an array
  searchReferences("heldValuesNotAnArray", {}, {}, true)
}
catch (ex) {
  success = (ex as Error).message;
}

report(["heldValuesNotAnArray", success]);
