import {
  SourceFile,
  NamedNode,
  Structure,
  StructureKind,
  type InterfaceDeclarationStructure,
  type TypeAliasDeclarationStructure,
  type InterfaceDeclaration,
  type TypeAliasDeclaration,
  type PropertySignatureStructure,
  TypeElementMemberedNodeStructure,
} from "ts-morph";

import {
  typeArrayFromAlias,
  typeArrayFromInterface,
  resolveCodeBlock,
} from "./typeArrayFromNode.js";

import {
  DefaultMap
} from "#utilities/source/DefaultMap.js";

import AwaitedMap from "#utilities/source/AwaitedMap.js";
//TODO: replace this with the DependencyTracker from #utilities
import DependencyTracker from "./DependencyTracker.js";

import typeFile from "#utilities/source/ts-morph-d-file.js";

type StructuresInUse = (
  InterfaceDeclarationStructure |
  TypeAliasDeclarationStructure
);

type NamedNodeInUse<S extends StructuresInUse> = NamedNode & { getStructure: () => S };

/**
 * Do we care about the kind property of these structures?
 */
type PropertyWithoutKind = Omit<PropertySignatureStructure, "kind">;

type PropertyArray = readonly PropertyWithoutKind[];

export default
abstract class TypeWithDependencies<
  S extends StructuresInUse,
  N extends NamedNodeInUse<S>
>
{
  static readonly #collection = new Map<
    string,
    TypeWithDependencies<StructuresInUse, NamedNodeInUse<StructuresInUse>>
  >;
  static readonly collection: ReadonlyMap<
    string,
    TypeWithDependencies<StructuresInUse, NamedNodeInUse<StructuresInUse>>
  > = this.#collection;

  /**
   * Extending each TypeElementMemberedNodeStructure with the interface it came from.
   * @param name - the interface name.
   * @param property - the structure.
   */
  static #defineFromPropertyOnType(
    this: void,
    s: TypeElementMemberedNodeStructure,
    name: string
  ) : void
  {
    if (!s.properties)
      return;
    const desc = {
      value: name,
      enumerable: true,
      writable: false,
      configurable: false,
    };

    s.properties.forEach(
      c => Reflect.defineProperty(c, "fromTypeDefinition", desc)
    );
  }

  static #startedRun = false;

  /**
   * Build a map of structure interfaces to all their inherited properties.
   *
   * @remarks
   *
   * You may ask, "why is this async when all the objects are here?"
   * The reason is looking up inherited properties of one interface requires
   * waiting for the interface's `extends` interfaces to resolve.
   *
   * Sure, this could be done synchronously, if we sorted the entries where
   * dependencies come first.  This is so fast, though, that it doesn't matter.
   */
  static async run(): Promise<Map<string, PropertyArray>>
  {
    if (this.#startedRun) {
      throw new Error("Run has already started");
    }

    this.#startedRun = true;

    // initial data
    {
      const typeAliasList = TypeAliasToUnion.addNodes(typeFile);
      InterfaceWithDependencies.addNodes(typeFile, typeAliasList.slice());
    }

    const allStructureNames = Array.from(this.#collection.keys());
    const allPropsPromisesMap = new AwaitedMap<string, PropertyArray>;
    const extendsDependencies = new DependencyTracker(allStructureNames);

    this.#collection.forEach(((typeWithDeps, name) => allPropsPromisesMap.set(
      name,
      typeWithDeps.#getAllPropertiesOuter(
        extendsDependencies,
        allPropsPromisesMap,
      )
    )));

    // Build our final list of map entries via the await!
    {
      const allPropsMapEntries = Array.from(
        (await allPropsPromisesMap.allResolved())
      .entries());
      allPropsMapEntries.sort(TypeWithDependencies.#EntriesSorter);

      return new Map(allPropsMapEntries);
    }
  }

  static #EntriesSorter<T>(
    this: void,
    a: [string, T],
    b: [string, T]
  ) : -1 | 0 | 1
  {
    if (a[0] < b[0])
      return -1;
    if (a[0] > b[0])
      return +1;
    return 0;
  }

  static buildMarkdownSource() : string {
    const typesWithDeps = Array.from(this.#collection.values());
    typesWithDeps.sort(({structure: a}, {structure: b}) => {
      if (a.name < b.name)
        return -1;
      if (a.name > b.name)
        return +1;
      return 0;
    });
    const toc = typesWithDeps.map(typeWithDep => typeWithDep.getMarkdownTOCLink())
    const contents = typesWithDeps.map(typeWithDep => typeWithDep.getMarkdown());

    return `
# ts-morph Structures Reference

## Table of contents

${toc.join("\n")}

## Structures in ts-morph

${contents.join("\n")}
    `.trim() + "\n";
  }

  static buildHTMLSource() : string {
    const typesWithDeps = Array.from(this.#collection.values());
    typesWithDeps.sort(({structure: a}, {structure: b}) => {
      if (a.name < b.name)
        return -1;
      if (a.name > b.name)
        return +1;
      return 0;
    })
    const contents = typesWithDeps.map(typeWithDep => typeWithDep.getHTML());

    return `
<!DOCTYPE html>
<html>
<head>
<title>Structures Reference</title>
<meta charset="utf-8">
<style type="text/css"><!--
body {
  overflow-y: hidden;
}

.container {
  display: grid;
  grid-template-columns: min-content auto;
  column-gap: 10px;
  height: 98vh;
}

.header {
  grid-column-start: 1;
  grid-column-end: 3;
}

.sidebar, .body {
  overflow-y: scroll;
}

.sidebar {
  font-size: 10px;
  padding-left: 0px;
  list-style-type: none;
}
--></style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Reference</h1>
    <h2>Structures</h2>
  </div>
  <ul class="sidebar">
${
  typesWithDeps.map(typesWithDep => `<li>${this.buildHTMLLink(typesWithDep.structure.name)}</li>`).join("\n")
}
  </ul>
  <div class="body">
${contents.join("\n\n")}
  </div>
</div>
</body>
</html>
    `.trim() + "\n";
  }

  protected static buildMarkdownLink(
    this: void,
    target: string
  ) : string
  {
    return `[${target}](#${target.toLowerCase()})`;
  }

  protected static buildHTMLLink(
    this: void,
    target: string
  ) : string
  {
    return `<a href="#${target.toLowerCase()}">${target}</a>`;
  }

  readonly structure: S;
  readonly dependencies: readonly string[];

  protected constructor(node: N)
  {
    const name = node.getName();
    TypeWithDependencies.#collection.set(name, this);
    this.structure = node.getStructure();
    if (Structure.isTypeElementMembered(this.structure)) {
      TypeWithDependencies.#defineFromPropertyOnType(this.structure, name);
    }

    this.dependencies = this.getDependencyArray();
    TypeWithDependencies.#collection.set(name, this);
  }

  async #getAllPropertiesOuter(
    extendsDependencies: DependencyTracker,
    allPropsPromisesMap: AwaitedMap<string, PropertyArray>,
  ) : Promise<PropertyArray>
  {
    return await extendsDependencies.resolve(
      this.structure.name,
      this.dependencies,
      () => this.getAllPropertiesInner(allPropsPromisesMap)
    );
  }

  protected abstract getAllPropertiesInner(
    allPropsPromisesMap: AwaitedMap<string, PropertyArray>,
  ) : Promise<PropertyArray>;

  protected abstract getDependencyArray() : readonly string[];
  protected abstract getMarkdownTOCLink(): string;
  protected abstract getMarkdown() : string;
  protected abstract getHTML() : string;
}

class InterfaceWithDependencies
extends TypeWithDependencies<InterfaceDeclarationStructure, InterfaceDeclaration>
{
  static addNodes(typeFile: SourceFile, interfaceNames: string[]) : readonly string[]
  {
    const visited = new Set<string>;

    const nameToExtendsMap = new DefaultMap<string, Set<string>>;

    while (interfaceNames.length) {
      const name = interfaceNames.shift()!;
      if (visited.has(name))
        continue;
      visited.add(name);
      const extractedInterface = typeFile.getInterfaceOrThrow(name);
      const interfaceWithDeps = new InterfaceWithDependencies(extractedInterface);

      const newNames = typeArrayFromInterface(interfaceWithDeps.structure);
      interfaceNames.push(...newNames);
      nameToExtendsMap.set(name, new Set(newNames));
    }

    return Array.from(nameToExtendsMap.keys());
  }

  static readonly #KindedStructureRE = /^KindedStructure<(StructureKind\..*)>$/;

  protected constructor(node: InterfaceDeclaration)
  {
    super(node);

    if (this.dependencies.includes("KindedStructure")) {
      this.#overrideKindedStructure();
    }
  }

  #overrideKindedStructure() : void
  {
    const { structure } = this;

    const extendsRaw = structure.extends;
    if (!extendsRaw)
      throw new Error("assertion failure, dependencies came from this.structure.extends");
    let extendsArray: string[];
    if (typeof extendsRaw === "function") {
      extendsArray = [resolveCodeBlock(extendsRaw)];
    }
    else {
      extendsArray = extendsRaw.map(resolveCodeBlock);
    }

    const kindedType = extendsArray.find(el => InterfaceWithDependencies.#KindedStructureRE.test(el))!;
    const kindMatch = (kindedType.match(InterfaceWithDependencies.#KindedStructureRE)!)[1];

    this.#kindProperty = {
      kind: StructureKind.PropertySignature,
      name: "kind",
      type: kindMatch,
    };
    Reflect.defineProperty(this.#kindProperty, "fromTypeDefinition", {
      value: this.structure.name,
      enumerable: true,
      writable: false,
      configurable: false
    });

    if (structure.properties === undefined)
      structure.properties = [];

    structure.properties.push(this.#kindProperty);
  }

  #kindProperty?: PropertySignatureStructure;

  protected getDependencyArray(): readonly string[] {
    return typeArrayFromInterface(this.structure);
  }

  #allProperties: PropertyArray = [];

  protected async getAllPropertiesInner(
    allPropsPromisesMap: AwaitedMap<string, PropertyArray>,
  ) : Promise<PropertyArray>
  {
    let properties: PropertyWithoutKind[];
    {
      const promises = this.dependencies.map(
        extendName => allPropsPromisesMap.get(extendName)!
      );

      const properties_2D = await Promise.all(promises);

      if (Structure.isTypeElementMembered(this.structure) && this.structure.properties?.length) {
        properties_2D.push(this.structure.properties)
      }

      properties = properties_2D.flat();
    }

    if (!properties.every(Boolean)) {
      throw new Error("missing property: " + this.structure.name);
    }
    if (this.#kindProperty) {
      const index = properties.findIndex((propWithoutKind) => {
        return propWithoutKind.name === "kind" && propWithoutKind !== this.#kindProperty
      });
      if (index > -1) {
        properties.splice(index, 1);
      }
    }

    properties.sort(InterfaceWithDependencies.#PropertySorter);
    this.#allProperties = properties;
    return properties;
  }

  static #PropertySorter(
    this: void,
    a: PropertyWithoutKind,
    b: PropertyWithoutKind,
  ) : -1 | 0 | 1
  {
    if (a.name < b.name)
      return -1;
    if (a.name > b.name)
      return +1;
    return 0;
  }

  protected getMarkdownTOCLink(): string {
    return `- [${this.structure.name}](#${this.structure.name.toLowerCase()})`;
  }

  protected getMarkdown(): string {
    return `
### ${this.structure.name}

${this.#allProperties.map(
  property => InterfaceWithDependencies.#propertyAsMarkdown(
    this.structure.name, property)).join("\n").replace(/\|/g, "\\|")
}
  `.trim() + "\n";
}

  static #propertyAsMarkdown(
    interfaceName: string,
    property: PropertyWithoutKind
  ) : string
  {
    const fromInterface = Reflect.get(property, "fromTypeDefinition") as string;

    let docs = "";
    if (property.docs) {
      docs = property.docs.map(doc => {
        if (typeof doc === "string")
          return doc;
          return resolveCodeBlock(doc.description);
      }).join(" ").trim();
    }

    let type = resolveCodeBlock(property.type);
    if (property.name !== "kind") {
      const typeParts = this.#parseType(type);
      type = typeParts.map(([part, isLink]) => isLink ? this.buildMarkdownLink(part) : part).join("");
    }

    const linkText = (interfaceName !== fromInterface) ?
      `  From ${this.buildMarkdownLink(fromInterface)}.` :
      "";

    return [
      "- ",
      property.isReadonly ? "readonly " : "",
      property.name,
      property.hasQuestionToken ? "?" : "",
      ": " + type + "; ",
      docs ?? "",
      linkText,
    ].join("").trim();
  }

  static #parseType(type: string) : [string, boolean][]
  {
    return type.split(/\b/).map(part => {
      return [part, TypeWithDependencies.collection.has(part)]
    })
  }

  protected getHTML(): string {
    return `
<h3 id="${this.structure.name.toLowerCase()}">${this.structure.name}</h3>
<ul>
${this.#allProperties.map(
  property => InterfaceWithDependencies.#propertyAsHTML(
    this.structure.name, property
)).join("\n")}
</ul>
    `.trim();
  }

  static #propertyAsHTML(
    interfaceName: string,
    property: PropertyWithoutKind
  ) : string
  {
    const fromInterface = Reflect.get(property, "fromTypeDefinition") as string;
  
    let docs = "";
    if (property.docs) {
      docs = property.docs.map(doc => {
        if (typeof doc === "string")
          return doc;
        return resolveCodeBlock(doc.description);
      }).join(" ").trim();
    }

    let type = resolveCodeBlock(property.type);
    if (property.name !== "kind") {
      const typeParts = this.#parseType(type);
      type = typeParts.map(([part, isLink]) => isLink ? this.buildHTMLLink(part) : part).join("");
    }

    const linkText = (interfaceName !== fromInterface) ?
      `  From <code>${this.buildHTMLLink(fromInterface)}</code>.` :
      "";

    return [
      "<li>",
      "<code>",
      property.isReadonly ? "readonly " : "",
      property.name,
      property.hasQuestionToken ? "?" : "",
      ": " + type + "; ",
      "</code>",
      docs ?? "",
      linkText,
      "</li>"
    ].join("").trim() + "\n";
  }
}

class TypeAliasToUnion
extends TypeWithDependencies<TypeAliasDeclarationStructure, TypeAliasDeclaration>
{
  static addNodes(typeFile: SourceFile) : readonly string[]
  {
    const nodes: TypeAliasDeclaration[] = [
      typeFile.getTypeAliasOrThrow("Structures")
    ]

    const interfaceList: string[] = [];

    while (nodes.length) {
      const node = nodes.shift()!
      const withDeps = new TypeAliasToUnion(node);
      const newAliases: TypeAliasDeclaration[] = [];
      withDeps.dependencies.forEach(dep => {
        const alias = typeFile.getTypeAlias(dep);
        if (alias) {
          nodes.push(alias);
          return;
        }

        const interfaceNode = typeFile.getInterface(dep);
        if (interfaceNode) {
          interfaceList.push(dep);
          return;
        }

        throw new Error(`Dependency is neither an InterfaceDeclaration or a TypeAliasNode: ${dep}`);
      });

      nodes.push(...newAliases);
    }

    interfaceList.sort();
    return interfaceList;
  }

  protected async getAllPropertiesInner(
    allPropsPromisesMap: AwaitedMap<string, PropertyArray>,
  ) : Promise<PropertyArray>
  {
    void(allPropsPromisesMap);
    return Promise.resolve([]);
  }

  protected getDependencyArray(): readonly string[] {
    return typeArrayFromAlias(this.structure);
  }

  protected getMarkdownTOCLink(): string {
    return `- [${this.structure.name}](#${this.structure.name.toLowerCase()})`;
  }

  protected getMarkdown(): string {
    return `
### ${this.structure.name}

${this.#listAsMarkdown("")}
    `.trim() + "\n";
  }

  #listAsMarkdown(indent: string) : string
  {
    const deps = this.dependencies.slice();
    deps.sort();
    return deps.map(dep => this.#listItemAsMarkdown(indent, dep)).join("\n");
  }

  #listItemAsMarkdown(indent: string, depName: string) : string
  {
    const subType = TypeWithDependencies.collection.get(depName);
    if (!subType) {
      throw new Error("assertion failure, missing dependency: " + depName);
    }

    let rv: string;
    if (subType instanceof TypeAliasToUnion) {
      rv = `${indent}- ${depName}\n${
        subType.#listAsMarkdown(indent + "  ")
      }`;
    }
    else {
      rv = `${indent}- ${
        TypeWithDependencies.buildMarkdownLink(depName)
      }`;
    }
    return rv;
  }

  protected getHTML(): string {
    return `
<h3 id="${this.structure.name.toLowerCase()}">${this.structure.name}</h3>
${this.#listAsHTML("")}
    `.trim()
  }

  #listAsHTML(indent: string) : string
  {
    const deps = this.dependencies.slice();
    deps.sort();
    return `${indent}<ul>\n${
      deps.map(dep => this.#listItemAsHTML(indent + "  ", dep)).join("\n")
    }${indent}</ul>\n`
  }

  #listItemAsHTML(indent: string, depName: string) : string
  {
    const subType = TypeWithDependencies.collection.get(depName);
    if (!subType) {
      throw new Error("assertion failure, missing dependency: " + depName);
    }

    let rv: string;
    if (subType instanceof TypeAliasToUnion) {
      rv = `${indent}<li>${depName}\n${
        subType.#listAsHTML(indent + "  ")
      }`;
    }
    else {
      rv = `${indent}<li>${
        TypeWithDependencies.buildHTMLLink(depName)
      }\n`;
    }
    rv += `${indent}</li>`;
    return rv;
  }
}
