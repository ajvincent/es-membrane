import type {
  RequireAtLeastOne,
} from "type-fest";

export declare type ShadowBrandUnion = "shadow" | "proxy" | "revoker" | "receiver";
declare const ShadowBrand: unique symbol;

export declare type GraphBrandUnion = "thisGraph" | "nextGraph" | "notApplicable";
declare const GraphBrand: unique symbol;

interface ShadowBranding<
  ShadowBrandType extends ShadowBrandUnion,
  GraphBrandType extends GraphBrandUnion
>
{
  [ShadowBrand]: ShadowBrandType,
  [GraphBrand]: GraphBrandType
}

export type ShadowObject<
  T extends object,
  G extends GraphBrandUnion
> = T & ShadowBranding<"shadow", G>;

export type ProxyValue<
  T extends unknown,
  G extends GraphBrandUnion
> = T & ShadowBranding<"proxy", G>;

export type ReceiverValue<
  T extends unknown,
  G extends GraphBrandUnion
> = T & ShadowBranding<"receiver", G>;

export type RevokerFunction = (() => void) & ShadowBranding<"revoker", "notApplicable">;

interface ProxyDescriptorBase {
  configurable: boolean;
  enumerable: boolean;
}

export interface ProxyDataDescriptor<
  T extends unknown,
  G extends GraphBrandUnion
> extends ProxyDescriptorBase
{
  writable: boolean,
  value: ProxyValue<T, G>,
};

interface ProxyGetterSetter<
  T extends unknown,
  G extends GraphBrandUnion
>
{
  get?: () => ProxyValue<T, G>;
  set?: (value: ProxyValue<T, G>) => void;
}

export type ProxyAccessorDescriptor<T extends unknown, G extends GraphBrandUnion> =
  ProxyDescriptorBase & RequireAtLeastOne<ProxyGetterSetter<T, G>>;

export type ProxyGenericDescriptor<T extends unknown, G extends GraphBrandUnion> =
  ProxyDataDescriptor<T, G> | ProxyAccessorDescriptor<T, G>;
