const target = { isTarget: true };
const miscellaneous = { isSomeOtherObject: true };

function createEnclosure(
  firstValue: object,
  secondValue: object
): () => object
{
  void(secondValue);
  return function() {
    return firstValue;
  }
}

const targetInEnclosure = createEnclosure(target, miscellaneous);
const targetNotDirectlyHeld = createEnclosure(miscellaneous, target);

searchReferences("targetInEnclosure", target, [targetInEnclosure], true);
searchReferences("targetNotDirectlyHeld", target, [targetNotDirectlyHeld], true);
