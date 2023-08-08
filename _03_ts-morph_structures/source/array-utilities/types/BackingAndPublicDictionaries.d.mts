/*
import type {
  PublicTypeUpdateableArray,
  UpdateSymbolTracking,
} from "./export-types.mjs";
*/

export interface BackingAndPublicDictionary<
  BackingType extends object,
  PublicType extends object,
>
{
  readonly backingValue: BackingType;
  readonly publicValue: PublicType;
}

/*
export interface BackingAndPublicArrayDictionary<
  BackingType extends object,
  PublicType extends object,
>
{
  readonly backingArray: BackingType[];
  readonly wrappedPublicArray: PublicType[];
  readonly shadowTargetArray: PublicTypeUpdateableArray<PublicType>,
  readonly proxyArray: PublicTypeUpdateableArray<PublicType>;
  revoke(): void;
}
*/

export interface BackingPublicContext<
  BackingType extends object,
  PublicType extends object,
>
{
  readonly buildPublic: (backingValue: BackingType) => PublicType,
  readonly buildBacking: (publicValue: PublicType) => BackingType,
}

/*
export interface BackingPublicContextWithMaps<
  BackingType extends object,
  PublicType extends object,
>
extends BackingPublicContext<BackingType, PublicType>
{
  readonly objectOneToOneMap: WeakMap<
    BackingType | PublicType,
    BackingAndPublicDictionary<BackingType, PublicType>
  >;
  readonly arrayOneToOneMap: WeakMap<
    PublicType[] | BackingType[],
    BackingAndPublicArrayDictionary<BackingType, PublicType> & UpdateSymbolTracking
  >;
}
*/
