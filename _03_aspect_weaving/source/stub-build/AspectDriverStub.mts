import MultiMixinBuilder from "#stage_utilities/source/MultiMixinBuilder.mjs";

import AspectDriverDecorator, {
  type AspectDriverFields
} from "../stub-decorators/AspectDriver.mjs";

import ConfigureStub from "#stub_classes/source/base/baseStub.mjs";

const AspectDriverStub = MultiMixinBuilder<[AspectDriverFields], typeof ConfigureStub>(
  [AspectDriverDecorator], ConfigureStub
);

export default AspectDriverStub;
