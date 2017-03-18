function dampObjectGraph(parts) {
  parts.handlers[DAMP] = parts.membrane.getHandlerByField(DAMP, true);

  if (typeof mockOptions.dampHandlerCreated == "function")
    mockOptions.dampHandlerCreated(parts.handlers[DAMP], parts);

  let keys = Object.getOwnPropertyNames(parts.wet);
  parts[DAMP] = {};
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    parts[DAMP][key] = parts.membrane.convertArgumentToProxy(
      parts.handlers.wet,
      parts.handlers[DAMP],
      parts.wet[key]
    );
  }
}
