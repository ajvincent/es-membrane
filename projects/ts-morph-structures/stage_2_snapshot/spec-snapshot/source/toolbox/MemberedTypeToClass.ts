//#region preamble
import {
  StructureKind,
  type CodeBlockWriter,
  Scope,
  type WriterFunction,
} from "ts-morph";

import {
  type AccessorMirrorGetter,
  type ClassBodyStatementsGetter,
  ClassFieldStatementsMap,
  type ClassHeadStatementsGetter,
  ClassMembersMap,
  type ClassMemberImpl,
  type ClassStatementsGetter,
  ClassSupportsStatementsFlags,
  type ClassTailStatementsGetter,
  type ConstructorBodyStatementsGetter,
  type ConstructorHeadStatementsGetter,
  type ConstructorTailStatementsGetter,
  GetAccessorDeclarationImpl,
  LiteralTypeStructureImpl,
  IndexSignatureDeclarationImpl,
  InterfaceDeclarationImpl,
  type MemberedStatementsKey,
  MemberedTypeToClass,
  MemberedObjectTypeStructureImpl,
  MethodSignatureImpl,
  ParameterDeclarationImpl,
  type PropertyInitializerGetter,
  PropertySignatureImpl,
  SetAccessorDeclarationImpl,
  TypeMembersMap,
  type stringOrWriterFunction,
  type stringWriterOrStatementImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  MemberedStatementsKeyClass,
} from "#stage_two/snapshot/source/internal-exports.js";
//#endregion preamble

describe("MemberedTypeToClass", () => {
  class StubStatementsGetter implements ClassStatementsGetter {
    protected static hashKeys(
      fieldName: string,
      groupName: string,
      purpose: string
    ): string
    {
      const keyClass = new MemberedStatementsKeyClass(fieldName, groupName, purpose);
      return JSON.stringify(keyClass);
    }

    readonly keyword: string;
    readonly supportsStatementsFlags: number;

    readonly #visitedHashes = new Set<string>;
    readonly #contentsToWriter = new Map<string, WriterFunction>;
    readonly contentsToWriter: ReadonlyMap<string, WriterFunction> = this.#contentsToWriter;

    constructor(
      keyword: string,
      flags: number
    )
    {
      this.keyword = keyword;
      this.supportsStatementsFlags = flags;
    }

    createWriter(
      contents = "void(true);"
    ): WriterFunction
    {
      const writer = function(writer: CodeBlockWriter): void {
        writer.writeLine(contents);
      };
      this.#contentsToWriter.set(contents, writer);
      return writer;
    }

    get visitedSize(): number {
      return this.#visitedHashes.size;
    }

    protected visitKey(
      key: MemberedStatementsKey
    ): void
    {
      this.#visitedHashes.add(StubStatementsGetter.hashKeys(
        key.fieldKey, key.statementGroupKey, key.purpose
      ));
    }
  
    hasVisited(
      fieldName: string,
      groupName: string,
      purpose: string,
    ): boolean
    {
      return this.#visitedHashes.has(
        StubStatementsGetter.hashKeys(fieldName, groupName, purpose)
      );
    }
  
    matchesVisited(
      fieldNames: string[],
      groupNames: string[],
      purposeKeys: string[],
    ): boolean
    {
      for (const fieldName of fieldNames) {
        for (const groupName of groupNames) {
          for (const purpose of purposeKeys) {
            if (!this.hasVisited(fieldName, groupName, purpose))
              return false;
          }
        }
      }
  
      return true;
    }
  }

  class ConstructorStatementsGetter extends StubStatementsGetter
  implements ConstructorHeadStatementsGetter, ConstructorTailStatementsGetter
  {
    filterCtorHeadStatements(key: MemberedStatementsKey): boolean {
      void(key)
      return true;
    }
    getCtorHeadStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
      this.visitKey(key);
      return [this.createWriter(key.purpose + " head")];
    }

    filterCtorTailStatements(key: MemberedStatementsKey): boolean {
      void(key);
      return true;
    }
    getCtorTailStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
      this.visitKey(key);
      return [this.createWriter(key.purpose + " tail")];
    }
  }

  class AllStatementsGetter extends ConstructorStatementsGetter
  implements AccessorMirrorGetter, ConstructorBodyStatementsGetter, PropertyInitializerGetter,
  ClassBodyStatementsGetter, ClassHeadStatementsGetter, ClassTailStatementsGetter
  {
    readonly #statementsMap = new Map<string, stringWriterOrStatementImpl[]>;

    constructor(
      keyword: string
    )
    {
      super(
        keyword,
        ClassSupportsStatementsFlags.AccessorMirror | ClassSupportsStatementsFlags.PropertyInitializer |
        ClassSupportsStatementsFlags.ConstructorHeadStatements | ClassSupportsStatementsFlags.ConstructorBodyStatements | ClassSupportsStatementsFlags.ConstructorTailStatements |
        ClassSupportsStatementsFlags.HeadStatements | ClassSupportsStatementsFlags.BodyStatements | ClassSupportsStatementsFlags.TailStatements
      );
    }

    setStatements(
      fieldName: string,
      groupName: string,
      purpose: string,
      statements: stringWriterOrStatementImpl[]
    ): void
    {
      const hash = StubStatementsGetter.hashKeys(fieldName, groupName, purpose);
      this.#statementsMap.set(hash, statements);
    }

    #getStatements(
      key: MemberedStatementsKey
    ): stringWriterOrStatementImpl[]
    {
      this.visitKey(key);
      const hash = StubStatementsGetter.hashKeys(key.fieldKey, key.statementGroupKey, key.purpose);
      return this.#statementsMap.get(hash) ?? [];
    }

    filterAccessorMirror(key: MemberedStatementsKey): boolean {
      return Boolean(key);
    }
    getAccessorMirror(key: MemberedStatementsKey): stringWriterOrStatementImpl {
      this.visitKey(key);
      return this.#getStatements(key)[0];
    }

    filterPropertyInitializer(key: MemberedStatementsKey): boolean {
      return Boolean(key);
    }
    getPropertyInitializer(key: MemberedStatementsKey): stringWriterOrStatementImpl {
      return this.#getStatements(key)[0];
    }

    getCtorHeadStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
      this.visitKey(key);
      return this.#getStatements(key);
    }

    filterCtorBodyStatements(key: MemberedStatementsKey): boolean {
      return Boolean(key);
    }
    getCtorBodyStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
      this.visitKey(key);
      return this.#getStatements(key);
    }

    getCtorTailStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
      this.visitKey(key);
      return this.#getStatements(key);
    }

    filterHeadStatements(key: MemberedStatementsKey): boolean {
      return Boolean(key);
    }
    getHeadStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
      this.visitKey(key);
      return this.#getStatements(key);
    }

    filterBodyStatements(key: MemberedStatementsKey): boolean {
      return Boolean(key);
    }
    getBodyStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
      this.visitKey(key);
      return this.#getStatements(key);
    }

    filterTailStatements(key: MemberedStatementsKey): boolean {
      return Boolean(key);
    }
    getTailStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
      this.visitKey(key);
      return this.#getStatements(key);
    }
  }

  let typeToClass: MemberedTypeToClass;
  beforeEach(() => {
    typeToClass = new MemberedTypeToClass;
  });

  it("can create an empty class, with no statement maps", () => {
    const classMembers: ClassMembersMap = typeToClass.buildClassMembersMap();
    expect(classMembers.size).toBe(0);
  });

  it("will visit all keys and groups for a constructor with multiple statement groups", () => {
    // testing order of statement groups
    typeToClass.defineStatementsByPurpose("first", false);
    typeToClass.defineStatementsByPurpose("second", false);
    typeToClass.defineStatementsByPurpose("fourth", false);

    const statementsGetter = new ConstructorStatementsGetter(
      "testAllConstructorKeys",
      ClassSupportsStatementsFlags.ConstructorHeadStatements | ClassSupportsStatementsFlags.ConstructorTailStatements
    );
    typeToClass.addStatementGetters(0, [statementsGetter]);
    const classMembers: ClassMembersMap = typeToClass.buildClassMembersMap();

    expect(statementsGetter.matchesVisited(
      [ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL, ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN],
      ["constructor"],
      ["first", "second", "fourth"],
    )).toBe(true);

    expect(statementsGetter.visitedSize).toBe(6);

    expect(classMembers.size).toBe(1);
    const ctor = classMembers.get(
      ClassMembersMap.keyFromName(StructureKind.Constructor, false, "constructor")
    );
    expect(ctor).not.toBeUndefined();
    if (!ctor)
      return;
    expect(ctor.kind).toBe(StructureKind.Constructor);
    if (ctor.kind !== StructureKind.Constructor)
      return;

    expect(ctor.typeParameters.length).toBe(0);
    expect(ctor.parameters.length).toBe(0);

    const expectedStatements = [
      statementsGetter.contentsToWriter.get("first head"),
      statementsGetter.contentsToWriter.get("first tail"),
      statementsGetter.contentsToWriter.get("second head"),
      statementsGetter.contentsToWriter.get("second tail"),
      statementsGetter.contentsToWriter.get("fourth head"),
      statementsGetter.contentsToWriter.get("fourth tail")
    ];
    expect(expectedStatements.includes(undefined)).toBe(false);
    expect(ctor.statements).toEqual(expectedStatements as stringOrWriterFunction[]);
  });

  describe("validates the filter* and get* methods for a given supports flag:", () => {
    function runValidateTest(flag: ClassSupportsStatementsFlags, methodBase: string): void {
      const stub = new StubStatementsGetter("test", flag);
      let error: AggregateError | undefined;
      try {
        typeToClass.addStatementGetters(0, [stub]);
      }
      catch (ex) {
        expect(ex).toBeInstanceOf(AggregateError);
        if (ex instanceof AggregateError) {
          error = ex;
        }
      }
      expect(error).toBeDefined();
      if (!error)
        return;

      const { errors } = error;
      expect(errors.length).toBe(2);
      if (errors.length !== 2)
        return;

      const [firstError, secondError] = errors as [Error, Error];
      expect(firstError).toBeInstanceOf(Error);
      if (!(firstError instanceof Error))
        return;
      expect(secondError).toBeInstanceOf(Error);
      if (!(secondError instanceof Error))
        return;
      expect(firstError.message).toBe(`statements getter is missing filter${methodBase}: test`);
      expect(secondError.message).toBe(`statements getter is missing get${methodBase}: test`);
    }

    it("PropertyInitializer", () => {
      runValidateTest(ClassSupportsStatementsFlags.PropertyInitializer, "PropertyInitializer");
    });

    it("AccessorMirror", () => {
      runValidateTest(ClassSupportsStatementsFlags.AccessorMirror, "AccessorMirror");
    });
    it("HeadStatements", () => {
      runValidateTest(ClassSupportsStatementsFlags.HeadStatements, "HeadStatements");
    });
    it("BodyStatements", () => {
      runValidateTest(ClassSupportsStatementsFlags.BodyStatements, "BodyStatements");
    });
    it("TailStatements", () => {
      runValidateTest(ClassSupportsStatementsFlags.TailStatements, "TailStatements");
    });
    it("ConstructorHeadStatements", () => {
      runValidateTest(ClassSupportsStatementsFlags.ConstructorHeadStatements, "CtorHeadStatements");
    });
    it("ConstructorBodyStatements", () => {
      runValidateTest(ClassSupportsStatementsFlags.ConstructorBodyStatements, "CtorBodyStatements");
    });
    it("ConstructorTailStatements", () => {
      runValidateTest(ClassSupportsStatementsFlags.ConstructorTailStatements, "CtorTailStatements");
    });

    it("rejects a statements getter with an invalid flag", () => {
      const stub = new StubStatementsGetter("test", 0);
      let error: AggregateError | undefined;
      try {
        typeToClass.addStatementGetters(0, [stub]);
      }
      catch (ex) {
        expect(ex).toBeInstanceOf(AggregateError);
        if (ex instanceof AggregateError) {
          error = ex;
        }
      }
      expect(error).toBeDefined();
      if (!error)
        return;

      const { errors } = error;
      expect(errors.length).toBe(1);
      if (!errors[0])
        return;
      expect(errors[0]).toBeInstanceOf(Error);
      expect((errors[0] as Error).message).toBe(`statements getter's supportsStatementsFlag property is invalid: test`);
    });
  });

  it("visits statement getters with a lower priority number first (priority 1 beats priority 2)", () => {
    const firstCtorGetter = new ConstructorStatementsGetter(
      "unreached",
      ClassSupportsStatementsFlags.ConstructorHeadStatements | ClassSupportsStatementsFlags.ConstructorTailStatements
    );
    const secondCtorGetter = new ConstructorStatementsGetter(
      "higher-priority",
      ClassSupportsStatementsFlags.ConstructorHeadStatements | ClassSupportsStatementsFlags.ConstructorTailStatements
    );

    typeToClass.addStatementGetters(2, [firstCtorGetter]);
    typeToClass.addStatementGetters(1, [secondCtorGetter]);
    typeToClass.defineStatementsByPurpose("alpha", false);
    typeToClass.buildClassMembersMap();

    expect(secondCtorGetter.matchesVisited(
      [ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL, ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN],
      ["constructor"],
      ["alpha"],
    )).toBe(true);
    expect(secondCtorGetter.visitedSize).toBe(2);

    expect(firstCtorGetter.visitedSize).toBe(0);
  });

  it("calls earlier statement getters of an array first, given the same priority", () => {
    const firstCtorGetter = new ConstructorStatementsGetter(
      "first",
      ClassSupportsStatementsFlags.ConstructorHeadStatements | ClassSupportsStatementsFlags.ConstructorTailStatements
    );
    const secondCtorGetter = new ConstructorStatementsGetter(
      "second",
      ClassSupportsStatementsFlags.ConstructorHeadStatements | ClassSupportsStatementsFlags.ConstructorTailStatements
    );

    typeToClass.addStatementGetters(0, [firstCtorGetter, secondCtorGetter]);
    typeToClass.defineStatementsByPurpose("alpha", false);
    typeToClass.buildClassMembersMap();

    expect(firstCtorGetter.matchesVisited(
      [ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL, ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN],
      ["constructor"],
      ["alpha"],
    )).toBe(true);
    expect(firstCtorGetter.visitedSize).toBe(2);

    expect(secondCtorGetter.visitedSize).toBe(0);
  });

  it("will not visit statement getter traps for statements which did not match the flags of the getter", () => {
    const firstCtorGetter = new ConstructorStatementsGetter(
      "first",
      ClassSupportsStatementsFlags.ConstructorHeadStatements
    );
    const secondCtorGetter = new ConstructorStatementsGetter(
      "second",
      ClassSupportsStatementsFlags.ConstructorHeadStatements | ClassSupportsStatementsFlags.ConstructorTailStatements
    );

    typeToClass.addStatementGetters(0, [firstCtorGetter, secondCtorGetter]);
    typeToClass.defineStatementsByPurpose("alpha", false);
    typeToClass.buildClassMembersMap();

    expect(firstCtorGetter.matchesVisited(
      [ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL],
      ["constructor"],
      ["alpha"],
    )).toBe(true);
    expect(firstCtorGetter.visitedSize).toBe(1);

    expect(secondCtorGetter.matchesVisited(
      [ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN],
      ["constructor"],
      ["alpha"],
    )).toBe(true);
    expect(secondCtorGetter.visitedSize).toBe(1);
  });

  it("will not visit statement getter traps when the filter returns false", () => {
    const firstCtorGetter = new ConstructorStatementsGetter(
      "first",
      ClassSupportsStatementsFlags.ConstructorHeadStatements | ClassSupportsStatementsFlags.ConstructorTailStatements
    );
    firstCtorGetter.filterCtorHeadStatements = function(key: MemberedStatementsKey): boolean {
      void(key);
      return false;
    }

    const secondCtorGetter = new ConstructorStatementsGetter(
      "second",
      ClassSupportsStatementsFlags.ConstructorHeadStatements | ClassSupportsStatementsFlags.ConstructorTailStatements
    );

    typeToClass.addStatementGetters(0, [firstCtorGetter, secondCtorGetter]);
    typeToClass.defineStatementsByPurpose("alpha", false);
    typeToClass.buildClassMembersMap();

    expect(firstCtorGetter.matchesVisited(
      [ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN],
      ["constructor"],
      ["alpha"],
    )).toBe(true);
    expect(firstCtorGetter.visitedSize).toBe(1);

    expect(secondCtorGetter.matchesVisited(
      [ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL],
      ["constructor"],
      ["alpha"],
    )).toBe(true);
    expect(secondCtorGetter.visitedSize).toBe(1);
  });

  it("aggregates errors from multiple statement getters", () => {
    const firstCtorGetter = new ConstructorStatementsGetter(
      "first",
      ClassSupportsStatementsFlags.ConstructorHeadStatements | ClassSupportsStatementsFlags.ConstructorTailStatements
    );
    firstCtorGetter.filterCtorHeadStatements = function(key: MemberedStatementsKey): boolean {
      void(key);
      throw new Error("first filter " + key.purpose);
    }

    const secondCtorGetter = new ConstructorStatementsGetter(
      "second",
      ClassSupportsStatementsFlags.ConstructorHeadStatements | ClassSupportsStatementsFlags.ConstructorTailStatements
    );
    secondCtorGetter.getCtorHeadStatements = function(key: MemberedStatementsKey): stringWriterOrStatementImpl[] {
      void(key);
      throw new Error("second get " + key.purpose);
    }

    typeToClass.addStatementGetters(0, [firstCtorGetter, secondCtorGetter]);
    typeToClass.defineStatementsByPurpose("alpha", false);

    let exception: AggregateError | undefined;
    try {
      typeToClass.buildClassMembersMap();
    } catch (ex) {
      if (ex instanceof AggregateError)
        exception = ex;
    }

    expect(firstCtorGetter.matchesVisited(
      [ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN],
      ["constructor"],
      ["alpha"],
    )).toBe(true);
    expect(firstCtorGetter.visitedSize).toBe(1);

    expect(secondCtorGetter.visitedSize).toBe(0);

    expect(exception).toBeTruthy();
    if (exception === undefined)
      return;
    expect(exception.errors.length).toBe(2);
    if (exception.errors.length !== 2)
      return;

    const [firstError, secondError] = exception.errors as Error[];
    expect(firstError).toBeInstanceOf(Error);
    expect(firstError.message).toBe("first filter alpha");

    expect(secondError).toBeInstanceOf(Error);
    expect(secondError.message).toBe("second get alpha");
  });

  it("will iterate over properties for initializers and all statemented nodes", () => {
    // #region set up type members
    const membersMap: TypeMembersMap = new TypeMembersMap;

    const prop1 = new PropertySignatureImpl("one");
    prop1.typeStructure = LiteralTypeStructureImpl.get("string");

    const prop2 = new PropertySignatureImpl("two");
    prop2.isReadonly = true;
    prop2.typeStructure = LiteralTypeStructureImpl.get("string");

    const method3 = new MethodSignatureImpl("three");
    method3.returnTypeStructure = LiteralTypeStructureImpl.get("string");

    const private_4: PropertySignatureImpl = new PropertySignatureImpl("#four");
    private_4.typeStructure = LiteralTypeStructureImpl.get("number");

    const getter4 = new GetAccessorDeclarationImpl(false, "four");
    getter4.returnTypeStructure = private_4.typeStructure;

    const setterParam = new ParameterDeclarationImpl("value");
    setterParam.typeStructure = private_4.typeStructure;
    const setter4 = new SetAccessorDeclarationImpl(false, "four", setterParam);

    membersMap.addMembers([
      prop1, method3, getter4, setter4
    ]);
    // #endregion set up type members

    //#region statementsGetter set-up
    const statementsGetter = new AllStatementsGetter("test");

    const head_ctor = statementsGetter.createWriter(`void("ctor head");`);
    const tail_ctor = statementsGetter.createWriter(`void("ctor tail");`);

    statementsGetter.setStatements(
      ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL, "constructor", "first", [
        head_ctor
      ]
    );
    statementsGetter.setStatements(
      ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN, "constructor", "first", [
        tail_ctor
      ]
    );

    // using direct key names instead of ClassMembersMap.keyFromName() because it's faster and more obvious
    statementsGetter.setStatements(
      "one", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, "first", [
        `"value one"`
      ]
    );

    statementsGetter.setStatements(
      "one", "constructor", "first", [
        `if (one) { this.one = one; }`
      ]
    );

    statementsGetter.setStatements(
      "static two", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, "first", [
        `"value two"`
      ]
    );

    statementsGetter.setStatements(
      "#four", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, "first", [
        "4"
      ]
    );

    statementsGetter.setStatements(
      "four", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, "first", [
        "this.#four"
      ]
    );

    statementsGetter.setStatements(
      "static two", "three", "first", [
        `return MyClassName.two + " plus one";`
      ]
    );
    //#endregion statementsGetter set-up

    const ctorOneParam = new ParameterDeclarationImpl("one");
    ctorOneParam.typeStructure = prop1.typeStructure;

    typeToClass = new MemberedTypeToClass();
    typeToClass.constructorParameters.push(ctorOneParam);

    typeToClass.importFromTypeMembersMap(false, membersMap);
    typeToClass.addTypeMember(true, prop2);
    typeToClass.addTypeMember(false, private_4);

    typeToClass.defineStatementsByPurpose("first", false);

    typeToClass.addStatementGetters(1, [statementsGetter]);

    const classMembers: ClassMembersMap = typeToClass.buildClassMembersMap();

    //#region visited keys
    expect(statementsGetter.matchesVisited(
      [ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL, ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN],
      ["get four", "set four"],
      ["first"],
    )).toBe(true);
    //#endregion visited keys

    //#region inspecting the class members map

    const ctor_Decl = classMembers.getAsKind<StructureKind.Constructor>(StructureKind.Constructor, false, "constructor");
    expect(ctor_Decl).not.toBeUndefined();
    if (ctor_Decl) {
      expect(ctor_Decl.typeParameters.length).toBe(0);
      expect(ctor_Decl.parameters.length).toBe(1);
      expect(ctor_Decl.parameters[0]).toBe(ctorOneParam);
      expect(ctor_Decl.statements).toEqual([
        head_ctor,
        `if (one) { this.one = one; }`,
        tail_ctor,
      ]);
    }

    const prop1_Decl = classMembers.getAsKind<StructureKind.Property>(StructureKind.Property, false, "one");
    expect(prop1_Decl).not.toBeUndefined();
    if (prop1_Decl) {
      expect(prop1_Decl.isReadonly).toBe(false);
      expect(prop1_Decl.isStatic).toBe(false);
      expect(prop1_Decl.isAbstract).toBe(false);
      expect(prop1_Decl.name).toBe("one");
      expect(prop1_Decl.typeStructure).toBe(LiteralTypeStructureImpl.get("string"));
      expect(prop1_Decl.initializer).toBe(`"value one"`);
    }

    const prop2_Decl = classMembers.getAsKind<StructureKind.Property>(StructureKind.Property, true, "two");
    expect(prop2_Decl).not.toBeUndefined();
    if (prop2_Decl) {
      expect(prop2_Decl.isReadonly).toBe(true);
      expect(prop2_Decl.isStatic).toBe(true);
      expect(prop2_Decl.isAbstract).toBe(false);
      expect(prop2_Decl.name).toBe("two");
      expect(prop2_Decl.typeStructure).toBe(LiteralTypeStructureImpl.get("string"));
      expect(prop2_Decl.initializer).toBe(`"value two"`);
    }

    const prop4_PrivateDecl = classMembers.getAsKind<StructureKind.Property>(StructureKind.Property, false, "#four");
    expect(prop4_PrivateDecl).not.toBeUndefined();
    if (prop4_PrivateDecl) {
      expect(prop4_PrivateDecl.isReadonly).toBe(false);
      expect(prop4_PrivateDecl.isStatic).toBe(false);
      expect(prop4_PrivateDecl.isAbstract).toBe(false);
      expect(prop4_PrivateDecl.name).toBe("#four");
      expect(prop4_PrivateDecl.typeStructure).toBe(LiteralTypeStructureImpl.get("number"));
      expect(prop4_PrivateDecl.initializer).toBe("4");
    }

    const method3_Decl = classMembers.getAsKind<StructureKind.Method>(StructureKind.Method, false, "three");
    expect(method3_Decl).not.toBeUndefined();
    if (method3_Decl) {
      expect(method3_Decl.isAbstract).toBe(false);
      expect(method3_Decl.typeParameters.length).toBe(0);
      expect(method3_Decl.parameters.length).toBe(0);
      expect(method3_Decl.returnTypeStructure).toBe(LiteralTypeStructureImpl.get("string"));
      expect(method3_Decl.statements).toEqual([
        `return MyClassName.two + " plus one";`
      ]);
    }

    const getter4_Decl = classMembers.getAsKind<StructureKind.GetAccessor>(StructureKind.GetAccessor, false, "four");
    expect(getter4_Decl).not.toBeUndefined();
    if (getter4_Decl) {
      expect(getter4_Decl.isAbstract).toBe(false);
      expect(getter4_Decl.typeParameters.length).toBe(0);
      expect(getter4_Decl.parameters.length).toBe(0);
      expect(getter4_Decl.returnTypeStructure).toBe(LiteralTypeStructureImpl.get("number"));
      expect(getter4_Decl.statements).toEqual([
        `return this.#four;`
      ]);
    }

    const setter4_Decl = classMembers.getAsKind<StructureKind.SetAccessor>(StructureKind.SetAccessor, false, "four");
    expect(setter4_Decl).not.toBeUndefined();
    if (setter4_Decl) {
      expect(setter4_Decl.isAbstract).toBe(false);
      expect(setter4_Decl.typeParameters.length).toBe(0);
      expect(setter4_Decl.parameters.length).toBe(1);
      const fourParam = setter4_Decl.parameters[0] as ParameterDeclarationImpl | undefined;
      if (fourParam) {
        expect(fourParam.name).toBe("value");
        expect(fourParam.typeStructure).toBe(LiteralTypeStructureImpl.get("number"));
      }
      expect(setter4_Decl.statements).toEqual([
        `this.#four = value;`
      ]);
    }

    expect(classMembers.size).toBe(7);

    //#endregion inspecting the class members map
  });

  it("will resolve index signatures when it gets them from adding type members", () => {
    const index_C = new IndexSignatureDeclarationImpl;
    index_C.keyName = "Key";
    index_C.keyTypeStructure = LiteralTypeStructureImpl.get("string");
    index_C.returnTypeStructure = LiteralTypeStructureImpl.get("boolean");

    const statementsGetter = new AllStatementsGetter("test");

    statementsGetter.setStatements(
      "foo", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, "first", [`true`]
    );
    statementsGetter.setStatements(
      "bar", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, "first", [`false`]
    );

    typeToClass.indexSignatureResolver = {
      resolveIndexSignature: function(
        signature: IndexSignatureDeclarationImpl
      ): string[]
      {
        void(signature);
        return ["foo", "bar"];
      }
    }
    typeToClass.addTypeMember(false, index_C);
    typeToClass.defineStatementsByPurpose("first", false);
    typeToClass.addStatementGetters(1, [statementsGetter]);

    const classMembers: ClassMembersMap = typeToClass.buildClassMembersMap();
    expect(classMembers.size).toBe(2);

    const foo = classMembers.getAsKind<StructureKind.Property>(
      StructureKind.Property, false, "foo"
    );
    expect(foo).not.toBeUndefined();
    if (foo) {
      expect(foo.typeStructure).toBe(LiteralTypeStructureImpl.get("boolean"));
      expect(foo.initializer).toBe("true");
    }

    const bar = classMembers.getAsKind<StructureKind.Property>(
      StructureKind.Property, false, "bar"
    );
    expect(bar).not.toBeUndefined();
    if (bar) {
      expect(bar.typeStructure).toBe(LiteralTypeStructureImpl.get("boolean"));
      expect(bar.initializer).toBe("false");
    }
  });

  it("will detect some collisions between type members", () => {
    const prop1 = new PropertySignatureImpl("one");
    prop1.typeStructure = LiteralTypeStructureImpl.get("string");

    typeToClass.addTypeMember(false, prop1);
    expect(typeToClass.getCurrentTypeMembers(true)).toEqual([]);
    expect(typeToClass.getCurrentTypeMembers(false)).toEqual([prop1]);

    expect(() => {
      typeToClass.addTypeMember(false, prop1);
    }).toThrowError(`You already have a class member with the key "one".`);
    expect(typeToClass.getCurrentTypeMembers(false)).toEqual([prop1]);

    const prop1Clone = PropertySignatureImpl.clone(prop1);
    expect(() => {
      typeToClass.addTypeMember(false, prop1Clone);
    }).toThrowError(`You already have a class member with the key "one".`);
    expect(typeToClass.getCurrentTypeMembers(false)).toEqual([prop1]);

    typeToClass.addTypeMember(true, prop1);
    expect(typeToClass.getCurrentTypeMembers(true)).toEqual([prop1]);
    expect(typeToClass.getCurrentTypeMembers(false)).toEqual([prop1]);

    const method1 = new MethodSignatureImpl("one");
    method1.returnTypeStructure = LiteralTypeStructureImpl.get("string");
    expect(
      () => typeToClass.addTypeMember(false, method1)
    ).toThrowError(`You already have a class member with the key "one".`);

    // It's not perfect, you can still do dumb things
    const getter1 = new GetAccessorDeclarationImpl(false, "one");
    getter1.returnTypeStructure = LiteralTypeStructureImpl.get("string");
    typeToClass.addTypeMember(false, getter1);
    expect(typeToClass.getCurrentTypeMembers(true)).toEqual([prop1]);
    expect(typeToClass.getCurrentTypeMembers(false)).toEqual([prop1, getter1]);

    // Collisions via index signatures
    let indexNames = ["foo", "bar"];
    typeToClass.indexSignatureResolver = {
      resolveIndexSignature: function(
        signature: IndexSignatureDeclarationImpl
      ): string[]
      {
        void(signature);
        return indexNames.slice();
      }
    }

    let indexSignature = new IndexSignatureDeclarationImpl();
    indexSignature.keyName = "Key";
    indexSignature.keyType = "string";
    indexSignature.returnType = "string";

    const foo = new PropertySignatureImpl("foo");
    typeToClass.addTypeMember(false, foo);
    expect(typeToClass.getCurrentTypeMembers(true)).toEqual([prop1]);
    expect(typeToClass.getCurrentTypeMembers(false)).toEqual([prop1, getter1, foo]);

    expect(() => {
      typeToClass.addTypeMember(false, indexSignature);
    }).toThrowError(
      `Index signature resolver requested the name "foo", but this field already exists.`
    );
    expect(typeToClass.getCurrentTypeMembers(true)).toEqual([prop1]);
    expect(typeToClass.getCurrentTypeMembers(false)).toEqual([prop1, getter1, foo]);

    indexNames = ["bar", "bar"];
    indexSignature = IndexSignatureDeclarationImpl.clone(indexSignature);
    expect(() => {
      typeToClass.addTypeMember(false, indexSignature);
    }).toThrowError(
      `You already have a class member with the key "bar", possibly through an index signature resolution.`
    );
    expect(typeToClass.getCurrentTypeMembers(true)).toEqual([prop1]);
    expect(typeToClass.getCurrentTypeMembers(false)).toEqual([prop1, getter1, foo]);
  });

  it("can add isAbstract to class members", () => {
    // #region set up type members
    const membersMap: TypeMembersMap = new TypeMembersMap;

    const prop1 = new PropertySignatureImpl("one");
    prop1.typeStructure = LiteralTypeStructureImpl.get("string");

    const prop2 = new PropertySignatureImpl("two");
    prop2.isReadonly = true;
    prop2.typeStructure = LiteralTypeStructureImpl.get("string");

    const method3 = new MethodSignatureImpl("three");
    method3.returnTypeStructure = LiteralTypeStructureImpl.get("string");

    const private_4: PropertySignatureImpl = new PropertySignatureImpl("#four");
    private_4.typeStructure = LiteralTypeStructureImpl.get("number");

    const getter4 = new GetAccessorDeclarationImpl(false, "four");
    getter4.returnTypeStructure = private_4.typeStructure;

    const setterParam = new ParameterDeclarationImpl("value");
    setterParam.typeStructure = private_4.typeStructure;
    const setter4 = new SetAccessorDeclarationImpl(false, "four", setterParam);

    membersMap.addMembers([
      prop1, prop2, method3, getter4, setter4
    ]);
    // #endregion set up type members

    typeToClass.isAbstractCallback = {
      isAbstract: function(kind: ClassMemberImpl["kind"], name: string): boolean {
        if ((kind === StructureKind.Property) && (name === prop2.name))
          return true;
        if ((kind === StructureKind.GetAccessor) && (name === getter4.name))
          return true;
        if ((kind === StructureKind.Method) && (name === method3.name))
          return true;
        if ((kind === StructureKind.SetAccessor) && (name === setter4.name))
          return true;
        return false;
      }
    }

    const statementsGetter = new AllStatementsGetter("test");

    statementsGetter.setStatements(
      "one", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, "first", [
        `"value one"`
      ]
    );

    // shouldn't be called
    statementsGetter.setStatements(
      "two", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, "first", [
        `"value two"`
      ]
    );

    // shouldn't be called
    statementsGetter.setStatements(
      "four", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, "first", [
        "this.#four"
      ]
    );

    // shouldn't be called
    statementsGetter.setStatements(
      "two", "three", "first", [
        `return this.two + " plus one";`
      ]
    );

    typeToClass.defineStatementsByPurpose("first", false);
    typeToClass.importFromTypeMembersMap(false, membersMap);
    typeToClass.addStatementGetters(1, [statementsGetter]);
    const classMembers: ClassMembersMap = typeToClass.buildClassMembersMap();

    //#region inspecting the class members map

    const prop1_Decl = classMembers.getAsKind<StructureKind.Property>(StructureKind.Property, false, "one");
    expect(prop1_Decl).not.toBeUndefined();
    if (prop1_Decl) {
      expect(prop1_Decl.isReadonly).toBe(false);
      expect(prop1_Decl.isStatic).toBe(false);
      expect(prop1_Decl.isAbstract).toBe(false);
      expect(prop1_Decl.name).toBe("one");
      expect(prop1_Decl.typeStructure).toBe(LiteralTypeStructureImpl.get("string"));
      expect(prop1_Decl.initializer).toBe(`"value one"`);
    }

    const prop2_Decl = classMembers.getAsKind<StructureKind.Property>(StructureKind.Property, false, "two");
    expect(prop2_Decl).not.toBeUndefined();
    if (prop2_Decl) {
      expect(prop2_Decl.isReadonly).toBe(true);
      expect(prop2_Decl.isStatic).toBe(false);
      expect(prop2_Decl.isAbstract).toBe(true);
      expect(prop2_Decl.name).toBe("two");
      expect(prop2_Decl.typeStructure).toBe(LiteralTypeStructureImpl.get("string"));
      expect(prop2_Decl.initializer).toBe(undefined);
    }

    const method3_Decl = classMembers.getAsKind<StructureKind.Method>(StructureKind.Method, false, "three");
    expect(method3_Decl).not.toBeUndefined();
    if (method3_Decl) {
      expect(method3_Decl.isAbstract).toBe(true);
      expect(method3_Decl.typeParameters.length).toBe(0);
      expect(method3_Decl.parameters.length).toBe(0);
      expect(method3_Decl.returnTypeStructure).toBe(LiteralTypeStructureImpl.get("string"));
      expect(method3_Decl.statements).toEqual([]);
    }

    const getter4_Decl = classMembers.getAsKind<StructureKind.GetAccessor>(StructureKind.GetAccessor, false, "four");
    expect(getter4_Decl).not.toBeUndefined();
    if (getter4_Decl) {
      expect(getter4_Decl.isAbstract).toBe(true);
      expect(getter4_Decl.typeParameters.length).toBe(0);
      expect(getter4_Decl.parameters.length).toBe(0);
      expect(getter4_Decl.returnTypeStructure).toBe(LiteralTypeStructureImpl.get("number"));
      expect(getter4_Decl.statements).toEqual([]);
    }

    const setter4_Decl = classMembers.getAsKind<StructureKind.SetAccessor>(StructureKind.SetAccessor, false, "four");
    expect(setter4_Decl).not.toBeUndefined();
    if (setter4_Decl) {
      expect(setter4_Decl.isAbstract).toBe(true);
      expect(setter4_Decl.typeParameters.length).toBe(0);
      expect(setter4_Decl.parameters.length).toBe(1);
      const fourParam = setter4_Decl.parameters[0] as ParameterDeclarationImpl | undefined;
      if (fourParam) {
        expect(fourParam.name).toBe("value");
        expect(fourParam.typeStructure).toBe(LiteralTypeStructureImpl.get("number"));
      }
      expect(setter4_Decl.statements).toEqual([]);
    }

    expect(statementsGetter.hasVisited(
      "one", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, "first"
    )).toBe(true);
    expect(statementsGetter.hasVisited(
      "two", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, "first"
    )).toBe(false);
    expect(statementsGetter.hasVisited(
      "two", "three", "first"
    )).toBe(false);
    expect(statementsGetter.hasVisited(
      "four", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, "first"
    )).toBe(false);

    //#endregion inspecting the class members map
  });

  it("can add scope to class members", () => {
    const prop1 = new PropertySignatureImpl("one");
    prop1.typeStructure = LiteralTypeStructureImpl.get("string");

    const prop2 = new PropertySignatureImpl("two");
    prop1.typeStructure = LiteralTypeStructureImpl.get("string");

    const prop3 = new PropertySignatureImpl("three");
    prop1.typeStructure = LiteralTypeStructureImpl.get("string");

    typeToClass.scopeCallback = {
      getScope: function(
        isStatic: boolean,
        kind: ClassMemberImpl["kind"],
        name: string
      ): Scope | undefined
      {
        void(isStatic);
        void(kind);
        if (name === "one")
          return Scope.Public;
        if (name === "two")
          return Scope.Protected;
      }
    }

    const tempMap = new TypeMembersMap();
    tempMap.addMembers([prop1, prop2, prop3]);
    typeToClass.importFromTypeMembersMap(false, tempMap);

    const classMembers: ClassMembersMap = typeToClass.buildClassMembersMap();
    expect(classMembers.size).toBe(3);

    const prop1_Decl = classMembers.getAsKind<StructureKind.Property>(
      StructureKind.Property, false, "one"
    );
    expect(prop1_Decl?.scope).toBe(Scope.Public);

    const prop2_Decl = classMembers.getAsKind<StructureKind.Property>(
      StructureKind.Property, false, "two"
    );
    expect(prop2_Decl?.scope).toBe(Scope.Protected);

    const prop3_Decl = classMembers.getAsKind<StructureKind.Property>(
      StructureKind.Property, false, "three"
    );
    expect(prop3_Decl).not.toBeUndefined();
    expect(prop3_Decl?.scope).toBeUndefined();
  });

  it("can add isAsync to methods", () => {
    const method1 = new MethodSignatureImpl("one");
    method1.returnTypeStructure = LiteralTypeStructureImpl.get("string");

    const method2 = new MethodSignatureImpl("two");
    method2.returnTypeStructure = LiteralTypeStructureImpl.get("string");

    typeToClass.isAsyncCallback = {
      isAsync: function(isStatic: boolean, name): boolean {
        void(isStatic);
        return name === "one";
      }
    };

    const interfaceDecl = new InterfaceDeclarationImpl("MyInterface");
    interfaceDecl.methods.push(method1, method2);

    typeToClass.importFromMemberedType(false, interfaceDecl);

    const classMembers: ClassMembersMap = typeToClass.buildClassMembersMap();
    expect(classMembers.size).toBe(2);

    const method1_Decl = classMembers.getAsKind<StructureKind.Method>(
      StructureKind.Method, false, "one"
    );
    expect(method1_Decl?.isAsync).toBeTrue();

    const method2_Decl = classMembers.getAsKind<StructureKind.Method>(
      StructureKind.Method, false, "two"
    );
    expect(method2_Decl?.isAsync).toBeFalse();
  });

  it("can add isGenerator to methods", () => {
    const method1 = new MethodSignatureImpl("one");
    method1.returnTypeStructure = LiteralTypeStructureImpl.get("string");

    const method2 = new MethodSignatureImpl("two");
    method2.returnTypeStructure = LiteralTypeStructureImpl.get("string");

    typeToClass.isGeneratorCallback = {
      isGenerator: function(isStatic: boolean, name): boolean {
        void(isStatic);
        return name === "one";
      }
    };

    const membered = new MemberedObjectTypeStructureImpl;
    membered.methods.push(method1, method2);

    typeToClass.importFromMemberedType(false, membered);

    const classMembers: ClassMembersMap = typeToClass.buildClassMembersMap();
    expect(classMembers.size).toBe(2);

    const method1_Decl = classMembers.getAsKind<StructureKind.Method>(
      StructureKind.Method, false, "one"
    );
    expect(method1_Decl?.isGenerator).toBeTrue();

    const method2_Decl = classMembers.getAsKind<StructureKind.Method>(
      StructureKind.Method, false, "two"
    );
    expect(method2_Decl?.isGenerator).toBeFalse();
  });

  it("supports insertMemberKey for the constructor", () => {
    typeToClass.defineStatementsByPurpose("first", false);
    typeToClass.defineStatementsByPurpose("second", false);

    const statementsGetter = new AllStatementsGetter("test");

    const first_hello_ctor = statementsGetter.createWriter(`void("first hello");`);
    const second_hello_ctor = statementsGetter.createWriter(`void("second hello");`);

    statementsGetter.setStatements(
      "hello", "constructor", "first", [
        first_hello_ctor
      ]
    );
    statementsGetter.setStatements(
      "hello", "constructor", "second", [
        second_hello_ctor
      ]
    );

    typeToClass.insertMemberKey(false, new PropertySignatureImpl("hello"), false, "constructor");
    typeToClass.addStatementGetters(1, [statementsGetter]);
    const classMembers: ClassMembersMap = typeToClass.buildClassMembersMap();

    const ctor_Decl = classMembers.getAsKind<StructureKind.Constructor>(StructureKind.Constructor, false, "constructor");
    expect(ctor_Decl).not.toBeUndefined();
    if (ctor_Decl) {
      expect(ctor_Decl.typeParameters.length).toBe(0);
      expect(ctor_Decl.statements).toEqual([
        first_hello_ctor,
        second_hello_ctor,
      ]);
    }
  });

  it("supports insertMemberKey for existing methods", () => {
    typeToClass.defineStatementsByPurpose("first", false);
    typeToClass.defineStatementsByPurpose("second", false);

    const statementsGetter = new AllStatementsGetter("test");
    const membersMap: TypeMembersMap = new TypeMembersMap;

    const prop1 = new PropertySignatureImpl("one");
    prop1.typeStructure = LiteralTypeStructureImpl.get("string");

    const method3 = new MethodSignatureImpl("three");
    method3.returnTypeStructure = LiteralTypeStructureImpl.get("string");

    membersMap.addMembers([
      prop1, method3
    ]);

    const first_hello_three = statementsGetter.createWriter(`void("first hello");`);
    const second_hello_three = statementsGetter.createWriter(`void("second hello");`);

    statementsGetter.setStatements(
      "one", "three", "first", [
        `"value one"`
      ]
    );

    statementsGetter.setStatements(
      "one", "three", "second", [
        `if (one) { this.one = one; }`
      ]
    );

    statementsGetter.setStatements(
      "hello", "three", "first", [
        first_hello_three
      ]
    );
    statementsGetter.setStatements(
      "hello", "three", "second", [
        second_hello_three
      ]
    );

    typeToClass.importFromTypeMembersMap(false, membersMap);
    typeToClass.insertMemberKey(false, new PropertySignatureImpl("hello"), false, method3);
    typeToClass.addStatementGetters(1, [statementsGetter]);
    const classMembers: ClassMembersMap = typeToClass.buildClassMembersMap();

    const three = classMembers.getAsKind(StructureKind.Method, false, "three");
    expect(three).not.toBeUndefined();
    if (three) {
      expect(three?.statements).toEqual([
        first_hello_three,
        `"value one"`,
        second_hello_three,
        `if (one) { this.one = one; }`
      ]);
    }
  });
});
