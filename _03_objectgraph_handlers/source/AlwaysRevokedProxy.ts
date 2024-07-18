function createAlwaysRevokedProxy(): object {
  const { proxy, revoke } = Proxy.revocable(() => null, Reflect);
  revoke();
  return proxy;
}

export default createAlwaysRevokedProxy();
