import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import AspectsStubBase from "../AspectsStubBase.mjs";

import AddMethodDecorators_Decorator, {
  type MethodDecoratorsFields,
} from "../decorators/methodDecorators.mjs";

import type {
  MethodsOnlyType
} from "../types/MethodsOnlyType.mjs";

const AddMethodDecoratorsStub = MultiMixinBuilder<
  [MethodDecoratorsFields<MethodsOnlyType>],
  typeof AspectsStubBase
>
(
  [AddMethodDecorators_Decorator], AspectsStubBase
);

export default AddMethodDecoratorsStub;
