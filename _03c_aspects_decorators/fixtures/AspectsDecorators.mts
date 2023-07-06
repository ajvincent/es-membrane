import type {
  NumberStringType
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import AspectsDecorators from "#aspects/decorators/source/AspectsDecorators.mjs";

import type {
  SharedVariablesDictionary
} from "#aspects/decorators/source/types/SharedVariablesDictionary.mjs";

import ClassInvariantsWrapper from "./ClassInvariantsWrapper.mjs";

export type SharedVariablesMap = RightExtendsLeft<SharedVariablesDictionary<NumberStringType>, {
  repeatForward: {
    bar: number;
  },

  repeatBack: object,
}>;

const NST_Aspects = new AspectsDecorators<NumberStringType, SharedVariablesMap>(ClassInvariantsWrapper);
export default NST_Aspects;
