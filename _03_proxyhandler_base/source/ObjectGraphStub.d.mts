interface ObjectGraphStub<T extends object> {
    getNextTargetForShadow(shadowTarget: T): T;
    getHandlerForTarget(target: T): Required<ProxyHandler<T>>;
    convertArguments(...args: unknown[]): unknown[];
    convertDescriptor(descriptor: PropertyDescriptor): PropertyDescriptor;
}
export type { ObjectGraphStub };
