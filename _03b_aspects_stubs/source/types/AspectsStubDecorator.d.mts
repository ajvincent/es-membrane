import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import type {
  SubclassDecorator,
} from "#mixin_decorators/source/types/SubclassDecorator.mjs";

import AspectsStub from "../AspectsStubBase.mjs";

export type AspectsStubDecorator<
  Added extends StaticAndInstance,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Arguments extends any[] | false
> = SubclassDecorator<typeof AspectsStub, Added, Arguments>;
