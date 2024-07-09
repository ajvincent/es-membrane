import path from "path";
import { TYPESCRIPT_LIB_SOURCEFILES } from "./fromTypeScriptLib.js";
import {
  InterfaceDeclarationImpl,
  VoidTypeNodeToTypeStructureConsole,
  getTypeAugmentedStructure,
} from "ts-morph-structures";

export default function getReflectInterface(): InterfaceDeclarationImpl {
  const ReflectLibFile = TYPESCRIPT_LIB_SOURCEFILES.find(sourceFile => {
    const absolutePath = sourceFile.getFilePath();
    return path.basename(absolutePath) === "lib.es2015.reflect.d.ts";
  })!;

  const ReflectSource = getTypeAugmentedStructure(ReflectLibFile, VoidTypeNodeToTypeStructureConsole, true).rootStructure;
  console.log(JSON.stringify(ReflectSource, null, 2));
  throw new Error("Reflect is a namespace, not an interface");
}
