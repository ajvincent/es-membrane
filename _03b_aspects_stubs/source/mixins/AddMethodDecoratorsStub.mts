import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import AspectsStubBase from "../AspectsStubBase.mjs";

import AddMethodDecorators_Decorator, {
  type MethodDecoratorsFields
} from "../decorators/methodDecorators.mjs";

const AddMethodDecoratorsStub = MultiMixinBuilder<[MethodDecoratorsFields<object>], typeof AspectsStubBase>(
  [AddMethodDecorators_Decorator], AspectsStubBase
);

export default AddMethodDecoratorsStub;
