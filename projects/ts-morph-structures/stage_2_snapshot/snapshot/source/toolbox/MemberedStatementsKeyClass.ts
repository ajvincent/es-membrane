import type { MemberedStatementsKey, TypeMemberImpl } from "../exports.js";

/** @internal */
export default class MemberedStatementsKeyClass
  implements MemberedStatementsKey
{
  readonly fieldKey: string;
  readonly statementGroupKey: string;
  readonly purpose: string;
  readonly isFieldStatic: boolean;
  readonly fieldType: TypeMemberImpl | undefined;
  readonly isGroupStatic: boolean;
  readonly groupType: TypeMemberImpl | undefined;

  constructor(
    fieldKey: string,
    statementGroupKey: string,
    purpose: string,
    fieldTypeContext?: [boolean, TypeMemberImpl],
    groupTypeContext?: [boolean, TypeMemberImpl],
  ) {
    this.fieldKey = fieldKey;
    this.statementGroupKey = statementGroupKey;
    this.purpose = purpose;

    const [isFieldStatic, fieldType] = fieldTypeContext ?? [false, undefined];
    this.isFieldStatic = isFieldStatic;
    this.fieldType = fieldType;

    const [isGroupStatic, groupType] = groupTypeContext ?? [false, undefined];
    this.isGroupStatic = isGroupStatic;
    this.groupType = groupType;
  }

  toJSON(): Pick<
    MemberedStatementsKeyClass,
    "fieldKey" | "statementGroupKey" | "purpose"
  > {
    return {
      fieldKey: this.fieldKey,
      statementGroupKey: this.statementGroupKey,
      purpose: this.purpose,
    };
  }
}
