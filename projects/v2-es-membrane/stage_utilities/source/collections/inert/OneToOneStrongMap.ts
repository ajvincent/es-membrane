import type {
  OneToOneStrongMapIfc
} from "../types/OneToOneStrongMapIfc.js";

export class InertOneToOneStrongMapIfc<StrongKeyType, ValueType extends WeakKey>
implements OneToOneStrongMapIfc<StrongKeyType, ValueType>
{
  bindOneToOne(strongKey_1: StrongKeyType, value_1: ValueType, strongKey_2: StrongKeyType, value_2: ValueType): void {
    void strongKey_1;
    void value_1;
    void strongKey_2;
    void value_2;
  }

  clear(): void {
    // do nothing
  }

  delete(value: ValueType, strongKey: StrongKeyType): boolean {
    void value;
    void strongKey;
    return false;
  }

  revokeStrongKey(strongKey: StrongKeyType): void {
    void strongKey;
  }

  revokeEverything(): void {
    // do nothing
  }

  get(value: ValueType, strongKey: StrongKeyType): ValueType | undefined {
    void value;
    void strongKey;
    return undefined;
  }

  has(value: ValueType, strongKey: StrongKeyType): boolean {
    void value;
    void strongKey;
    return false;
  }

  hasIdentity(value: ValueType, strongKey: StrongKeyType, allowNotDefined: boolean): boolean {
    void value;
    void strongKey;
    void allowNotDefined;
    return false;
  }

  keyWasRevoked(strongKey: StrongKeyType): boolean {
    void strongKey;
    return true;
  }
}
