import "es-search-references/guest";

const target = { isTarget: true };
const returnTarget = () => target;

searchReferences("return target", target, [returnTarget], true);
