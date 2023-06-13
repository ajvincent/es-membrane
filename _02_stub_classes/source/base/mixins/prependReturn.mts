import MultiMixinBuilder from "#stage_utilities/source/MultiMixinBuilder.mjs";

import ConfigureStub from "../ConfigureStub.mjs";

import PrependReturnDecorator, {
  type PrependReturnFields
} from "../decorators/prependReturn.mjs";

import VoidClassDecorator, {
  type VoidClassFields
} from "../decorators/voidClass.mjs";

const PrependReturnStub = MultiMixinBuilder<[PrependReturnFields, VoidClassFields], typeof ConfigureStub>(
  [PrependReturnDecorator, VoidClassDecorator], ConfigureStub
);

export default PrependReturnStub;
