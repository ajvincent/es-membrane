import "es-search-references/guest";

const target = {};
if (typeof print === "function") {
  print("before the search");
  searchReferences("pass", target, [target], true);
  print("after the search");
}
else
  searchReferences("pass", target, [], true);
