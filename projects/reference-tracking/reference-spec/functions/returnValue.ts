const target = { isTarget: true };

function returnTarget() {
  return target;
}

searchReferences("return target", target, [returnTarget], true);
