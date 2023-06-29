import type {
  NumberStringType
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import AspectsDecorators from "#aspects/decorators/source/AspectsDecorators.mjs";

import type {
  BodyTrapTypesBase
} from "#aspects/decorators/source/types/BodyTrapTypesBase.mjs";

export type BodyTrapTypes = RightExtendsLeft<BodyTrapTypesBase<NumberStringType>, {
  repeatForward: {
    bar: number;
  },

  repeatBack: object,
}>;

const NST_Aspects = new AspectsDecorators<NumberStringType, BodyTrapTypes>;
export default NST_Aspects;
