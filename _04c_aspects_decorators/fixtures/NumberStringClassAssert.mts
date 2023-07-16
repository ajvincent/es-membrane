import NumberStringClass from "#stage_utilities/fixtures/NumberStringClass.mjs";

import type {
  AssertInterface
} from "#stage_utilities/source/types/assert.mjs";

export default class NumberStringClassAssert
extends NumberStringClass
implements AssertInterface
{
  assert(condition: boolean, message: string): void
  {
    if (!condition)
      throw new Error(message);
  }
}
