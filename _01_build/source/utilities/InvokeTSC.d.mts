declare const InvokeTSC: {
    withConfigurationFile: (pathToConfig: string, pathToStdOut?: string) => Promise<number>;
    withCustomConfiguration: (configLocation: string, removeConfigAfter: boolean, modifier: (config: any) => void, pathToStdOut?: string) => Promise<number>;
    defaultConfiguration: () => object;
};
export default InvokeTSC;
