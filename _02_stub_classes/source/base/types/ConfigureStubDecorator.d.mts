import type {
  StaticAndInstance
} from "#stage_utilities/source/types/StaticAndInstance.mjs";

import type {
  SubclassDecorator,
} from "#stage_utilities/source/types/SubclassDecorator.mjs";

import ConfigureStub from "../baseStub.mjs";

export type ConfigureStubDecorator<Added extends StaticAndInstance> =
  SubclassDecorator<typeof ConfigureStub, Added, false>;
