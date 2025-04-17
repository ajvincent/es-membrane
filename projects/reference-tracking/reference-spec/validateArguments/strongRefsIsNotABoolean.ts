import "es-search-references-guest";

let success: string | undefined;
try {
  //@ts-expect-error strongReferencesIsNotABoolean
  searchReferences("heldValuesIncludesAPrimitive", {}, [{}, {}], "hi mom");
}
catch (ex) {
  success = (ex as Error).message;
}

report(["strongReferencesIsNotABoolean", success]);
