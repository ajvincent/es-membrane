// #region preamble
import getRequiredInitializers from "#stage_utilities/source/RequiredInitializers.mjs";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#stage_utilities/source/types/StaticAndInstance.mjs";

import type {
  ConfigureStubDecorator
} from "../types/ConfigureStubDecorator.mjs";

import type {
  ExtendsAndImplements
} from "../ConfigureStub.mjs";

import type {
  TS_Method
} from "../../types/export-types.mjs";

import addBaseTypeImport from "../utilities/addBaseTypeImport.mjs";
import { OptionalKind, ParameterDeclarationStructure } from "ts-morph";

// #endregion preamble

export type NotImplementedFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: {
    setNotImplementedOnly(useNever: boolean) : void;
  },
}>

const NotImplementedDecorator: ConfigureStubDecorator<NotImplementedFields, false> = function(
  this: void,
  baseClass
)
{
  return class NotImplemented extends baseClass {
    static readonly #INIT_KEY = "(not implemented subclass)";

    #useNever = false;

    constructor(...args: unknown[]) {
      super(...args);
      getRequiredInitializers(this).add(NotImplemented.#INIT_KEY);
    }

    setNotImplementedOnly(useNever: boolean) : void
    {
      getRequiredInitializers(this).mayResolve(NotImplemented.#INIT_KEY);
      this.#useNever = useNever;
      getRequiredInitializers(this).resolve(NotImplemented.#INIT_KEY);
    }

    protected getExtendsAndImplementsTrap(context: Map<symbol, unknown>): ExtendsAndImplements
    {
      const inner = super.getExtendsAndImplementsTrap(context);

      return {
        extends: inner.extends,
        implements: inner.implements.map(value =>
          this.#useNever ? `NotImplementedOnly<${value}>` : value
        ),
      };
    }

    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean,
    ) : void
    {
      super.methodTrap(methodStructure, isBefore);

      if (!this.#useNever || !isBefore)
        return;

      if (!methodStructure) {
        addBaseTypeImport(
          this, "NotImplementedOnly.mjs", "NotImplementedOnly"
        );
        return;
      }
  
      methodStructure.returnType = "never";
    }
  
    protected buildMethodBodyTrap(
      methodStructure: TS_Method,
      remainingArgs: Set<OptionalKind<ParameterDeclarationStructure>>,
    ): void
    {
      this.voidArguments(remainingArgs);
      super.buildMethodBodyTrap(methodStructure, remainingArgs);

      this.classWriter.writeLine(`throw new Error("not yet implemented");`);
    }
  }
}

export default NotImplementedDecorator;
