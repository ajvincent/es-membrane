function dampObjectGraph(parts) {
    parts.handlers = {
        "wet":  parts.membrane.getHandlerbyField("wet"),
        "dry":  parts.membrane.getHandlerByField("dry"),
        "damp": parts.membrane.getHandlerByField("damp"),
    };

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

if ((typeof module == "object") && (typeof module.exports == "object"))
{
    module.exports.dampObjectGraph = dampObjectGraph;
}
