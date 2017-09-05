function defineElementGetter(obj, propName, id)
{
  Reflect.defineProperty(
    obj,
    propName,
    {
      enumerable: true,
      configurable: true,

      get: function() {
        let rv = document.getElementById(id);
        if (rv)
          Reflect.defineProperty(
            obj,
            propName,
            {
              enumerable: true,
              writable: false,
              configurable: false,
              value: rv
            }
          );
        return rv;
      }
    }
  );
}
