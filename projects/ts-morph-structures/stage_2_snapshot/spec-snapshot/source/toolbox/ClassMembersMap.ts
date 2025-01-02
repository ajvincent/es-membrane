import {
  StructureKind,
} from "ts-morph";

import {
  ClassDeclarationImpl,
  ClassMembersMap,
  ClassFieldStatementsMap,
  ConstructorDeclarationImpl,
  GetAccessorDeclarationImpl,
  LiteralTypeStructureImpl,
  ParameterDeclarationImpl,
  PropertyDeclarationImpl,
  MethodDeclarationImpl,
  SetAccessorDeclarationImpl,
} from "#stage_two/snapshot/source/exports.js";

describe("ClassMembersMap", () => {
  let membersMap: ClassMembersMap;
  let prop1: PropertyDeclarationImpl, prop2: PropertyDeclarationImpl;
  let ctor_A: ConstructorDeclarationImpl;
  let method3: MethodDeclarationImpl, method4: MethodDeclarationImpl;
  let getter5: GetAccessorDeclarationImpl;
  let setter5: SetAccessorDeclarationImpl;

  beforeEach(() => {
    membersMap = new ClassMembersMap;

    prop1 = new PropertyDeclarationImpl(false, "one");
    prop2 = new PropertyDeclarationImpl(false, "two");

    ctor_A = new ConstructorDeclarationImpl;

    method3 = new MethodDeclarationImpl(true, "three");
    method4 = new MethodDeclarationImpl(false, "four");

    const value_five = new ParameterDeclarationImpl("five");
    value_five.typeStructure = LiteralTypeStructureImpl.get("string");

    getter5 = new GetAccessorDeclarationImpl(false, "five", value_five.typeStructure);
    setter5 = new SetAccessorDeclarationImpl(false, "five", value_five);
  });

  it("allows us to organize class members by kind", () => {
    membersMap.addMembers([
      prop1, prop2, ctor_A, method3, method4, getter5, setter5
    ]);

    expect(membersMap.get('one')).toBe(prop1);
    expect(membersMap.get("two")).toBe(prop2);
    expect(membersMap.get("static three")).toBe(method3);
    expect(membersMap.get("four")).toBe(method4);
    expect(membersMap.get("constructor")).toBe(ctor_A);
    expect(membersMap.get("get five")).toBe(getter5);
    expect(membersMap.get("set five")).toBe(setter5);
    expect(membersMap.size).toBe(7);

    expect(
      membersMap.getAsKind<StructureKind.Property>(StructureKind.Property, false, "one")
    ).toBe(prop1);

    expect(
      membersMap.getAsKind<StructureKind.Method>(StructureKind.Method, true, "three")
    ).toBe(method3);

    expect(
      membersMap.getAsKind<StructureKind.Method>(StructureKind.Method, false, "four")
    ).toBe(method4);

    expect(
      membersMap.getAsKind<StructureKind.Method>(StructureKind.Method, true, "four")
    ).toBe(undefined);

    expect<readonly PropertyDeclarationImpl[]>(
      membersMap.arrayOfKind<StructureKind.Property>(StructureKind.Property)
    ).toEqual([prop1, prop2]);

    expect<readonly MethodDeclarationImpl[]>(
      membersMap.arrayOfKind<StructureKind.Method>(StructureKind.Method)
    ).toEqual([method3, method4])

    expect<readonly ConstructorDeclarationImpl[]>(
      membersMap.arrayOfKind<StructureKind.Constructor>(StructureKind.Constructor)
    ).toEqual([ctor_A]);

    expect<readonly  GetAccessorDeclarationImpl[]>(
      membersMap.arrayOfKind<StructureKind.GetAccessor>(StructureKind.GetAccessor)
    ).toEqual([getter5]);

    expect<readonly  SetAccessorDeclarationImpl[]>(
      membersMap.arrayOfKind<StructureKind.SetAccessor>(StructureKind.SetAccessor)
    ).toEqual([setter5]);
  });

  it("moveStatementsToMembers() transfers statements to the map", () => {
    membersMap.addMembers([
      prop1, prop2, ctor_A, method3, method4, getter5, setter5
    ]);

    const statementMap1 = new ClassFieldStatementsMap([
      ["two", "constructor", ["this.two = 2;"]],

      //prop1
      ["one", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, [`"one"`]],

      // getter5, setter5
      ["five", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, [`this.#five`]],

      // method3
      ["middle", "static three", ["void(this.middle);"]],
      [ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN, "static three", ["return tail;"]],
      [ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL, "static three", ["void(head);"]],

      // method4
      ["one", "four", [`console.log(this.one);`]],
    ]);

    membersMap.moveStatementsToMembers([statementMap1]);

    expect(ctor_A.statements).toEqual([
      "this.two = 2;"
    ]);

    expect(prop1.initializer).toBe(`"one"`);

    expect(membersMap.arrayOfKind<StructureKind.Method>(StructureKind.Method)).toEqual([method3, method4]);
    expect(method3.statements).toEqual([
      "void(head);", "void(this.middle);", "return tail;"
    ]);

    expect(method4.statements).toEqual([`console.log(this.one);`]);

    expect(getter5.statements).toEqual([`return this.#five;`]);
    expect(setter5.statements).toEqual([`this.#five = five;`]);
  });

  it("moveMembersToClass() moves members from the class members map to an existing class declaration", () => {
    membersMap.addMembers([
      prop1, prop2, ctor_A, method3, method4, getter5, setter5
    ]);

    const classDecl = new ClassDeclarationImpl;
    membersMap.moveMembersToClass(classDecl);
    expect(classDecl.ctors).toEqual([ctor_A]);
    expect(classDecl.getAccessors).toEqual([getter5]);
    expect(classDecl.methods).toEqual([method3, method4]);
    expect(classDecl.properties).toEqual([prop1, prop2]);
    expect(classDecl.setAccessors).toEqual([setter5]);
  });

  describe("convertPropertyToAccessors()", () => {
    let getter1: GetAccessorDeclarationImpl | undefined;
    let setter1: SetAccessorDeclarationImpl | undefined;
    beforeEach(() => {
      membersMap.addMembers([prop1]);
      getter1 = undefined;
      setter1 = undefined;
    });

    function retrieveAccessors(): void {
      getter1 = membersMap.getAsKind<StructureKind.GetAccessor>(StructureKind.GetAccessor, prop1.isStatic, prop1.name);
      setter1 = membersMap.getAsKind<StructureKind.SetAccessor>(StructureKind.SetAccessor, prop1.isStatic, prop1.name);
    }

    it("can give us a getter only", () => {
      membersMap.convertPropertyToAccessors(prop1.isStatic, prop1.name, true, false);
      retrieveAccessors();

      expect(getter1).not.toBeUndefined();
      if (getter1) {
        expect(getter1.name).toBe(prop1.name);
        // property didn't have any docs or trivia
        expect(getter1.docs).toEqual([]);
        expect(getter1.isAbstract).toBe(prop1.isAbstract);
        expect(getter1.leadingTrivia).toEqual([]);
        expect(getter1.scope).toBe(prop1.scope);
        expect(getter1.trailingTrivia).toEqual([]);
        // we used a string type
        expect(getter1.returnType).toEqual(prop1.type);
      }

      expect(setter1).toBe(undefined);

      expect(membersMap.getAsKind<StructureKind.Property>(
        StructureKind.Property, prop1.isStatic, prop1.name
      )).toBeUndefined();
    });

    it("can give us a setter only", () => {
      membersMap.convertPropertyToAccessors(prop1.isStatic, prop1.name, false, true);
      retrieveAccessors();

      expect(getter1).toBeUndefined();

      expect(setter1).not.toBeUndefined();
      if (setter1) {
        expect(setter1.parameters.length).toBe(1);
        const [parameter] = setter1.parameters;
        expect(parameter).not.toBeUndefined();
        if (parameter) {
          expect(parameter.name).toBe("value");
          // we used a string type
          expect(parameter.type).toBe(prop1.type);
        }

        // property didn't have any docs or trivia
        expect(setter1.docs).toEqual([]);
        expect(setter1.isAbstract).toBe(prop1.isAbstract);
        expect(setter1.leadingTrivia).toEqual([]);
        expect(setter1.name).toBe(prop1.name);
        expect(setter1.scope).toBe(prop1.scope);
        expect(setter1.trailingTrivia).toEqual([]);
        expect(setter1.typeParameters).toEqual([]);
      }

      expect(membersMap.getAsKind<StructureKind.Property>(
        StructureKind.Property, prop1.isStatic, prop1.name
      )).toBeUndefined();
    });

    // getter/setter pair
    it("can give us both a getter and a setter", () => {
      membersMap.convertPropertyToAccessors(prop1.isStatic, prop1.name, true, true);
      retrieveAccessors();

      expect(getter1).not.toBeUndefined();
      if (getter1) {
        expect(getter1.name).toBe(prop1.name);
        // property didn't have any docs or trivia
        expect(getter1.docs).toEqual([]);
        expect(getter1.isAbstract).toBe(prop1.isAbstract);
        expect(getter1.leadingTrivia).toEqual([]);
        expect(getter1.scope).toBe(prop1.scope);
        expect(getter1.trailingTrivia).toEqual([]);
        // we used a string type
        expect(getter1.returnType).toEqual(prop1.type);
      }

      expect(setter1).not.toBeUndefined();
      if (setter1) {
        expect(setter1.parameters.length).toBe(1);
        const [parameter] = setter1.parameters;
        expect(parameter).not.toBeUndefined();
        if (parameter) {
          expect(parameter.name).toBe("value");
          // we used a string type
          expect(parameter.type).toBe(prop1.type);
        }

        // property didn't have any docs or trivia
        expect(setter1.docs).toEqual([]);
        expect(setter1.isAbstract).toBe(prop1.isAbstract);
        expect(setter1.leadingTrivia).toEqual([]);
        expect(setter1.name).toBe(prop1.name);
        expect(setter1.scope).toBe(prop1.scope);
        expect(setter1.trailingTrivia).toEqual([]);
        expect(setter1.typeParameters).toEqual([]);
      }

      expect(membersMap.getAsKind<StructureKind.Property>(
        StructureKind.Property, prop1.isStatic, prop1.name
      )).toBeUndefined();
    });

    it("throws if we asked for neither a getter nor a setter", () => {
      expect(
        () => membersMap.convertPropertyToAccessors(prop1.isStatic, prop1.name, false, false)
      ).toThrowError("You must request either a get accessor or a set accessor!");
    });
  });

  describe("convertAccessorsToProperty() can give us a property", () => {
    let prop5: PropertyDeclarationImpl | undefined;

    function retrieveProperty(): void {
      prop5 = membersMap.getAsKind<StructureKind.Property>(StructureKind.Property, getter5.isStatic, getter5.name);
    }

    it("from a getter only", () => {
      membersMap.addMembers([getter5]);
      membersMap.convertAccessorsToProperty(getter5.isStatic, getter5.name);

      retrieveProperty();
      expect(prop5).not.toBeUndefined();
      if (prop5) {
        expect(prop5.name).toBe(getter5.name);
        expect(prop5.typeStructure).toBe(getter5.returnTypeStructure);
      }

      expect(membersMap.getAsKind<StructureKind.GetAccessor>(
        StructureKind.GetAccessor, getter5.isStatic, getter5.name
      )).toBeUndefined();
    });

    it("from a setter only", () => {
      membersMap.addMembers([setter5]);
      membersMap.convertAccessorsToProperty(setter5.isStatic, setter5.name);

      retrieveProperty();
      expect(prop5).not.toBeUndefined();
      if (prop5) {
        expect(prop5.name).toBe(setter5.name);
        const param = setter5.parameters[0];
        expect(prop5.typeStructure).toBe(param.typeStructure);
      }

      expect(membersMap.getAsKind<StructureKind.SetAccessor>(
        StructureKind.SetAccessor, setter5.isStatic, setter5.name
      )).toBeUndefined();
    });

    it("from a getter and a setter", () => {
      membersMap.addMembers([getter5, setter5]);
      membersMap.convertAccessorsToProperty(getter5.isStatic, getter5.name);

      retrieveProperty();
      expect(prop5).not.toBeUndefined();
      if (prop5) {
        expect(prop5.name).toBe(getter5.name);
        expect(prop5.typeStructure).toBe(getter5.returnTypeStructure);
      }

      expect(membersMap.getAsKind<StructureKind.GetAccessor>(
        StructureKind.GetAccessor, getter5.isStatic, getter5.name
      )).toBeUndefined();

      expect(membersMap.getAsKind<StructureKind.SetAccessor>(
        StructureKind.SetAccessor, setter5.isStatic, setter5.name
      )).toBeUndefined();
    });

    it("except when there is no getter or setter to start with", () => {
      expect(
        () => membersMap.convertAccessorsToProperty(getter5.isStatic, getter5.name)
      ).toThrowError(getter5.name + " accessors not found!");
    });
  });

  it("static keyFromName() and keyFromMember() give us keys we can use in the map", () => {
    expect(ClassMembersMap.keyFromMember(method3)).toBe("static three");

    expect(ClassMembersMap.keyFromName(StructureKind.Constructor, true, "three")).toBe("constructor");
    expect(ClassMembersMap.keyFromName(StructureKind.GetAccessor, true, "three")).toBe("static get three");
    expect(ClassMembersMap.keyFromName(StructureKind.Method, true, "three")).toBe("static three");
    expect(ClassMembersMap.keyFromName(StructureKind.Method, false, "three")).toBe("three");
    expect(ClassMembersMap.keyFromName(StructureKind.SetAccessor, true, "three")).toBe("static set three");
    expect(ClassMembersMap.keyFromName(StructureKind.Property, true, "three")).toBe("static three");
  });

  it("static fromClassDeclaration() converts a ClassDeclaration into a ClassMembersMap", () => {
    const classDecl = new ClassDeclarationImpl;
    classDecl.properties.push(prop1, prop2);
    classDecl.ctors.push(ctor_A);
    classDecl.methods.push(method3, method4);
    classDecl.getAccessors.push(getter5);
    classDecl.setAccessors.push(setter5);

    membersMap = ClassMembersMap.fromClassDeclaration(classDecl);
    expect(Array.from(membersMap.entries())).toEqual([
      ["constructor", ctor_A],
      ["get five", getter5],
      ["static three", method3],
      ["four", method4],
      ["one", prop1],
      ["two", prop2],
      ["set five", setter5],
    ]);
  });
});
