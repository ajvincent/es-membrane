import SourceContentsBase, {
  type MethodStructure,
} from "./base.mjs";

export default
class NotImplementedContents extends SourceContentsBase
{
  protected buildMethodBody(
    methodName: string,
    structure: MethodStructure,
  ): void
  {
    void(methodName);
    structure.args.forEach(arg => this.classWriter.writeLine(`void(${arg.key});`));
    this.classWriter.writeLine(`throw new Error("not yet implemented");`);
  }
}
