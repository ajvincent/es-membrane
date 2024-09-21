function createAlwaysRevokedProxy(): () => null {
  const { proxy, revoke } = Proxy.revocable<() => null>(() => null, Reflect);
  revoke();
  return proxy;
}

export default createAlwaysRevokedProxy();
