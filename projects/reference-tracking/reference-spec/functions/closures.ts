const target = { isTarget: true };
const miscellaneous = { isSomeOtherObject: true };

function createShallowEnclosure(
  firstValue: object,
  secondValue: object
): () => object
{
  return function() {
    void(secondValue);
    return firstValue;
  }
}

const oneLevelDeepEnclosure = createShallowEnclosure(miscellaneous, target);
searchReferences("targetNotDirectlyHeld", target, [oneLevelDeepEnclosure], true);

function createDeepEnclosure(
  firstValue: object,
  secondValue: object
): () => () => object
{
  return function() {
    return function() {
      void(secondValue);
      return firstValue;
    }
  }
}

const outerEnclosure = createDeepEnclosure(miscellaneous, target);
searchReferences("outerEnclosure", target, [outerEnclosure], true);

const innerEnclosure = outerEnclosure();
searchReferences("innerEnclosure", target, [innerEnclosure], true);
