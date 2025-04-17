import "es-search-references-guest";

let success: string | undefined;
try {
  //@ts-expect-error heldValues is not an array
  searchReferences("heldValuesIncludesAPrimitive", {}, [{}, true, {}], true)
}
catch (ex) {
  success = (ex as Error).message;
}

report(["heldValuesIncludesAPrimitive", success]);
