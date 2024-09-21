import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";

import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

import AspectsStubBase from "../AspectsStubBase.mjs";

import AddMethodDecorators_Decorator, {
  type MethodDecoratorsFields,
} from "../decorators/methodDecorators.mjs";

const AddMethodDecoratorsStub = MultiMixinBuilder<
  [MethodDecoratorsFields<MethodsOnlyType>],
  typeof AspectsStubBase
>
(
  [AddMethodDecorators_Decorator], AspectsStubBase
);

export default AddMethodDecoratorsStub;
