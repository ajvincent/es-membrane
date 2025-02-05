let success = false;
try {
  // @ts-expect-error not enough arguments
  searchReferences()
}
catch {
  success = true;
}

if (!success) {
  throw new Error("failed on searchReferences();");
}
