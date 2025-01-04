# ts-morph Structures Reference

## Table of contents

- [AbstractableNodeStructure](#abstractablenodestructure)
- [AmbientableNodeStructure](#ambientablenodestructure)
- [AsyncableNodeStructure](#asyncablenodestructure)
- [BindingNamedNodeStructure](#bindingnamednodestructure)
- [CallSignatureDeclarationSpecificStructure](#callsignaturedeclarationspecificstructure)
- [CallSignatureDeclarationStructure](#callsignaturedeclarationstructure)
- [ClassDeclarationSpecificStructure](#classdeclarationspecificstructure)
- [ClassDeclarationStructure](#classdeclarationstructure)
- [ClassLikeDeclarationBaseSpecificStructure](#classlikedeclarationbasespecificstructure)
- [ClassLikeDeclarationBaseStructure](#classlikedeclarationbasestructure)
- [ClassMemberStructures](#classmemberstructures)
- [ClassStaticBlockDeclarationSpecificStructure](#classstaticblockdeclarationspecificstructure)
- [ClassStaticBlockDeclarationStructure](#classstaticblockdeclarationstructure)
- [ConstructSignatureDeclarationSpecificStructure](#constructsignaturedeclarationspecificstructure)
- [ConstructSignatureDeclarationStructure](#constructsignaturedeclarationstructure)
- [ConstructorDeclarationOverloadSpecificStructure](#constructordeclarationoverloadspecificstructure)
- [ConstructorDeclarationOverloadStructure](#constructordeclarationoverloadstructure)
- [ConstructorDeclarationSpecificStructure](#constructordeclarationspecificstructure)
- [ConstructorDeclarationStructure](#constructordeclarationstructure)
- [DecoratableNodeStructure](#decoratablenodestructure)
- [DecoratorSpecificStructure](#decoratorspecificstructure)
- [DecoratorStructure](#decoratorstructure)
- [EnumDeclarationSpecificStructure](#enumdeclarationspecificstructure)
- [EnumDeclarationStructure](#enumdeclarationstructure)
- [EnumMemberSpecificStructure](#enummemberspecificstructure)
- [EnumMemberStructure](#enummemberstructure)
- [ExclamationTokenableNodeStructure](#exclamationtokenablenodestructure)
- [ExportAssignmentSpecificStructure](#exportassignmentspecificstructure)
- [ExportAssignmentStructure](#exportassignmentstructure)
- [ExportDeclarationSpecificStructure](#exportdeclarationspecificstructure)
- [ExportDeclarationStructure](#exportdeclarationstructure)
- [ExportSpecifierSpecificStructure](#exportspecifierspecificstructure)
- [ExportSpecifierStructure](#exportspecifierstructure)
- [ExportableNodeStructure](#exportablenodestructure)
- [ExpressionedNodeStructure](#expressionednodestructure)
- [ExtendsClauseableNodeStructure](#extendsclauseablenodestructure)
- [FunctionDeclarationOverloadSpecificStructure](#functiondeclarationoverloadspecificstructure)
- [FunctionDeclarationOverloadStructure](#functiondeclarationoverloadstructure)
- [FunctionDeclarationSpecificStructure](#functiondeclarationspecificstructure)
- [FunctionDeclarationStructure](#functiondeclarationstructure)
- [FunctionLikeDeclarationStructure](#functionlikedeclarationstructure)
- [GeneratorableNodeStructure](#generatorablenodestructure)
- [GetAccessorDeclarationSpecificStructure](#getaccessordeclarationspecificstructure)
- [GetAccessorDeclarationStructure](#getaccessordeclarationstructure)
- [ImplementsClauseableNodeStructure](#implementsclauseablenodestructure)
- [ImportAttributeNamedNodeStructure](#importattributenamednodestructure)
- [ImportAttributeStructure](#importattributestructure)
- [ImportAttributeStructureSpecificStructure](#importattributestructurespecificstructure)
- [ImportDeclarationSpecificStructure](#importdeclarationspecificstructure)
- [ImportDeclarationStructure](#importdeclarationstructure)
- [ImportSpecifierSpecificStructure](#importspecifierspecificstructure)
- [ImportSpecifierStructure](#importspecifierstructure)
- [IndexSignatureDeclarationSpecificStructure](#indexsignaturedeclarationspecificstructure)
- [IndexSignatureDeclarationStructure](#indexsignaturedeclarationstructure)
- [InitializerExpressionableNodeStructure](#initializerexpressionablenodestructure)
- [InterfaceDeclarationSpecificStructure](#interfacedeclarationspecificstructure)
- [InterfaceDeclarationStructure](#interfacedeclarationstructure)
- [InterfaceMemberStructures](#interfacememberstructures)
- [JSDocSpecificStructure](#jsdocspecificstructure)
- [JSDocStructure](#jsdocstructure)
- [JSDocTagSpecificStructure](#jsdoctagspecificstructure)
- [JSDocTagStructure](#jsdoctagstructure)
- [JSDocableNodeStructure](#jsdocablenodestructure)
- [JsxAttributeSpecificStructure](#jsxattributespecificstructure)
- [JsxAttributeStructure](#jsxattributestructure)
- [JsxAttributedNodeStructure](#jsxattributednodestructure)
- [JsxElementSpecificStructure](#jsxelementspecificstructure)
- [JsxElementStructure](#jsxelementstructure)
- [JsxSelfClosingElementSpecificStructure](#jsxselfclosingelementspecificstructure)
- [JsxSelfClosingElementStructure](#jsxselfclosingelementstructure)
- [JsxSpreadAttributeSpecificStructure](#jsxspreadattributespecificstructure)
- [JsxSpreadAttributeStructure](#jsxspreadattributestructure)
- [JsxStructures](#jsxstructures)
- [JsxTagNamedNodeStructure](#jsxtagnamednodestructure)
- [KindedStructure](#kindedstructure)
- [MethodDeclarationOverloadSpecificStructure](#methoddeclarationoverloadspecificstructure)
- [MethodDeclarationOverloadStructure](#methoddeclarationoverloadstructure)
- [MethodDeclarationSpecificStructure](#methoddeclarationspecificstructure)
- [MethodDeclarationStructure](#methoddeclarationstructure)
- [MethodSignatureSpecificStructure](#methodsignaturespecificstructure)
- [MethodSignatureStructure](#methodsignaturestructure)
- [ModuleDeclarationSpecificStructure](#moduledeclarationspecificstructure)
- [ModuleDeclarationStructure](#moduledeclarationstructure)
- [ModuleNamedNodeStructure](#modulenamednodestructure)
- [NameableNodeStructure](#nameablenodestructure)
- [NamedNodeStructure](#namednodestructure)
- [ObjectLiteralExpressionPropertyStructures](#objectliteralexpressionpropertystructures)
- [OverrideableNodeStructure](#overrideablenodestructure)
- [ParameterDeclarationSpecificStructure](#parameterdeclarationspecificstructure)
- [ParameterDeclarationStructure](#parameterdeclarationstructure)
- [ParameteredNodeStructure](#parameterednodestructure)
- [PropertyAssignmentSpecificStructure](#propertyassignmentspecificstructure)
- [PropertyAssignmentStructure](#propertyassignmentstructure)
- [PropertyDeclarationSpecificStructure](#propertydeclarationspecificstructure)
- [PropertyDeclarationStructure](#propertydeclarationstructure)
- [PropertyNamedNodeStructure](#propertynamednodestructure)
- [PropertySignatureSpecificStructure](#propertysignaturespecificstructure)
- [PropertySignatureStructure](#propertysignaturestructure)
- [QuestionTokenableNodeStructure](#questiontokenablenodestructure)
- [ReadonlyableNodeStructure](#readonlyablenodestructure)
- [ReturnTypedNodeStructure](#returntypednodestructure)
- [ScopeableNodeStructure](#scopeablenodestructure)
- [ScopedNodeStructure](#scopednodestructure)
- [SetAccessorDeclarationSpecificStructure](#setaccessordeclarationspecificstructure)
- [SetAccessorDeclarationStructure](#setaccessordeclarationstructure)
- [ShorthandPropertyAssignmentSpecificStructure](#shorthandpropertyassignmentspecificstructure)
- [ShorthandPropertyAssignmentStructure](#shorthandpropertyassignmentstructure)
- [SignaturedDeclarationStructure](#signatureddeclarationstructure)
- [SourceFileSpecificStructure](#sourcefilespecificstructure)
- [SourceFileStructure](#sourcefilestructure)
- [SpreadAssignmentSpecificStructure](#spreadassignmentspecificstructure)
- [SpreadAssignmentStructure](#spreadassignmentstructure)
- [StatementStructures](#statementstructures)
- [StatementedNodeStructure](#statementednodestructure)
- [StaticableNodeStructure](#staticablenodestructure)
- [Structure](#structure)
- [Structures](#structures)
- [TypeAliasDeclarationSpecificStructure](#typealiasdeclarationspecificstructure)
- [TypeAliasDeclarationStructure](#typealiasdeclarationstructure)
- [TypeElementMemberStructures](#typeelementmemberstructures)
- [TypeElementMemberedNodeStructure](#typeelementmemberednodestructure)
- [TypeParameterDeclarationSpecificStructure](#typeparameterdeclarationspecificstructure)
- [TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)
- [TypeParameteredNodeStructure](#typeparameterednodestructure)
- [TypedNodeStructure](#typednodestructure)
- [VariableDeclarationSpecificStructure](#variabledeclarationspecificstructure)
- [VariableDeclarationStructure](#variabledeclarationstructure)
- [VariableStatementSpecificStructure](#variablestatementspecificstructure)
- [VariableStatementStructure](#variablestatementstructure)

## Structures in ts-morph

### AbstractableNodeStructure

- isAbstract?: boolean;

### AmbientableNodeStructure

- hasDeclareKeyword?: boolean;

### AsyncableNodeStructure

- isAsync?: boolean;

### BindingNamedNodeStructure

- name: string;

### CallSignatureDeclarationSpecificStructure

- kind: StructureKind.CallSignature;

### CallSignatureDeclarationStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- kind: StructureKind.CallSignature;   From [CallSignatureDeclarationSpecificStructure](#callsignaturedeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- parameters?: OptionalKind<[ParameterDeclarationStructure](#parameterdeclarationstructure)>[];   From [ParameteredNodeStructure](#parameterednodestructure).
- returnType?: string \| WriterFunction;   From [ReturnTypedNodeStructure](#returntypednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### ClassDeclarationSpecificStructure

- kind: StructureKind.Class;

### ClassDeclarationStructure

- ctors?: OptionalKind<[ConstructorDeclarationStructure](#constructordeclarationstructure)>[];   From [ClassLikeDeclarationBaseSpecificStructure](#classlikedeclarationbasespecificstructure).
- decorators?: OptionalKind<[DecoratorStructure](#decoratorstructure)>[];   From [DecoratableNodeStructure](#decoratablenodestructure).
- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- extends?: string \| WriterFunction;   From [ClassLikeDeclarationBaseSpecificStructure](#classlikedeclarationbasespecificstructure).
- getAccessors?: OptionalKind<[GetAccessorDeclarationStructure](#getaccessordeclarationstructure)>[];   From [ClassLikeDeclarationBaseSpecificStructure](#classlikedeclarationbasespecificstructure).
- hasDeclareKeyword?: boolean;   From [AmbientableNodeStructure](#ambientablenodestructure).
- implements?: (string \| WriterFunction)[] \| WriterFunction;   From [ImplementsClauseableNodeStructure](#implementsclauseablenodestructure).
- isAbstract?: boolean;   From [AbstractableNodeStructure](#abstractablenodestructure).
- isDefaultExport?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- isExported?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- kind: StructureKind.Class;   From [ClassDeclarationSpecificStructure](#classdeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- methods?: OptionalKind<[MethodDeclarationStructure](#methoddeclarationstructure)>[];   From [ClassLikeDeclarationBaseSpecificStructure](#classlikedeclarationbasespecificstructure).
- name?: string;   From [NameableNodeStructure](#nameablenodestructure).
- name?: string; The class name.
- properties?: OptionalKind<[PropertyDeclarationStructure](#propertydeclarationstructure)>[];   From [ClassLikeDeclarationBaseSpecificStructure](#classlikedeclarationbasespecificstructure).
- setAccessors?: OptionalKind<[SetAccessorDeclarationStructure](#setaccessordeclarationstructure)>[];   From [ClassLikeDeclarationBaseSpecificStructure](#classlikedeclarationbasespecificstructure).
- staticBlocks?: OptionalKind<[ClassStaticBlockDeclarationStructure](#classstaticblockdeclarationstructure)>[];   From [ClassLikeDeclarationBaseSpecificStructure](#classlikedeclarationbasespecificstructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### ClassLikeDeclarationBaseSpecificStructure

- ctors?: OptionalKind<[ConstructorDeclarationStructure](#constructordeclarationstructure)>[];
- extends?: string \| WriterFunction;
- getAccessors?: OptionalKind<[GetAccessorDeclarationStructure](#getaccessordeclarationstructure)>[];
- methods?: OptionalKind<[MethodDeclarationStructure](#methoddeclarationstructure)>[];
- properties?: OptionalKind<[PropertyDeclarationStructure](#propertydeclarationstructure)>[];
- setAccessors?: OptionalKind<[SetAccessorDeclarationStructure](#setaccessordeclarationstructure)>[];
- staticBlocks?: OptionalKind<[ClassStaticBlockDeclarationStructure](#classstaticblockdeclarationstructure)>[];

### ClassLikeDeclarationBaseStructure

- ctors?: OptionalKind<[ConstructorDeclarationStructure](#constructordeclarationstructure)>[];   From [ClassLikeDeclarationBaseSpecificStructure](#classlikedeclarationbasespecificstructure).
- decorators?: OptionalKind<[DecoratorStructure](#decoratorstructure)>[];   From [DecoratableNodeStructure](#decoratablenodestructure).
- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- extends?: string \| WriterFunction;   From [ClassLikeDeclarationBaseSpecificStructure](#classlikedeclarationbasespecificstructure).
- getAccessors?: OptionalKind<[GetAccessorDeclarationStructure](#getaccessordeclarationstructure)>[];   From [ClassLikeDeclarationBaseSpecificStructure](#classlikedeclarationbasespecificstructure).
- implements?: (string \| WriterFunction)[] \| WriterFunction;   From [ImplementsClauseableNodeStructure](#implementsclauseablenodestructure).
- isAbstract?: boolean;   From [AbstractableNodeStructure](#abstractablenodestructure).
- methods?: OptionalKind<[MethodDeclarationStructure](#methoddeclarationstructure)>[];   From [ClassLikeDeclarationBaseSpecificStructure](#classlikedeclarationbasespecificstructure).
- name?: string;   From [NameableNodeStructure](#nameablenodestructure).
- properties?: OptionalKind<[PropertyDeclarationStructure](#propertydeclarationstructure)>[];   From [ClassLikeDeclarationBaseSpecificStructure](#classlikedeclarationbasespecificstructure).
- setAccessors?: OptionalKind<[SetAccessorDeclarationStructure](#setaccessordeclarationstructure)>[];   From [ClassLikeDeclarationBaseSpecificStructure](#classlikedeclarationbasespecificstructure).
- staticBlocks?: OptionalKind<[ClassStaticBlockDeclarationStructure](#classstaticblockdeclarationstructure)>[];   From [ClassLikeDeclarationBaseSpecificStructure](#classlikedeclarationbasespecificstructure).
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### ClassMemberStructures

- [ClassStaticBlockDeclarationStructure](#classstaticblockdeclarationstructure)
- [ConstructorDeclarationStructure](#constructordeclarationstructure)
- [GetAccessorDeclarationStructure](#getaccessordeclarationstructure)
- [MethodDeclarationStructure](#methoddeclarationstructure)
- [PropertyDeclarationStructure](#propertydeclarationstructure)
- [SetAccessorDeclarationStructure](#setaccessordeclarationstructure)

### ClassStaticBlockDeclarationSpecificStructure

- kind: StructureKind.ClassStaticBlock;

### ClassStaticBlockDeclarationStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- kind: StructureKind.ClassStaticBlock;   From [ClassStaticBlockDeclarationSpecificStructure](#classstaticblockdeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- statements?: (string \| WriterFunction \| [StatementStructures](#statementstructures))[] \| string \| WriterFunction;   From [StatementedNodeStructure](#statementednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### ConstructSignatureDeclarationSpecificStructure

- kind: StructureKind.ConstructSignature;

### ConstructSignatureDeclarationStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- kind: StructureKind.ConstructSignature;   From [ConstructSignatureDeclarationSpecificStructure](#constructsignaturedeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- parameters?: OptionalKind<[ParameterDeclarationStructure](#parameterdeclarationstructure)>[];   From [ParameteredNodeStructure](#parameterednodestructure).
- returnType?: string \| WriterFunction;   From [ReturnTypedNodeStructure](#returntypednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### ConstructorDeclarationOverloadSpecificStructure

- kind: StructureKind.ConstructorOverload;

### ConstructorDeclarationOverloadStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- kind: StructureKind.ConstructorOverload;   From [ConstructorDeclarationOverloadSpecificStructure](#constructordeclarationoverloadspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- parameters?: OptionalKind<[ParameterDeclarationStructure](#parameterdeclarationstructure)>[];   From [ParameteredNodeStructure](#parameterednodestructure).
- returnType?: string \| WriterFunction;   From [ReturnTypedNodeStructure](#returntypednodestructure).
- scope?: Scope;   From [ScopedNodeStructure](#scopednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### ConstructorDeclarationSpecificStructure

- kind: StructureKind.Constructor;
- overloads?: OptionalKind<[ConstructorDeclarationOverloadStructure](#constructordeclarationoverloadstructure)>[];

### ConstructorDeclarationStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- kind: StructureKind.Constructor;   From [ConstructorDeclarationSpecificStructure](#constructordeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- overloads?: OptionalKind<[ConstructorDeclarationOverloadStructure](#constructordeclarationoverloadstructure)>[];   From [ConstructorDeclarationSpecificStructure](#constructordeclarationspecificstructure).
- parameters?: OptionalKind<[ParameterDeclarationStructure](#parameterdeclarationstructure)>[];   From [ParameteredNodeStructure](#parameterednodestructure).
- returnType?: string \| WriterFunction;   From [ReturnTypedNodeStructure](#returntypednodestructure).
- scope?: Scope;   From [ScopedNodeStructure](#scopednodestructure).
- statements?: (string \| WriterFunction \| [StatementStructures](#statementstructures))[] \| string \| WriterFunction;   From [StatementedNodeStructure](#statementednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### DecoratableNodeStructure

- decorators?: OptionalKind<[DecoratorStructure](#decoratorstructure)>[];

### DecoratorSpecificStructure

- arguments?: (string \| WriterFunction)[] \| WriterFunction; Arguments for a decorator factory.
- kind: StructureKind.Decorator;
- name: string;
- typeArguments?: string[];

### DecoratorStructure

- arguments?: (string \| WriterFunction)[] \| WriterFunction; Arguments for a decorator factory.  From [DecoratorSpecificStructure](#decoratorspecificstructure).
- kind: StructureKind.Decorator;   From [DecoratorSpecificStructure](#decoratorspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [DecoratorSpecificStructure](#decoratorspecificstructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- typeArguments?: string[];   From [DecoratorSpecificStructure](#decoratorspecificstructure).

### EnumDeclarationSpecificStructure

- isConst?: boolean;
- kind: StructureKind.Enum;
- members?: OptionalKind<[EnumMemberStructure](#enummemberstructure)>[];

### EnumDeclarationStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- hasDeclareKeyword?: boolean;   From [AmbientableNodeStructure](#ambientablenodestructure).
- isConst?: boolean;   From [EnumDeclarationSpecificStructure](#enumdeclarationspecificstructure).
- isDefaultExport?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- isExported?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- kind: StructureKind.Enum;   From [EnumDeclarationSpecificStructure](#enumdeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- members?: OptionalKind<[EnumMemberStructure](#enummemberstructure)>[];   From [EnumDeclarationSpecificStructure](#enumdeclarationspecificstructure).
- name: string;   From [NamedNodeStructure](#namednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### EnumMemberSpecificStructure

- kind: StructureKind.EnumMember;
- value?: number \| string; Convenience property for setting the initializer.

### EnumMemberStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- initializer?: string \| WriterFunction;   From [InitializerExpressionableNodeStructure](#initializerexpressionablenodestructure).
- kind: StructureKind.EnumMember;   From [EnumMemberSpecificStructure](#enummemberspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [PropertyNamedNodeStructure](#propertynamednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- value?: number \| string; Convenience property for setting the initializer.  From [EnumMemberSpecificStructure](#enummemberspecificstructure).

### ExclamationTokenableNodeStructure

- hasExclamationToken?: boolean;

### ExportAssignmentSpecificStructure

- expression: string \| WriterFunction;
- isExportEquals?: boolean;
- kind: StructureKind.ExportAssignment;

### ExportAssignmentStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- expression: string \| WriterFunction;   From [ExportAssignmentSpecificStructure](#exportassignmentspecificstructure).
- isExportEquals?: boolean;   From [ExportAssignmentSpecificStructure](#exportassignmentspecificstructure).
- kind: StructureKind.ExportAssignment;   From [ExportAssignmentSpecificStructure](#exportassignmentspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### ExportDeclarationSpecificStructure

- attributes?: OptionalKind<[ImportAttributeStructure](#importattributestructure)>[] \| undefined;
- isTypeOnly?: boolean;
- kind: StructureKind.ExportDeclaration;
- moduleSpecifier?: string;
- namedExports?: (string \| OptionalKind<[ExportSpecifierStructure](#exportspecifierstructure)> \| WriterFunction)[] \| WriterFunction;
- namespaceExport?: string;

### ExportDeclarationStructure

- attributes?: OptionalKind<[ImportAttributeStructure](#importattributestructure)>[] \| undefined;   From [ExportDeclarationSpecificStructure](#exportdeclarationspecificstructure).
- isTypeOnly?: boolean;   From [ExportDeclarationSpecificStructure](#exportdeclarationspecificstructure).
- kind: StructureKind.ExportDeclaration;   From [ExportDeclarationSpecificStructure](#exportdeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- moduleSpecifier?: string;   From [ExportDeclarationSpecificStructure](#exportdeclarationspecificstructure).
- namedExports?: (string \| OptionalKind<[ExportSpecifierStructure](#exportspecifierstructure)> \| WriterFunction)[] \| WriterFunction;   From [ExportDeclarationSpecificStructure](#exportdeclarationspecificstructure).
- namespaceExport?: string;   From [ExportDeclarationSpecificStructure](#exportdeclarationspecificstructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### ExportSpecifierSpecificStructure

- alias?: string;
- isTypeOnly?: boolean;
- kind: StructureKind.ExportSpecifier;
- name: string;

### ExportSpecifierStructure

- alias?: string;   From [ExportSpecifierSpecificStructure](#exportspecifierspecificstructure).
- isTypeOnly?: boolean;   From [ExportSpecifierSpecificStructure](#exportspecifierspecificstructure).
- kind: StructureKind.ExportSpecifier;   From [ExportSpecifierSpecificStructure](#exportspecifierspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [ExportSpecifierSpecificStructure](#exportspecifierspecificstructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### ExportableNodeStructure

- isDefaultExport?: boolean;
- isExported?: boolean;

### ExpressionedNodeStructure

- expression: string \| WriterFunction;

### ExtendsClauseableNodeStructure

- extends?: (string \| WriterFunction)[] \| WriterFunction;

### FunctionDeclarationOverloadSpecificStructure

- kind: StructureKind.FunctionOverload;

### FunctionDeclarationOverloadStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- hasDeclareKeyword?: boolean;   From [AmbientableNodeStructure](#ambientablenodestructure).
- isAsync?: boolean;   From [AsyncableNodeStructure](#asyncablenodestructure).
- isDefaultExport?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- isExported?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- isGenerator?: boolean;   From [GeneratorableNodeStructure](#generatorablenodestructure).
- kind: StructureKind.FunctionOverload;   From [FunctionDeclarationOverloadSpecificStructure](#functiondeclarationoverloadspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- parameters?: OptionalKind<[ParameterDeclarationStructure](#parameterdeclarationstructure)>[];   From [ParameteredNodeStructure](#parameterednodestructure).
- returnType?: string \| WriterFunction;   From [ReturnTypedNodeStructure](#returntypednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### FunctionDeclarationSpecificStructure

- kind: StructureKind.Function;
- overloads?: OptionalKind<[FunctionDeclarationOverloadStructure](#functiondeclarationoverloadstructure)>[];

### FunctionDeclarationStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- hasDeclareKeyword?: boolean;   From [AmbientableNodeStructure](#ambientablenodestructure).
- isAsync?: boolean;   From [AsyncableNodeStructure](#asyncablenodestructure).
- isDefaultExport?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- isExported?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- isGenerator?: boolean;   From [GeneratorableNodeStructure](#generatorablenodestructure).
- kind: StructureKind.Function;   From [FunctionDeclarationSpecificStructure](#functiondeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name?: string;   From [NameableNodeStructure](#nameablenodestructure).
- overloads?: OptionalKind<[FunctionDeclarationOverloadStructure](#functiondeclarationoverloadstructure)>[];   From [FunctionDeclarationSpecificStructure](#functiondeclarationspecificstructure).
- parameters?: OptionalKind<[ParameterDeclarationStructure](#parameterdeclarationstructure)>[];   From [ParameteredNodeStructure](#parameterednodestructure).
- returnType?: string \| WriterFunction;   From [ReturnTypedNodeStructure](#returntypednodestructure).
- statements?: (string \| WriterFunction \| [StatementStructures](#statementstructures))[] \| string \| WriterFunction;   From [StatementedNodeStructure](#statementednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### FunctionLikeDeclarationStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- parameters?: OptionalKind<[ParameterDeclarationStructure](#parameterdeclarationstructure)>[];   From [ParameteredNodeStructure](#parameterednodestructure).
- returnType?: string \| WriterFunction;   From [ReturnTypedNodeStructure](#returntypednodestructure).
- statements?: (string \| WriterFunction \| [StatementStructures](#statementstructures))[] \| string \| WriterFunction;   From [StatementedNodeStructure](#statementednodestructure).
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### GeneratorableNodeStructure

- isGenerator?: boolean;

### GetAccessorDeclarationSpecificStructure

- kind: StructureKind.GetAccessor;

### GetAccessorDeclarationStructure

- decorators?: OptionalKind<[DecoratorStructure](#decoratorstructure)>[];   From [DecoratableNodeStructure](#decoratablenodestructure).
- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- isAbstract?: boolean;   From [AbstractableNodeStructure](#abstractablenodestructure).
- isStatic?: boolean;   From [StaticableNodeStructure](#staticablenodestructure).
- kind: StructureKind.GetAccessor;   From [GetAccessorDeclarationSpecificStructure](#getaccessordeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [PropertyNamedNodeStructure](#propertynamednodestructure).
- parameters?: OptionalKind<[ParameterDeclarationStructure](#parameterdeclarationstructure)>[];   From [ParameteredNodeStructure](#parameterednodestructure).
- returnType?: string \| WriterFunction;   From [ReturnTypedNodeStructure](#returntypednodestructure).
- scope?: Scope;   From [ScopedNodeStructure](#scopednodestructure).
- statements?: (string \| WriterFunction \| [StatementStructures](#statementstructures))[] \| string \| WriterFunction;   From [StatementedNodeStructure](#statementednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### ImplementsClauseableNodeStructure

- implements?: (string \| WriterFunction)[] \| WriterFunction;

### ImportAttributeNamedNodeStructure

- name: string;

### ImportAttributeStructure

- kind: StructureKind.ImportAttribute;   From [ImportAttributeStructureSpecificStructure](#importattributestructurespecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [ImportAttributeNamedNodeStructure](#importattributenamednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- value: string; Expression value. Quote this when providing a string.  From [ImportAttributeStructureSpecificStructure](#importattributestructurespecificstructure).

### ImportAttributeStructureSpecificStructure

- kind: StructureKind.ImportAttribute;
- value: string; Expression value. Quote this when providing a string.

### ImportDeclarationSpecificStructure

- attributes?: OptionalKind<[ImportAttributeStructure](#importattributestructure)>[] \| undefined;
- defaultImport?: string;
- isTypeOnly?: boolean;
- kind: StructureKind.ImportDeclaration;
- moduleSpecifier: string;
- namedImports?: (OptionalKind<[ImportSpecifierStructure](#importspecifierstructure)> \| string \| WriterFunction)[] \| WriterFunction;
- namespaceImport?: string;

### ImportDeclarationStructure

- attributes?: OptionalKind<[ImportAttributeStructure](#importattributestructure)>[] \| undefined;   From [ImportDeclarationSpecificStructure](#importdeclarationspecificstructure).
- defaultImport?: string;   From [ImportDeclarationSpecificStructure](#importdeclarationspecificstructure).
- isTypeOnly?: boolean;   From [ImportDeclarationSpecificStructure](#importdeclarationspecificstructure).
- kind: StructureKind.ImportDeclaration;   From [ImportDeclarationSpecificStructure](#importdeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- moduleSpecifier: string;   From [ImportDeclarationSpecificStructure](#importdeclarationspecificstructure).
- namedImports?: (OptionalKind<[ImportSpecifierStructure](#importspecifierstructure)> \| string \| WriterFunction)[] \| WriterFunction;   From [ImportDeclarationSpecificStructure](#importdeclarationspecificstructure).
- namespaceImport?: string;   From [ImportDeclarationSpecificStructure](#importdeclarationspecificstructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### ImportSpecifierSpecificStructure

- alias?: string;
- isTypeOnly?: boolean;
- kind: StructureKind.ImportSpecifier;
- name: string;

### ImportSpecifierStructure

- alias?: string;   From [ImportSpecifierSpecificStructure](#importspecifierspecificstructure).
- isTypeOnly?: boolean;   From [ImportSpecifierSpecificStructure](#importspecifierspecificstructure).
- kind: StructureKind.ImportSpecifier;   From [ImportSpecifierSpecificStructure](#importspecifierspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [ImportSpecifierSpecificStructure](#importspecifierspecificstructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### IndexSignatureDeclarationSpecificStructure

- keyName?: string;
- keyType?: string;
- kind: StructureKind.IndexSignature;

### IndexSignatureDeclarationStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- isReadonly?: boolean;   From [ReadonlyableNodeStructure](#readonlyablenodestructure).
- keyName?: string;   From [IndexSignatureDeclarationSpecificStructure](#indexsignaturedeclarationspecificstructure).
- keyType?: string;   From [IndexSignatureDeclarationSpecificStructure](#indexsignaturedeclarationspecificstructure).
- kind: StructureKind.IndexSignature;   From [IndexSignatureDeclarationSpecificStructure](#indexsignaturedeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- returnType?: string \| WriterFunction;   From [ReturnTypedNodeStructure](#returntypednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### InitializerExpressionableNodeStructure

- initializer?: string \| WriterFunction;

### InterfaceDeclarationSpecificStructure

- kind: StructureKind.Interface;

### InterfaceDeclarationStructure

- callSignatures?: OptionalKind<[CallSignatureDeclarationStructure](#callsignaturedeclarationstructure)>[];   From [TypeElementMemberedNodeStructure](#typeelementmemberednodestructure).
- constructSignatures?: OptionalKind<[ConstructSignatureDeclarationStructure](#constructsignaturedeclarationstructure)>[];   From [TypeElementMemberedNodeStructure](#typeelementmemberednodestructure).
- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- extends?: (string \| WriterFunction)[] \| WriterFunction;   From [ExtendsClauseableNodeStructure](#extendsclauseablenodestructure).
- getAccessors?: OptionalKind<[GetAccessorDeclarationStructure](#getaccessordeclarationstructure)>[];   From [TypeElementMemberedNodeStructure](#typeelementmemberednodestructure).
- hasDeclareKeyword?: boolean;   From [AmbientableNodeStructure](#ambientablenodestructure).
- indexSignatures?: OptionalKind<[IndexSignatureDeclarationStructure](#indexsignaturedeclarationstructure)>[];   From [TypeElementMemberedNodeStructure](#typeelementmemberednodestructure).
- isDefaultExport?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- isExported?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- kind: StructureKind.Interface;   From [InterfaceDeclarationSpecificStructure](#interfacedeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- methods?: OptionalKind<[MethodSignatureStructure](#methodsignaturestructure)>[];   From [TypeElementMemberedNodeStructure](#typeelementmemberednodestructure).
- name: string;   From [NamedNodeStructure](#namednodestructure).
- properties?: OptionalKind<[PropertySignatureStructure](#propertysignaturestructure)>[];   From [TypeElementMemberedNodeStructure](#typeelementmemberednodestructure).
- setAccessors?: OptionalKind<[SetAccessorDeclarationStructure](#setaccessordeclarationstructure)>[];   From [TypeElementMemberedNodeStructure](#typeelementmemberednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### InterfaceMemberStructures

- TypeElementMemberStructures
  - [CallSignatureDeclarationStructure](#callsignaturedeclarationstructure)
  - [ConstructSignatureDeclarationStructure](#constructsignaturedeclarationstructure)
  - [IndexSignatureDeclarationStructure](#indexsignaturedeclarationstructure)
  - [MethodSignatureStructure](#methodsignaturestructure)
  - [PropertySignatureStructure](#propertysignaturestructure)

### JSDocSpecificStructure

- description?: string \| WriterFunction; The description of the JS doc.
- kind: StructureKind.JSDoc;
- tags?: OptionalKind<[JSDocTagStructure](#jsdoctagstructure)>[]; JS doc tags (ex. `&#64;param value - Some description.`).

### JSDocStructure

- description?: string \| WriterFunction; The description of the JS doc.  From [JSDocSpecificStructure](#jsdocspecificstructure).
- kind: StructureKind.JSDoc;   From [JSDocSpecificStructure](#jsdocspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- tags?: OptionalKind<[JSDocTagStructure](#jsdoctagstructure)>[]; JS doc tags (ex. `&#64;param value - Some description.`).  From [JSDocSpecificStructure](#jsdocspecificstructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### JSDocTagSpecificStructure

- kind: StructureKind.JSDocTag;
- tagName: string; The name for the JS doc tag that comes after the "at" symbol.
- text?: string \| WriterFunction; The text that follows the tag name.

### JSDocTagStructure

- kind: StructureKind.JSDocTag;   From [JSDocTagSpecificStructure](#jsdoctagspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- tagName: string; The name for the JS doc tag that comes after the "at" symbol.  From [JSDocTagSpecificStructure](#jsdoctagspecificstructure).
- text?: string \| WriterFunction; The text that follows the tag name.  From [JSDocTagSpecificStructure](#jsdoctagspecificstructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### JSDocableNodeStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];

### JsxAttributeSpecificStructure

- initializer?: string;
- kind: StructureKind.JsxAttribute;
- name: string \| JsxNamespacedNameStructure;

### JsxAttributeStructure

- initializer?: string;   From [JsxAttributeSpecificStructure](#jsxattributespecificstructure).
- kind: StructureKind.JsxAttribute;   From [JsxAttributeSpecificStructure](#jsxattributespecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string \| JsxNamespacedNameStructure;   From [JsxAttributeSpecificStructure](#jsxattributespecificstructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### JsxAttributedNodeStructure

- attributes?: (OptionalKind<[JsxAttributeStructure](#jsxattributestructure)> \| [JsxSpreadAttributeStructure](#jsxspreadattributestructure))[];

### JsxElementSpecificStructure

- attributes?: (OptionalKind<[JsxAttributeStructure](#jsxattributestructure)> \| [JsxSpreadAttributeStructure](#jsxspreadattributestructure))[];
- bodyText?: string;
- children?: (OptionalKind<[JsxElementStructure](#jsxelementstructure)> \| [JsxSelfClosingElementStructure](#jsxselfclosingelementstructure))[];
- kind: StructureKind.JsxElement;
- name: string;

### JsxElementStructure

- attributes?: (OptionalKind<[JsxAttributeStructure](#jsxattributestructure)> \| [JsxSpreadAttributeStructure](#jsxspreadattributestructure))[];   From [JsxElementSpecificStructure](#jsxelementspecificstructure).
- bodyText?: string;   From [JsxElementSpecificStructure](#jsxelementspecificstructure).
- children?: (OptionalKind<[JsxElementStructure](#jsxelementstructure)> \| [JsxSelfClosingElementStructure](#jsxselfclosingelementstructure))[];   From [JsxElementSpecificStructure](#jsxelementspecificstructure).
- kind: StructureKind.JsxElement;   From [JsxElementSpecificStructure](#jsxelementspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [JsxElementSpecificStructure](#jsxelementspecificstructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### JsxSelfClosingElementSpecificStructure

- kind: StructureKind.JsxSelfClosingElement;

### JsxSelfClosingElementStructure

- attributes?: (OptionalKind<[JsxAttributeStructure](#jsxattributestructure)> \| [JsxSpreadAttributeStructure](#jsxspreadattributestructure))[];   From [JsxAttributedNodeStructure](#jsxattributednodestructure).
- kind: StructureKind.JsxSelfClosingElement;   From [JsxSelfClosingElementSpecificStructure](#jsxselfclosingelementspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [JsxTagNamedNodeStructure](#jsxtagnamednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### JsxSpreadAttributeSpecificStructure

- expression: string;
- kind: StructureKind.JsxSpreadAttribute;

### JsxSpreadAttributeStructure

- expression: string;   From [JsxSpreadAttributeSpecificStructure](#jsxspreadattributespecificstructure).
- kind: StructureKind.JsxSpreadAttribute;   From [JsxSpreadAttributeSpecificStructure](#jsxspreadattributespecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### JsxStructures

- [JsxAttributeStructure](#jsxattributestructure)
- [JsxElementStructure](#jsxelementstructure)
- [JsxSelfClosingElementStructure](#jsxselfclosingelementstructure)
- [JsxSpreadAttributeStructure](#jsxspreadattributestructure)

### JsxTagNamedNodeStructure

- name: string;

### KindedStructure

- kind: TKind;

### MethodDeclarationOverloadSpecificStructure

- kind: StructureKind.MethodOverload;

### MethodDeclarationOverloadStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- hasOverrideKeyword?: boolean;   From [OverrideableNodeStructure](#overrideablenodestructure).
- hasQuestionToken?: boolean;   From [QuestionTokenableNodeStructure](#questiontokenablenodestructure).
- isAbstract?: boolean;   From [AbstractableNodeStructure](#abstractablenodestructure).
- isAsync?: boolean;   From [AsyncableNodeStructure](#asyncablenodestructure).
- isGenerator?: boolean;   From [GeneratorableNodeStructure](#generatorablenodestructure).
- isStatic?: boolean;   From [StaticableNodeStructure](#staticablenodestructure).
- kind: StructureKind.MethodOverload;   From [MethodDeclarationOverloadSpecificStructure](#methoddeclarationoverloadspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- parameters?: OptionalKind<[ParameterDeclarationStructure](#parameterdeclarationstructure)>[];   From [ParameteredNodeStructure](#parameterednodestructure).
- returnType?: string \| WriterFunction;   From [ReturnTypedNodeStructure](#returntypednodestructure).
- scope?: Scope;   From [ScopedNodeStructure](#scopednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### MethodDeclarationSpecificStructure

- kind: StructureKind.Method;
- overloads?: OptionalKind<[MethodDeclarationOverloadStructure](#methoddeclarationoverloadstructure)>[];

### MethodDeclarationStructure

- decorators?: OptionalKind<[DecoratorStructure](#decoratorstructure)>[];   From [DecoratableNodeStructure](#decoratablenodestructure).
- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- hasOverrideKeyword?: boolean;   From [OverrideableNodeStructure](#overrideablenodestructure).
- hasQuestionToken?: boolean;   From [QuestionTokenableNodeStructure](#questiontokenablenodestructure).
- isAbstract?: boolean;   From [AbstractableNodeStructure](#abstractablenodestructure).
- isAsync?: boolean;   From [AsyncableNodeStructure](#asyncablenodestructure).
- isGenerator?: boolean;   From [GeneratorableNodeStructure](#generatorablenodestructure).
- isStatic?: boolean;   From [StaticableNodeStructure](#staticablenodestructure).
- kind: StructureKind.Method;   From [MethodDeclarationSpecificStructure](#methoddeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [PropertyNamedNodeStructure](#propertynamednodestructure).
- overloads?: OptionalKind<[MethodDeclarationOverloadStructure](#methoddeclarationoverloadstructure)>[];   From [MethodDeclarationSpecificStructure](#methoddeclarationspecificstructure).
- parameters?: OptionalKind<[ParameterDeclarationStructure](#parameterdeclarationstructure)>[];   From [ParameteredNodeStructure](#parameterednodestructure).
- returnType?: string \| WriterFunction;   From [ReturnTypedNodeStructure](#returntypednodestructure).
- scope?: Scope;   From [ScopedNodeStructure](#scopednodestructure).
- statements?: (string \| WriterFunction \| [StatementStructures](#statementstructures))[] \| string \| WriterFunction;   From [StatementedNodeStructure](#statementednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### MethodSignatureSpecificStructure

- kind: StructureKind.MethodSignature;

### MethodSignatureStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- hasQuestionToken?: boolean;   From [QuestionTokenableNodeStructure](#questiontokenablenodestructure).
- kind: StructureKind.MethodSignature;   From [MethodSignatureSpecificStructure](#methodsignaturespecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [PropertyNamedNodeStructure](#propertynamednodestructure).
- parameters?: OptionalKind<[ParameterDeclarationStructure](#parameterdeclarationstructure)>[];   From [ParameteredNodeStructure](#parameterednodestructure).
- returnType?: string \| WriterFunction;   From [ReturnTypedNodeStructure](#returntypednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### ModuleDeclarationSpecificStructure

- declarationKind?: ModuleDeclarationKind; The module declaration kind.
- kind: StructureKind.Module;

### ModuleDeclarationStructure

- declarationKind?: ModuleDeclarationKind; The module declaration kind.  From [ModuleDeclarationSpecificStructure](#moduledeclarationspecificstructure).
- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- hasDeclareKeyword?: boolean;   From [AmbientableNodeStructure](#ambientablenodestructure).
- isDefaultExport?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- isExported?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- kind: StructureKind.Module;   From [ModuleDeclarationSpecificStructure](#moduledeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [ModuleNamedNodeStructure](#modulenamednodestructure).
- statements?: (string \| WriterFunction \| [StatementStructures](#statementstructures))[] \| string \| WriterFunction;   From [StatementedNodeStructure](#statementednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### ModuleNamedNodeStructure

- name: string;

### NameableNodeStructure

- name?: string;

### NamedNodeStructure

- name: string;

### ObjectLiteralExpressionPropertyStructures

- [GetAccessorDeclarationStructure](#getaccessordeclarationstructure)
- [MethodDeclarationStructure](#methoddeclarationstructure)
- [PropertyAssignmentStructure](#propertyassignmentstructure)
- [SetAccessorDeclarationStructure](#setaccessordeclarationstructure)
- [ShorthandPropertyAssignmentStructure](#shorthandpropertyassignmentstructure)
- [SpreadAssignmentStructure](#spreadassignmentstructure)

### OverrideableNodeStructure

- hasOverrideKeyword?: boolean;

### ParameterDeclarationSpecificStructure

- isRestParameter?: boolean;
- kind: StructureKind.Parameter;

### ParameterDeclarationStructure

- decorators?: OptionalKind<[DecoratorStructure](#decoratorstructure)>[];   From [DecoratableNodeStructure](#decoratablenodestructure).
- hasOverrideKeyword?: boolean;   From [OverrideableNodeStructure](#overrideablenodestructure).
- hasQuestionToken?: boolean;   From [QuestionTokenableNodeStructure](#questiontokenablenodestructure).
- initializer?: string \| WriterFunction;   From [InitializerExpressionableNodeStructure](#initializerexpressionablenodestructure).
- isReadonly?: boolean;   From [ReadonlyableNodeStructure](#readonlyablenodestructure).
- isRestParameter?: boolean;   From [ParameterDeclarationSpecificStructure](#parameterdeclarationspecificstructure).
- kind: StructureKind.Parameter;   From [ParameterDeclarationSpecificStructure](#parameterdeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [BindingNamedNodeStructure](#bindingnamednodestructure).
- scope?: Scope;   From [ScopeableNodeStructure](#scopeablenodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- type?: string \| WriterFunction;   From [TypedNodeStructure](#typednodestructure).

### ParameteredNodeStructure

- parameters?: OptionalKind<[ParameterDeclarationStructure](#parameterdeclarationstructure)>[];

### PropertyAssignmentSpecificStructure

- initializer: string \| WriterFunction;
- kind: StructureKind.PropertyAssignment;

### PropertyAssignmentStructure

- initializer: string \| WriterFunction;   From [PropertyAssignmentSpecificStructure](#propertyassignmentspecificstructure).
- kind: StructureKind.PropertyAssignment;   From [PropertyAssignmentSpecificStructure](#propertyassignmentspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [PropertyNamedNodeStructure](#propertynamednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### PropertyDeclarationSpecificStructure

- hasAccessorKeyword?: boolean;
- kind: StructureKind.Property;

### PropertyDeclarationStructure

- decorators?: OptionalKind<[DecoratorStructure](#decoratorstructure)>[];   From [DecoratableNodeStructure](#decoratablenodestructure).
- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- hasAccessorKeyword?: boolean;   From [PropertyDeclarationSpecificStructure](#propertydeclarationspecificstructure).
- hasDeclareKeyword?: boolean;   From [AmbientableNodeStructure](#ambientablenodestructure).
- hasExclamationToken?: boolean;   From [ExclamationTokenableNodeStructure](#exclamationtokenablenodestructure).
- hasOverrideKeyword?: boolean;   From [OverrideableNodeStructure](#overrideablenodestructure).
- hasQuestionToken?: boolean;   From [QuestionTokenableNodeStructure](#questiontokenablenodestructure).
- initializer?: string \| WriterFunction;   From [InitializerExpressionableNodeStructure](#initializerexpressionablenodestructure).
- isAbstract?: boolean;   From [AbstractableNodeStructure](#abstractablenodestructure).
- isReadonly?: boolean;   From [ReadonlyableNodeStructure](#readonlyablenodestructure).
- isStatic?: boolean;   From [StaticableNodeStructure](#staticablenodestructure).
- kind: StructureKind.Property;   From [PropertyDeclarationSpecificStructure](#propertydeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [PropertyNamedNodeStructure](#propertynamednodestructure).
- scope?: Scope;   From [ScopedNodeStructure](#scopednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- type?: string \| WriterFunction;   From [TypedNodeStructure](#typednodestructure).

### PropertyNamedNodeStructure

- name: string;

### PropertySignatureSpecificStructure

- kind: StructureKind.PropertySignature;

### PropertySignatureStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- hasQuestionToken?: boolean;   From [QuestionTokenableNodeStructure](#questiontokenablenodestructure).
- initializer?: string \| WriterFunction;   From [InitializerExpressionableNodeStructure](#initializerexpressionablenodestructure).
- isReadonly?: boolean;   From [ReadonlyableNodeStructure](#readonlyablenodestructure).
- kind: StructureKind.PropertySignature;   From [PropertySignatureSpecificStructure](#propertysignaturespecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [PropertyNamedNodeStructure](#propertynamednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- type?: string \| WriterFunction;   From [TypedNodeStructure](#typednodestructure).

### QuestionTokenableNodeStructure

- hasQuestionToken?: boolean;

### ReadonlyableNodeStructure

- isReadonly?: boolean;

### ReturnTypedNodeStructure

- returnType?: string \| WriterFunction;

### ScopeableNodeStructure

- scope?: Scope;

### ScopedNodeStructure

- scope?: Scope;

### SetAccessorDeclarationSpecificStructure

- kind: StructureKind.SetAccessor;

### SetAccessorDeclarationStructure

- decorators?: OptionalKind<[DecoratorStructure](#decoratorstructure)>[];   From [DecoratableNodeStructure](#decoratablenodestructure).
- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- isAbstract?: boolean;   From [AbstractableNodeStructure](#abstractablenodestructure).
- isStatic?: boolean;   From [StaticableNodeStructure](#staticablenodestructure).
- kind: StructureKind.SetAccessor;   From [SetAccessorDeclarationSpecificStructure](#setaccessordeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [PropertyNamedNodeStructure](#propertynamednodestructure).
- parameters?: OptionalKind<[ParameterDeclarationStructure](#parameterdeclarationstructure)>[];   From [ParameteredNodeStructure](#parameterednodestructure).
- returnType?: string \| WriterFunction;   From [ReturnTypedNodeStructure](#returntypednodestructure).
- scope?: Scope;   From [ScopedNodeStructure](#scopednodestructure).
- statements?: (string \| WriterFunction \| [StatementStructures](#statementstructures))[] \| string \| WriterFunction;   From [StatementedNodeStructure](#statementednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### ShorthandPropertyAssignmentSpecificStructure

- kind: StructureKind.ShorthandPropertyAssignment;

### ShorthandPropertyAssignmentStructure

- kind: StructureKind.ShorthandPropertyAssignment;   From [ShorthandPropertyAssignmentSpecificStructure](#shorthandpropertyassignmentspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [NamedNodeStructure](#namednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### SignaturedDeclarationStructure

- parameters?: OptionalKind<[ParameterDeclarationStructure](#parameterdeclarationstructure)>[];   From [ParameteredNodeStructure](#parameterednodestructure).
- returnType?: string \| WriterFunction;   From [ReturnTypedNodeStructure](#returntypednodestructure).

### SourceFileSpecificStructure

- kind: StructureKind.SourceFile;

### SourceFileStructure

- kind: StructureKind.SourceFile;   From [SourceFileSpecificStructure](#sourcefilespecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- statements?: (string \| WriterFunction \| [StatementStructures](#statementstructures))[] \| string \| WriterFunction;   From [StatementedNodeStructure](#statementednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### SpreadAssignmentSpecificStructure

- kind: StructureKind.SpreadAssignment;

### SpreadAssignmentStructure

- expression: string \| WriterFunction;   From [ExpressionedNodeStructure](#expressionednodestructure).
- kind: StructureKind.SpreadAssignment;   From [SpreadAssignmentSpecificStructure](#spreadassignmentspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).

### StatementStructures

- [ClassDeclarationStructure](#classdeclarationstructure)
- [EnumDeclarationStructure](#enumdeclarationstructure)
- [ExportAssignmentStructure](#exportassignmentstructure)
- [ExportDeclarationStructure](#exportdeclarationstructure)
- [FunctionDeclarationStructure](#functiondeclarationstructure)
- [ImportDeclarationStructure](#importdeclarationstructure)
- [InterfaceDeclarationStructure](#interfacedeclarationstructure)
- [ModuleDeclarationStructure](#moduledeclarationstructure)
- [TypeAliasDeclarationStructure](#typealiasdeclarationstructure)
- [VariableStatementStructure](#variablestatementstructure)

### StatementedNodeStructure

- statements?: (string \| WriterFunction \| [StatementStructures](#statementstructures))[] \| string \| WriterFunction;

### StaticableNodeStructure

- isStatic?: boolean;

### Structure

- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.

### Structures

- ClassMemberStructures
  - [ClassStaticBlockDeclarationStructure](#classstaticblockdeclarationstructure)
  - [ConstructorDeclarationStructure](#constructordeclarationstructure)
  - [GetAccessorDeclarationStructure](#getaccessordeclarationstructure)
  - [MethodDeclarationStructure](#methoddeclarationstructure)
  - [PropertyDeclarationStructure](#propertydeclarationstructure)
  - [SetAccessorDeclarationStructure](#setaccessordeclarationstructure)
- [ConstructorDeclarationOverloadStructure](#constructordeclarationoverloadstructure)
- [DecoratorStructure](#decoratorstructure)
- [EnumMemberStructure](#enummemberstructure)
- [ExportSpecifierStructure](#exportspecifierstructure)
- [FunctionDeclarationOverloadStructure](#functiondeclarationoverloadstructure)
- [ImportAttributeStructure](#importattributestructure)
- [ImportSpecifierStructure](#importspecifierstructure)
- InterfaceMemberStructures
  - TypeElementMemberStructures
    - [CallSignatureDeclarationStructure](#callsignaturedeclarationstructure)
    - [ConstructSignatureDeclarationStructure](#constructsignaturedeclarationstructure)
    - [IndexSignatureDeclarationStructure](#indexsignaturedeclarationstructure)
    - [MethodSignatureStructure](#methodsignaturestructure)
    - [PropertySignatureStructure](#propertysignaturestructure)
- [JSDocStructure](#jsdocstructure)
- [JSDocTagStructure](#jsdoctagstructure)
- JsxStructures
  - [JsxAttributeStructure](#jsxattributestructure)
  - [JsxElementStructure](#jsxelementstructure)
  - [JsxSelfClosingElementStructure](#jsxselfclosingelementstructure)
  - [JsxSpreadAttributeStructure](#jsxspreadattributestructure)
- [MethodDeclarationOverloadStructure](#methoddeclarationoverloadstructure)
- ObjectLiteralExpressionPropertyStructures
  - [GetAccessorDeclarationStructure](#getaccessordeclarationstructure)
  - [MethodDeclarationStructure](#methoddeclarationstructure)
  - [PropertyAssignmentStructure](#propertyassignmentstructure)
  - [SetAccessorDeclarationStructure](#setaccessordeclarationstructure)
  - [ShorthandPropertyAssignmentStructure](#shorthandpropertyassignmentstructure)
  - [SpreadAssignmentStructure](#spreadassignmentstructure)
- [ParameterDeclarationStructure](#parameterdeclarationstructure)
- [SourceFileStructure](#sourcefilestructure)
- StatementStructures
  - [ClassDeclarationStructure](#classdeclarationstructure)
  - [EnumDeclarationStructure](#enumdeclarationstructure)
  - [ExportAssignmentStructure](#exportassignmentstructure)
  - [ExportDeclarationStructure](#exportdeclarationstructure)
  - [FunctionDeclarationStructure](#functiondeclarationstructure)
  - [ImportDeclarationStructure](#importdeclarationstructure)
  - [InterfaceDeclarationStructure](#interfacedeclarationstructure)
  - [ModuleDeclarationStructure](#moduledeclarationstructure)
  - [TypeAliasDeclarationStructure](#typealiasdeclarationstructure)
  - [VariableStatementStructure](#variablestatementstructure)
- [TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)
- [VariableDeclarationStructure](#variabledeclarationstructure)

### TypeAliasDeclarationSpecificStructure

- kind: StructureKind.TypeAlias;
- type: string \| WriterFunction;

### TypeAliasDeclarationStructure

- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- hasDeclareKeyword?: boolean;   From [AmbientableNodeStructure](#ambientablenodestructure).
- isDefaultExport?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- isExported?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- kind: StructureKind.TypeAlias;   From [TypeAliasDeclarationSpecificStructure](#typealiasdeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [NamedNodeStructure](#namednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- type: string \| WriterFunction;   From [TypeAliasDeclarationSpecificStructure](#typealiasdeclarationspecificstructure).
- type?: string \| WriterFunction;   From [TypedNodeStructure](#typednodestructure).
- type: string \| WriterFunction;
- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];   From [TypeParameteredNodeStructure](#typeparameterednodestructure).

### TypeElementMemberStructures

- [CallSignatureDeclarationStructure](#callsignaturedeclarationstructure)
- [ConstructSignatureDeclarationStructure](#constructsignaturedeclarationstructure)
- [IndexSignatureDeclarationStructure](#indexsignaturedeclarationstructure)
- [MethodSignatureStructure](#methodsignaturestructure)
- [PropertySignatureStructure](#propertysignaturestructure)

### TypeElementMemberedNodeStructure

- callSignatures?: OptionalKind<[CallSignatureDeclarationStructure](#callsignaturedeclarationstructure)>[];
- constructSignatures?: OptionalKind<[ConstructSignatureDeclarationStructure](#constructsignaturedeclarationstructure)>[];
- getAccessors?: OptionalKind<[GetAccessorDeclarationStructure](#getaccessordeclarationstructure)>[];
- indexSignatures?: OptionalKind<[IndexSignatureDeclarationStructure](#indexsignaturedeclarationstructure)>[];
- methods?: OptionalKind<[MethodSignatureStructure](#methodsignaturestructure)>[];
- properties?: OptionalKind<[PropertySignatureStructure](#propertysignaturestructure)>[];
- setAccessors?: OptionalKind<[SetAccessorDeclarationStructure](#setaccessordeclarationstructure)>[];

### TypeParameterDeclarationSpecificStructure

- constraint?: string \| WriterFunction;
- default?: string \| WriterFunction;
- isConst?: boolean;
- kind: StructureKind.TypeParameter;
- variance?: TypeParameterVariance;

### TypeParameterDeclarationStructure

- constraint?: string \| WriterFunction;   From [TypeParameterDeclarationSpecificStructure](#typeparameterdeclarationspecificstructure).
- default?: string \| WriterFunction;   From [TypeParameterDeclarationSpecificStructure](#typeparameterdeclarationspecificstructure).
- isConst?: boolean;   From [TypeParameterDeclarationSpecificStructure](#typeparameterdeclarationspecificstructure).
- kind: StructureKind.TypeParameter;   From [TypeParameterDeclarationSpecificStructure](#typeparameterdeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [NamedNodeStructure](#namednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- variance?: TypeParameterVariance;   From [TypeParameterDeclarationSpecificStructure](#typeparameterdeclarationspecificstructure).

### TypeParameteredNodeStructure

- typeParameters?: (OptionalKind<[TypeParameterDeclarationStructure](#typeparameterdeclarationstructure)> \| string)[];

### TypedNodeStructure

- type?: string \| WriterFunction;

### VariableDeclarationSpecificStructure

- kind: StructureKind.VariableDeclaration;

### VariableDeclarationStructure

- hasExclamationToken?: boolean;   From [ExclamationTokenableNodeStructure](#exclamationtokenablenodestructure).
- initializer?: string \| WriterFunction;   From [InitializerExpressionableNodeStructure](#initializerexpressionablenodestructure).
- kind: StructureKind.VariableDeclaration;   From [VariableDeclarationSpecificStructure](#variabledeclarationspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- name: string;   From [BindingNamedNodeStructure](#bindingnamednodestructure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
- type?: string \| WriterFunction;   From [TypedNodeStructure](#typednodestructure).

### VariableStatementSpecificStructure

- declarationKind?: VariableDeclarationKind;
- declarations: OptionalKind<[VariableDeclarationStructure](#variabledeclarationstructure)>[];
- kind: StructureKind.VariableStatement;

### VariableStatementStructure

- declarationKind?: VariableDeclarationKind;   From [VariableStatementSpecificStructure](#variablestatementspecificstructure).
- declarations: OptionalKind<[VariableDeclarationStructure](#variabledeclarationstructure)>[];   From [VariableStatementSpecificStructure](#variablestatementspecificstructure).
- docs?: (OptionalKind<[JSDocStructure](#jsdocstructure)> \| string)[];   From [JSDocableNodeStructure](#jsdocablenodestructure).
- hasDeclareKeyword?: boolean;   From [AmbientableNodeStructure](#ambientablenodestructure).
- isDefaultExport?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- isExported?: boolean;   From [ExportableNodeStructure](#exportablenodestructure).
- kind: StructureKind.VariableStatement;   From [VariableStatementSpecificStructure](#variablestatementspecificstructure).
- leadingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Leading comments or whitespace.  From [Structure](#structure).
- trailingTrivia?: string \| WriterFunction \| (string \| WriterFunction)[]; Trailing comments or whitespace.  From [Structure](#structure).
