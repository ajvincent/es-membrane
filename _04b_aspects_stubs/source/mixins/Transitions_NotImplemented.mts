import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";

import DefineExtraParamsShortDecorator, {
  type DefineExtraParamsShortFields
} from "../decorators/defineExtraParamsShort.mjs";

import NotImplementedDecorator, {
  type NotImplementedFields
} from "../decorators/notImplemented.mjs";

import AspectsStubBase from "../AspectsStubBase.mjs";

const Transitions_NotImplemented = MultiMixinBuilder<
  [DefineExtraParamsShortFields, NotImplementedFields],
  typeof AspectsStubBase
>
(
  [DefineExtraParamsShortDecorator, NotImplementedDecorator], AspectsStubBase
);

export default Transitions_NotImplemented;
