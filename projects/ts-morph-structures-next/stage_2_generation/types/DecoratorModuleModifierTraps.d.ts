import type {
  MemberedTypeToClass,
} from "#stage_one/snapshot/source/exports.js";

import type {
  DecoratorModule
} from "../moduleClasses/DecoratorModule.ts";

export interface DecoratorModuleModifierTraps {
  modifyTypeToClassBeforeBuild?(
    module: DecoratorModule,
    typeToClass: MemberedTypeToClass
  ): void;

  postProcessClassMembers?(
    module: DecoratorModule
  ): void;
}
