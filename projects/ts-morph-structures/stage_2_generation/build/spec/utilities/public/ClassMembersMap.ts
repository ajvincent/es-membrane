import {
  ConstructorDeclarationImpl,
  PropertyDeclarationImpl,
  MethodDeclarationImpl
} from "#stage_one/prototype-snapshot/exports.js";
import { StructureKind } from "ts-morph";

import ClassMembersMap from "#stage_two/generation/build/utilities/public/ClassMembersMap.js";

it("ClassMembersMap allows us to organize class members by kind", () => {
  const memberMap = new ClassMembersMap;

  const prop1 = new PropertyDeclarationImpl("one");
  const prop2 = new PropertyDeclarationImpl("two");

  const ctor_A = new ConstructorDeclarationImpl;

  const method3 = new MethodDeclarationImpl("three");
  method3.isStatic = true;
  const method4 = new MethodDeclarationImpl("four");

  memberMap.addMembers([
    prop1, prop2, ctor_A, method3, method4
  ]);

  expect(memberMap.get("one")).toBe(prop1);
  expect(memberMap.get("two")).toBe(prop2);
  expect(memberMap.get("static three")).toBe(method3);
  expect(memberMap.get("four")).toBe(method4);
  expect(memberMap.get("constructor")).toBe(ctor_A);
  expect(memberMap.size).toBe(5);

  expect<readonly PropertyDeclarationImpl[]>(
    memberMap.arrayOfKind<StructureKind.Property>(StructureKind.Property)
  ).toEqual([prop1, prop2]);

  expect<readonly MethodDeclarationImpl[]>(
    memberMap.arrayOfKind<StructureKind.Method>(StructureKind.Method)
  ).toEqual([method3, method4])

  expect<readonly ConstructorDeclarationImpl[]>(
    memberMap.arrayOfKind<StructureKind.Constructor>(StructureKind.Constructor)
  ).toEqual([ctor_A]);
});
