import {
  Class
} from "type-fest";

import {
  BuiltInCollections
} from "./utilities/BuiltInCollections.js";

import isObjectOrSymbol from "./utilities/isObjectOrSymbol.js";

type PrivateClassKey = `#${string}`;
type IsRequiredReturn<
  Type, IsRequired extends boolean
> = IsRequired extends true ? Type : (Type | undefined);

type ReadonlyWeakMap<K extends WeakKey, V> = Omit<WeakMap<K, V>, "delete" | "set">;

export interface ReadonlyCastMap<PropertyUnion extends PrivateClassKey, V> extends ReadonlyMap<PropertyUnion, V> {
  castGet<Type, IsRequired extends boolean>(
    key: PropertyUnion
  ): IsRequiredReturn<Type, IsRequired>;
}

export interface ReadonlyPrivateFieldsSet extends ReadonlySet<ReadonlyCastMap<PrivateClassKey, unknown>> {
  flatWeakKeys(): Iterator<WeakKey>;
}

export class PrivateClassPropertiesMap<PropertyUnion extends PrivateClassKey>
extends BuiltInCollections.Map<PropertyUnion, unknown>
implements ReadonlyCastMap<PropertyUnion, unknown>
{
  castGet<Type, IsRequired extends boolean>(
    key: PropertyUnion
  ): IsRequiredReturn<Type, IsRequired>
  {
    return this.get(key) as IsRequiredReturn<Type, IsRequired>;
  }
}

class PrivateFieldsSet
extends BuiltInCollections.Set<PrivateClassPropertiesMap<PrivateClassKey>>
implements ReadonlyPrivateFieldsSet
{
  public * flatWeakKeys(): Iterator<WeakKey> {
    for (const map of this.values()) {
      for (const value of map.values()) {
        if (isObjectOrSymbol(value))
          yield value;
      }
    }
  }
}

const ClassPrivateFieldsMap = new BuiltInCollections.WeakMap<
  Class<object>, PrivateClassPropertiesMap<PrivateClassKey>
>;
const InstancePrivateFieldsMap = new BuiltInCollections.WeakMap<object, PrivateFieldsSet>;
const InstanceToClassMap = new BuiltInCollections.WeakMap<object, Set<Class<object>>>;

export function TrackPrivateStaticFields<
  MapType extends PrivateClassPropertiesMap<PrivateClassKey>
>
(
  _class: Class<object>,
  map: MapType
): typeof map
{
  ClassPrivateFieldsMap.set(_class, map);
  return map;
}

export function TrackPrivateFields<
  MapType extends PrivateClassPropertiesMap<PrivateClassKey>
>
(
  thisObj: object,
  _class: Class<typeof thisObj>,
  privateFieldsMap: MapType
): typeof privateFieldsMap
{
  {
    let innerClassSet: Set<Class<object>> | undefined = InstanceToClassMap.get(thisObj);
    if (innerClassSet === undefined) {
      innerClassSet = new Set;
      InstanceToClassMap.set(thisObj, innerClassSet);
    }

    innerClassSet.add(_class);
  }

  {
    let innerPrivateFieldsSet: PrivateFieldsSet | undefined = InstancePrivateFieldsMap.get(thisObj);
    if (innerPrivateFieldsSet === undefined) {
      innerPrivateFieldsSet = new PrivateFieldsSet;
      InstancePrivateFieldsMap.set(thisObj, innerPrivateFieldsSet);
    }

    innerPrivateFieldsSet.add(privateFieldsMap);
  }

  return privateFieldsMap;
}

export const TrackedPrivateReferences = {
  instanceToClass: InstanceToClassMap as ReadonlyWeakMap<
    object, ReadonlySet<Class<object>>
  >,
  classPrivateFields: ClassPrivateFieldsMap as ReadonlyWeakMap<
    Class<object>, ReadonlyCastMap<PrivateClassKey, unknown>
  >,
  instancePrivateFields: InstancePrivateFieldsMap as ReadonlyWeakMap<
    object, ReadonlySet<ReadonlyCastMap<PrivateClassKey, unknown>>
  >,
}

export interface PrivateClassFieldTools {
  TrackedPrivateReferences: typeof TrackedPrivateReferences,
  PrivateClassPropertiesMap: typeof PrivateClassPropertiesMap,
  TrackPrivateFields: typeof TrackPrivateFields,
  TrackPrivateStaticFields: typeof TrackPrivateStaticFields,
}