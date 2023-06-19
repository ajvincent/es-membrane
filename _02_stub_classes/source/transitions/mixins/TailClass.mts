import MultiMixinBuilder from "#stage_utilities/source/MultiMixinBuilder.mjs";

import DefineExtraParamsShortDecorator, {
  type DefineExtraParamsShortFields
} from "../decorators/defineExtraParamsShort.mjs";

import TransitionsTailCallDecorator, {
  type TailCallFields
} from "../decorators/tailCall.mjs";

import ConfigureStub from "../../base/ConfigureStub.mjs";

const TransitionsTailStub = MultiMixinBuilder<
  [DefineExtraParamsShortFields, TailCallFields],
  typeof ConfigureStub
>
(
  [DefineExtraParamsShortDecorator, TransitionsTailCallDecorator], ConfigureStub
);

export default TransitionsTailStub;
