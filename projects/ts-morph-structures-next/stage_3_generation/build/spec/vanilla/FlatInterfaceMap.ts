import FlatInterfaceMap from "../../../vanilla/FlatInterfaceMap.js";
import initializeTypes from "../../../vanilla/initializer.js";

it("FlatInterfaceMap collects all the properties", () => {
  initializeTypes();

  const DecoratorSpecific = FlatInterfaceMap.get("DecoratorSpecificStructure");
  expect(DecoratorSpecific).withContext("DecoratorSpecificStructure").toBeDefined();
  if (!DecoratorSpecific)
    return;
  expect(
    DecoratorSpecific.properties.find(prop => prop.name === "typeArguments")
  ).withContext("DecoratorSpecificStructure.typeArguments").toBeTruthy();

  const MethodDecl = FlatInterfaceMap.get("MethodDeclarationStructure");
  expect(MethodDecl).withContext("MethodDeclarationStructure").toBeDefined();
  if (!MethodDecl)
    return;

  expect(
    MethodDecl.properties.find(prop => prop.name === "name")
  ).withContext("MethodDeclarationStructure.name").toBeTruthy();
});
