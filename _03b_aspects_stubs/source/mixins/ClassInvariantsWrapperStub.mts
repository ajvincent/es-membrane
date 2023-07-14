import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";

import AspectsStubBase from "../AspectsStubBase.mjs";

import ImplementSharedAssertsDecorator, {
  type ImplementSharedAssertsFields
} from "../decorators/implementSharedAssert.mjs";

import ClassInvariantsDecorator, {
  type ClassInvariantsFields,
} from "../decorators/classInvariants.mjs";

const ClassInvariantsStub = MultiMixinBuilder<
  [ImplementSharedAssertsFields, ClassInvariantsFields],
  typeof AspectsStubBase
>
(
  [ImplementSharedAssertsDecorator, ClassInvariantsDecorator], AspectsStubBase
);

export default ClassInvariantsStub;
