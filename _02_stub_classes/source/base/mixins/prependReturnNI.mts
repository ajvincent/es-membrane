import MultiMixinBuilder from "#stage_utilities/source/MultiMixinBuilder.mjs";

import ConfigureStub from "../ConfigureStub.mjs";

import PrependReturnDecorator, {
  type PrependReturnFields
} from "../decorators/prependReturn.mjs";

import NotImplementedDecorator, {
  type NotImplementedFields
} from "../decorators/notImplemented.mjs";

const PrependReturnNIStub = MultiMixinBuilder<
  [NotImplementedFields, PrependReturnFields, ], typeof ConfigureStub
>
(
  [NotImplementedDecorator, PrependReturnDecorator, ], ConfigureStub
);

export default PrependReturnNIStub;
