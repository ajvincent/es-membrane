import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";

import AspectsStubBase from "../AspectsStubBase.mjs";

import ClassInvariantsDecorator, {
  type ClassInvariantsFields,
} from "../decorators/classInvariants.mjs";

const ClassInvariantsStub = MultiMixinBuilder<
  [ClassInvariantsFields],
  typeof AspectsStubBase
>
(
  [ClassInvariantsDecorator], AspectsStubBase
);

export default ClassInvariantsStub;
