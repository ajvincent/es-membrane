import { NumberStringType } from "../../build/NumberStringType.mjs";
import InstanceToComponentMap, { InstanceToComponentMap_Type } from "../KeyToComponentMap_Base.mjs";
import { AnyFunction } from "./Common.mjs";
import { ComponentPassThroughClass, PassThroughType } from "./PassThroughSupport.mjs";

export type PassThroughClassType = ComponentPassThroughClass<NumberStringType, NumberStringType>;

export type PassThroughArgumentType<MethodType extends AnyFunction> = PassThroughType<NumberStringType, MethodType, NumberStringType>;

const ComponentMapInternal = new InstanceToComponentMap<NumberStringType, NumberStringType>;
import NotImplemented_Class from "../PassThrough_NotImplemented.mjs";
import Continue_Class from "../PassThrough_Continue.mjs";
ComponentMapInternal.addDefaultComponent("NotImplemented", new NotImplemented_Class);
ComponentMapInternal.addDefaultComponent("Continue", new Continue_Class);
ComponentMapInternal.defaultStart = "NotImplemented";
const ComponentMap: InstanceToComponentMap_Type<NumberStringType, NumberStringType> = ComponentMapInternal;
export default ComponentMap;
