import { NumberStringType } from "../build/NumberStringType.mjs";
import { AnyFunction } from "./internal/Common.mjs";
import { ComponentPassThroughClass, PassThroughType } from "./internal/PassThroughSupport.mjs";
import InstanceToComponentMap, { InstanceToComponentMap_Type } from "./KeyToComponentMap_Base.mjs";

export type PassThroughClassType = ComponentPassThroughClass<NumberStringType, NumberStringType>;

export type PassThroughArgumentType<MethodType extends AnyFunction> = PassThroughType<NumberStringType, MethodType, NumberStringType>;

const ComponentMapInternal = new InstanceToComponentMap<NumberStringType, NumberStringType>;
import NotImplemented_Class from "./PassThrough_NotImplemented.mjs";
import Continue_Class from "./PassThrough_Continue.mjs";
import MainBody_Class from "../source/MainBody.mjs";
ComponentMapInternal.addDefaultComponent("NotImplemented", new NotImplemented_Class);
ComponentMapInternal.addDefaultComponent("Continue", new Continue_Class);
ComponentMapInternal.addDefaultComponent("MainBody", new MainBody_Class);
ComponentMapInternal.addDefaultSequence("main", ["Continue","MainBody"]);
ComponentMapInternal.defaultStart = "main";
const ComponentMap: InstanceToComponentMap_Type<NumberStringType, NumberStringType> = ComponentMapInternal;
export default ComponentMap;
