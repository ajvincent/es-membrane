import "es-search-references/guest";

const target = {};
if (typeof print === "function")
  searchReferences("pass", target, [target], true);
else
  searchReferences("pass", target, [], true);
