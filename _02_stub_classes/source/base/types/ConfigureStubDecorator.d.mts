import type {
  StaticAndInstance
} from "#stage_utilities/source/types/StaticAndInstance.mjs";

import type {
  SubclassDecorator,
} from "#stage_utilities/source/types/SubclassDecorator.mjs";

import ConfigureStub from "../ConfigureStub.mjs";

export type ConfigureStubDecorator<
  Added extends StaticAndInstance,
  Arguments extends any[] | false
> = SubclassDecorator<typeof ConfigureStub, Added, Arguments>;
