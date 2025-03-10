import type {
  InstanceGetterDefinitions
} from "../../source/graph-analysis/types/InstanceGetterDefinitions.js";

import {
  InstanceGetterTracking
} from "../../source/graph-analysis/InstanceGetterTracking.js";

describe("Instance getter tracking utility notifies all", () => {
  const defineInstanceGetter = jasmine.createSpy("defineInstanceGetter");
  const definePrivateInstanceGetter = jasmine.createSpy("definePrivateInstanceGetter");

  const definitions: InstanceGetterDefinitions<object, symbol> = {
    defineInstanceGetter,
    definePrivateInstanceGetter,
  };

  let tracking: InstanceGetterTracking<object, symbol>;

  const firstInstance = { name: "firstInstance" };
  const secondInstance = { name: "secondInstance" };
  const thirdInstance = { name: "thirdInstance" };
  const baseClass = { name: "baseClass" };
  const derivedClass = { name: "derivedClass" };

  const getterKey = Symbol("getter key");
  const privateKey = { name: "privateKey" };

  beforeEach(() => {
    defineInstanceGetter.calls.reset();
    definePrivateInstanceGetter.calls.reset();

    tracking = new InstanceGetterTracking(definitions);
  });

  it("direct instances of a class when we add a public getter on the class", () => {
    tracking.addInstance(firstInstance, baseClass);
    tracking.addInstance(secondInstance, baseClass);

    tracking.addGetterName(baseClass, getterKey);

    expect(defineInstanceGetter).toHaveBeenCalledTimes(2);
    expect(defineInstanceGetter).toHaveBeenCalledWith(firstInstance, getterKey);
    expect(defineInstanceGetter).toHaveBeenCalledWith(secondInstance, getterKey);

    defineInstanceGetter.calls.reset();

    tracking.addInstance(thirdInstance, baseClass);
    expect(defineInstanceGetter).toHaveBeenCalledOnceWith(thirdInstance, getterKey);

    expect(definePrivateInstanceGetter).toHaveBeenCalledTimes(0);
  });

  it("instances of a derived class when we add a public getter on the base class", () => {
    tracking.addInstance(firstInstance, derivedClass);
    tracking.addInstance(secondInstance, derivedClass);

    tracking.addBaseClass(derivedClass, baseClass);

    tracking.addGetterName(baseClass, getterKey);

    expect(defineInstanceGetter).toHaveBeenCalledTimes(2);
    expect(defineInstanceGetter).toHaveBeenCalledWith(firstInstance, getterKey);
    expect(defineInstanceGetter).toHaveBeenCalledWith(secondInstance, getterKey);

    defineInstanceGetter.calls.reset();

    tracking.addInstance(thirdInstance, baseClass);
    expect(defineInstanceGetter).toHaveBeenCalledOnceWith(thirdInstance, getterKey);

    expect(definePrivateInstanceGetter).toHaveBeenCalledTimes(0);
  });

  it("direct instances when we add a class with a public getter", () => {
    tracking.addGetterName(baseClass, getterKey);
    tracking.addInstance(firstInstance, baseClass);

    expect(defineInstanceGetter).toHaveBeenCalledOnceWith(firstInstance, getterKey);
  });

  it("instances of a derived class with a public getter on the base class", () => {
    tracking.addGetterName(baseClass, getterKey);
    tracking.addBaseClass(derivedClass, baseClass);

    tracking.addInstance(firstInstance, derivedClass);
    expect(defineInstanceGetter).toHaveBeenCalledOnceWith(firstInstance, getterKey);
  });

  it("instances of a derived class of public getters when we add the derived-to-base relationship later", () => {
    tracking.addInstance(firstInstance, derivedClass);
    tracking.addInstance(secondInstance, derivedClass);

    tracking.addGetterName(baseClass, getterKey);
    expect(defineInstanceGetter).toHaveBeenCalledTimes(0);

    tracking.addBaseClass(derivedClass, baseClass);

    expect(defineInstanceGetter).toHaveBeenCalledTimes(2);
    expect(defineInstanceGetter).toHaveBeenCalledWith(firstInstance, getterKey);
    expect(defineInstanceGetter).toHaveBeenCalledWith(secondInstance, getterKey);

    defineInstanceGetter.calls.reset();

    tracking.addInstance(thirdInstance, baseClass);
    expect(defineInstanceGetter).toHaveBeenCalledOnceWith(thirdInstance, getterKey);

    expect(definePrivateInstanceGetter).toHaveBeenCalledTimes(0);
  });

  it("direct instances of a class when we add a private getter on the class", () => {
    tracking.addInstance(firstInstance, baseClass);
    tracking.addInstance(secondInstance, baseClass);

    tracking.addPrivateGetterName(baseClass, privateKey);

    expect(definePrivateInstanceGetter).toHaveBeenCalledTimes(2);
    expect(definePrivateInstanceGetter).toHaveBeenCalledWith(firstInstance, privateKey);
    expect(definePrivateInstanceGetter).toHaveBeenCalledWith(secondInstance, privateKey);

    definePrivateInstanceGetter.calls.reset();

    tracking.addInstance(thirdInstance, baseClass);
    expect(definePrivateInstanceGetter).toHaveBeenCalledOnceWith(thirdInstance, privateKey);

    expect(defineInstanceGetter).toHaveBeenCalledTimes(0);
  });

  it("instances of a derived class when we add a private getter on the base class", () => {
    tracking.addInstance(firstInstance, derivedClass);
    tracking.addInstance(secondInstance, derivedClass);

    tracking.addBaseClass(derivedClass, baseClass);

    tracking.addPrivateGetterName(baseClass, privateKey);

    expect(definePrivateInstanceGetter).toHaveBeenCalledTimes(2);
    expect(definePrivateInstanceGetter).toHaveBeenCalledWith(firstInstance, privateKey);
    expect(definePrivateInstanceGetter).toHaveBeenCalledWith(secondInstance, privateKey);

    definePrivateInstanceGetter.calls.reset();

    tracking.addInstance(thirdInstance, baseClass);
    expect(definePrivateInstanceGetter).toHaveBeenCalledOnceWith(thirdInstance, privateKey);

    expect(defineInstanceGetter).toHaveBeenCalledTimes(0);
  });

  it("direct instances when we add a class with a private getter", () => {
    tracking.addPrivateGetterName(baseClass, privateKey);
    tracking.addInstance(firstInstance, baseClass);

    expect(definePrivateInstanceGetter).toHaveBeenCalledOnceWith(firstInstance, privateKey);
  });

  it("instances of a derived class with a private getter on the base class", () => {
    tracking.addPrivateGetterName(baseClass, privateKey);
    tracking.addBaseClass(derivedClass, baseClass);

    tracking.addInstance(firstInstance, derivedClass);
    expect(definePrivateInstanceGetter).toHaveBeenCalledOnceWith(firstInstance, privateKey);
  });

  it("instances of a derived class of private getters when we add the derived-to-base relationship later", () => {
    tracking.addInstance(firstInstance, derivedClass);
    tracking.addInstance(secondInstance, derivedClass);

    tracking.addPrivateGetterName(baseClass, privateKey);
    expect(definePrivateInstanceGetter).toHaveBeenCalledTimes(0);

    tracking.addBaseClass(derivedClass, baseClass);

    expect(definePrivateInstanceGetter).toHaveBeenCalledTimes(2);
    expect(definePrivateInstanceGetter).toHaveBeenCalledWith(firstInstance, privateKey);
    expect(definePrivateInstanceGetter).toHaveBeenCalledWith(secondInstance, privateKey);

    definePrivateInstanceGetter.calls.reset();

    tracking.addInstance(thirdInstance, baseClass);
    expect(definePrivateInstanceGetter).toHaveBeenCalledOnceWith(thirdInstance, privateKey);

    expect(defineInstanceGetter).toHaveBeenCalledTimes(0);
  });
});
