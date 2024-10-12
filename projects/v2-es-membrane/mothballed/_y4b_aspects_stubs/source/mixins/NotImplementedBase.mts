import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";

import NotImplementedDecorator, {
  type NotImplementedFields
} from "../decorators/notImplemented.mjs";

import AspectsStubBase from "../AspectsStubBase.mjs";

const NotImplementedBaseStub = MultiMixinBuilder<
  [NotImplementedFields],
  typeof AspectsStubBase
>
(
  [NotImplementedDecorator], AspectsStubBase
);

export default NotImplementedBaseStub;
