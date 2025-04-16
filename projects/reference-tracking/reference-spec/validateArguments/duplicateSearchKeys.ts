let success: string | undefined;

searchReferences("duplicateSearchKeys", {}, [{}, {}], true);

try {
  searchReferences("duplicateSearchKeys", {}, [{}, {}], true);
}
catch (ex) {
  success = (ex as Error).message;
}

report(["duplicateSearchKeys", success]);
