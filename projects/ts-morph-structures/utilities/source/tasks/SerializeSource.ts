import {
  parentPort
} from "worker_threads";

import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  type ProjectOptions,
  ScriptTarget,
  SourceFileStructure,
} from "ts-morph";

import {
  SerializeRequest,
  SerializeResponse,
} from "../_types/SerializeSourceMessages.js";

const TSC_CONFIG: ProjectOptions = {
  "compilerOptions": {
    "lib": ["es2022"],
    "module": ModuleKind.ESNext,
    "target": ScriptTarget.ESNext,
    "moduleResolution": ModuleResolutionKind.NodeNext,
    "sourceMap": false,
    "declaration": false,
    "inlineSourceMap": false,
  },
  skipAddingFilesFromTsConfig: true,
  skipFileDependencyResolution: true,
  useInMemoryFileSystem: true,
};

const project = new Project(TSC_CONFIG);

async function serializeSource_child(
  absolutePathToFile: string,
  structure: SourceFileStructure
): Promise<string>
{
  const sourceFile = project.createSourceFile(absolutePathToFile, structure);
  await sourceFile.save();
  const source = await project.getFileSystem().readFile(absolutePathToFile, "utf-8");
  await sourceFile.deleteImmediately();
  return source;
}

async function processRequest(
  message: SerializeRequest
): Promise<void>
{
  try {
    const source = await serializeSource_child(
      message.absolutePathToFile,
      message.structure
    );

    const response: SerializeResponse = {
      command: message.command,
      token: message.token,
      isResponse: true,
      success: true,
      source
    };

    parentPort!.postMessage(response);
  }
  catch (ex) {
    const response: SerializeResponse = {
      command: message.command,
      token: message.token,
      isResponse: true,
      success: false,
      error: ex
    };

    parentPort!.postMessage(response);
  }
}

parentPort!.on("message", (message: SerializeRequest): void => {
  void(processRequest(message));
});
