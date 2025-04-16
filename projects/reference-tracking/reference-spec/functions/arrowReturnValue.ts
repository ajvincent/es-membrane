const target = { isTarget: true };
const returnTarget = () => target;

searchReferences("return target", target, [returnTarget], true);
