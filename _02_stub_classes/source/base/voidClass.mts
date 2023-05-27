import MultiMixinBuilder from "../../../_01_stage_utilities/source/MultiMixinBuilder.mjs";

import ConfigureStub from "./baseStub.mjs";

import VoidClassDecorator, {
  type VoidClassFields
} from "./decorators/voidClass.mjs";

const VoidClassStub = MultiMixinBuilder<[VoidClassFields], typeof ConfigureStub>
(
  [VoidClassDecorator], ConfigureStub
);

export default VoidClassStub;
