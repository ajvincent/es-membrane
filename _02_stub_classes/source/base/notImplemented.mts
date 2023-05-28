import MultiMixinBuilder from "#stage_utilities/source/MultiMixinBuilder.mjs";

import NotImplementedDecorator, {
  type NotImplementedFields
} from "./decorators/notImplemented.mjs";

import ConfigureStub from "./baseStub.mjs";

const NotImplementedStub = MultiMixinBuilder<[NotImplementedFields], typeof ConfigureStub>(
  [NotImplementedDecorator], ConfigureStub
);

export default NotImplementedStub;
