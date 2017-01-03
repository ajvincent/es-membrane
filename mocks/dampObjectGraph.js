function dampObjectGraph(parts) {
  parts.handlers.damp = parts.membrane.getHandlerByField("damp", true);

  if (typeof mockOptions.dampHandlerCreated == "function")
    mockOptions.dampHandlerCreated(parts.handlers.damp, parts);

  let keys = Object.getOwnPropertyNames(parts.wet);
  parts.damp = {};
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    parts.damp[key] = parts.membrane.convertArgumentToProxy(
      parts.handlers.wet,
      parts.handlers.damp,
      parts.wet[key]
    );
  }
}
