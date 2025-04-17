export interface ProxyRevocableReturn<T extends object> {
  proxy: T;
  revoke: () => void;
}
