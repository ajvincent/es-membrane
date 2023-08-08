/*
import type {
  PublicTypeUpdateableArray,
  UpdateSymbolTracking,
} from "./export-types.mjs";
*/

export interface PrivateAndPublicDictionary<
  PrivateType extends object,
  PublicType extends object,
>
{
  readonly privateValue: PrivateType;
  readonly publicValue: PublicType;
}

/*
export interface PrivateAndPublicArrayDictionary<
  PrivateType extends object,
  PublicType extends object,
>
{
  readonly privateArray: PrivateType[];
  readonly wrappedPublicArray: PublicType[];
  readonly shadowTargetArray: PublicTypeUpdateableArray<PublicType>,
  readonly proxyArray: PublicTypeUpdateableArray<PublicType>;
  revoke(): void;
}
*/

export interface PrivatePublicContext<
  PrivateType extends object,
  PublicType extends object,
>
{
  readonly buildPublic: (privateValue: PrivateType) => PublicType,
  readonly buildPrivate: (publicValue: PublicType) => PrivateType,
}

/*
export interface PrivatePublicContextWithMaps<
  PrivateType extends object,
  PublicType extends object,
>
extends PrivatePublicContext<PrivateType, PublicType>
{
  readonly objectOneToOneMap: WeakMap<
    PrivateType | PublicType,
    PrivateAndPublicDictionary<PrivateType, PublicType>
  >;
  readonly arrayOneToOneMap: WeakMap<
    PublicType[] | PrivateType[],
    PrivateAndPublicArrayDictionary<PrivateType, PublicType> & UpdateSymbolTracking
  >;
}
*/
