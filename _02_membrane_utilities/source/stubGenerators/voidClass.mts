import type {
  ReadonlyDeep,
} from "type-fest";

import BaseStub, {
  type MethodDictionary,
  type MethodStructure,
} from "./base.mjs";

export default
class VoidClassStub extends BaseStub
{
  constructor(
    pathToFile: string,
    className: string,
    extendsAndImplements: string,
    methods: ReadonlyDeep<MethodDictionary>,
    interrupts: ReadonlyArray<string> = []
  )
  {
    if (!/\bVoidMethodsOnly</.test(extendsAndImplements)) {
      throw new Error("You must implement VoidMethodsOnly<T>!");
    }
    super(pathToFile, className, extendsAndImplements, methods, interrupts);
  }

  protected buildMethodBody(
    methodName: string,
    structure: MethodStructure,
  ): void
  {
    structure.args.forEach(arg => this.classWriter.writeLine(`void(${arg.key});`));
  }
}
