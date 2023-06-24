import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import type {
  SubclassDecorator,
} from "#mixin_decorators/source/types/SubclassDecorator.mjs";

import AspectsStubBase from "../AspectsStubBase.mjs";

export type AspectsStubDecorator<
  Added extends StaticAndInstance,
> = SubclassDecorator<typeof AspectsStubBase, Added, false>;
