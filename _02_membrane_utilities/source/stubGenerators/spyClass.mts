import path from "path";
import url from "url";

import type {
  ReadonlyDeep,
} from "type-fest";

import BaseStub, {
  type MethodDictionary,
  type MethodStructure,
} from "./base.mjs";

const stageDir = path.normalize(path.join(
  url.fileURLToPath(import.meta.url), "../../.."
));
const projectDir = path.dirname(stageDir);

const SpyBasePath = path.join(
  projectDir, "_01_stage_utilities/source/SpyBase.mjs"
);

export default
class SpyClassStub extends BaseStub
{
  constructor(
    pathToFile: string,
    className: string,
    extendsAndImplements: string,
    methods: ReadonlyDeep<MethodDictionary>,
    interrupts: ReadonlyArray<string> = ["(all)"],
  )
  {
    if (!interrupts.includes("(all)"))
      throw new Error(`interrupts for the spy class must include "(all)"!`);

    super(
      pathToFile,
      className,
      extendsAndImplements,
      methods,
      interrupts,
    );

    this.addImport(SpyBasePath, "SpyBase", true);
  }

  protected methodTrap(
    methodName: string,
    isBefore: boolean,
  ) : void
  {
    if ((methodName !== "(all)") || !isBefore)
      return;

    this.classWriter.writeLine(
      `readonly #spyClass = new SpyBase;`
    );
    this.classWriter.newLine();
  }

  protected buildMethodBody(
    methodName: string,
    structure: MethodStructure,
  ): void
  {
    this.classWriter.writeLine(
      `this.#spyClass.getSpy("${methodName}")(${structure.args.map(arg => arg.key).join(", ")});`
    );
  }
}
