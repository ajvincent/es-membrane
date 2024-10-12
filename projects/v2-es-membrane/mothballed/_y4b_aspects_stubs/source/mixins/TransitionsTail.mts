import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";

import DefineExtraParamsShortDecorator, {
  type DefineExtraParamsShortFields
} from "../decorators/defineExtraParamsShort.mjs";

import TransitionsTailCallDecorator, {
  type TailCallFields
} from "../decorators/tailCall.mjs";

import AspectsStubBase from "../AspectsStubBase.mjs";

const TransitionsTailStub = MultiMixinBuilder<
  [DefineExtraParamsShortFields, TailCallFields],
  typeof AspectsStubBase
>
(
  [DefineExtraParamsShortDecorator, TransitionsTailCallDecorator], AspectsStubBase
);

export default TransitionsTailStub;
