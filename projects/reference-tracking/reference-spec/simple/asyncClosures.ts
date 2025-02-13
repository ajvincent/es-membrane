const target = { isTarget: true };
const miscellaneous = { isSomeOtherObject: true };

function createEnclosure(
  firstValue: object,
  secondValue: object
): () => object
{
  void(secondValue);
  return async function() {
    await Promise.resolve();
    return firstValue;
  }
}

const targetInEnclosure = createEnclosure(target, miscellaneous);
const targetNotDirectlyHeld = createEnclosure(miscellaneous, target);

searchReferences("targetInAsyncEnclosure", target, [targetInEnclosure], true);
searchReferences("targetNotInAsyncEnclosure", target, [targetNotDirectlyHeld], true);
