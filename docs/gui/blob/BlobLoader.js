/**
 * @fileoverview
 *
 * BlobLoader operates on the assumption that ONLY blobs will be requested to
 * load.  This means a few advantages:
 *
 * (1) BlobLoader can load right away.
 * (2) We can use error event listeners for syntax errors.
 * (3) I can use promises to ensure scripts load in order.
 */
(function() {
  "use strict";

  /**
   * Get a promise for the loading of a JavaScript.
   *
   * @param url {String} The URL to the script.
   */
  function ScriptPromise(url) {
    // public, for chaining
    let res, rej;
    this.promise = new Promise(function(resolve, reject) {
      // private
      res = resolve;
      rej = reject;
    });
    this.resolve = res;
    this.reject  = rej;

    // private
    this.scriptElem = document.createElement("script");
    this.scriptElem.setAttribute("type", "application/javascript");
    this.scriptElem.setAttribute("src", url);
    // no async, no defer:  load it now!
    this.url = url;

    this.scriptElem.addEventListener("load", this, true);
    window.addEventListener("error", this, true);
  }

  // DOMEventListener
  ScriptPromise.prototype.handleEvent = function(ev) {
    if ((ev.type === "error") && (ev.filename !== this.url))
      return;
    this.scriptElem.removeEventListener("load", this, true);
    window.removeEventListener("error", this, true);

    if (ev.type === "load")
      this.resolve();
    else {
      this.reject(ev.error);
    }
  };

  /**
   * Start the script loading process.
   */
  ScriptPromise.prototype.start = function() {
    document.head.appendChild(this.scriptElem);
  };

  window.BlobLoader = {
    // private
    lastPromise: Promise.resolve(),
    // private
    boundResolves: [],

    valuesByName: new Map(),
    failedNames: new Set(),

    /**
     * Schedule the loading of a JavaScript in sequence.
     *
     * @returns {Promise<undefined>}
     */
    addCommonURL: function(url) {
      if ((typeof url !== "string") || !/^[a-z][a-z0-9\.\+\-]*\:/i.test(url))
        throw new Error("url must be a string starting with a protocol");
      let sp = new ScriptPromise(url);

      /* This is safe:  if you call Promise.prototype.then twice on the same
       * promise, both get the resolve or reject call for that promise.
       */
      this.lastPromise.then(
        function()  { sp.start(); },
        function(e) {
          sp.reject(e);
        }
      );

      this.lastPromise = sp.promise;
      return sp.promise;
    },

    /**
     * Schedule setting a named property to what a function returns.
     *
     * @param name     {String} The name of the property in this.valuesByName.
     * @param fnSource {String} The source code of the function.
     *
     * @returns {Promise<undefined>}
     */
    addNamedValue: function(name, fnSource) {
      if (typeof name !== "string")
        throw new Error("name must be a string");
      if (this.valuesByName.has(name))
        throw new Error("BlobLoader.valuesByName already has a named value " + name);
      if (typeof fnSource !== "string")
        throw new Error("fnSource must be a string");
      if (!/^\s*function\*?\s*[a-z\(]/gim.test(fnSource))
        throw new Error("fnSource must define a function");

      // no one may call addNamedValue again with the same name
      window.BlobLoader.valuesByName.set(name, undefined);

      /* How this works:
       * (1) boundResolves is an array of resolve functions, which take functions.
       * (2) this.addCommonURL takes the inline script and returns p1, which tries
       * to load the script.
       * (3) p2 is created:  its resolve function is appended to boundResolves.
       * (4) If the script load fails from a syntax error, p1.reject happens,
       * which:
       *   (4a) removes p2.resolve from boundResolves
       *   (4b) invokes p2.reject with the exception.
       * (5) Otherwise, the script load succeeds.
       *   (5a) removes p2.resolve from boundResolves
       *   (5b) invokes p2.resolve with the function in fnSource.
       * (6) p2's resolve path executes the function to set valuesByName[name].
       *   (6a) An exception from callback fires p2.then().reject(exception);
       *   (6b) No exception means p2.then().resolve(undefined)
       * (7) p2.then() handles the reject case:
       *   (7a) failedNames gets name
       *   (7b) Rethrow the exception (to propagate along the promise chain).
       */

      let blob = new Blob(
        [
          `window.BlobLoader.boundResolves.shift()(\n`,
          `  // start BlobLoader.addNamedSource source block\n`,
          fnSource,
          `\n`,
          `  // close BlobLoader.addNamedSource source block\n`,
          `);\n`,
        ],
        {
          type: "application/javascript"
        }
      );

      let p1 = this.addCommonURL(URL.createObjectURL(blob));
      let p2 = new Promise(function(resolve, reject) {
        window.BlobLoader.boundResolves.push(resolve);
        p1.then(null, function(e) {
          window.BlobLoader.boundResolves.shift();
          reject(e);
        });
      });

      let p3 = p2.then(
        async function(getter) {
          window.BlobLoader.valuesByName.set(name, getter());
        }
      ).then(
        null,
        function(e) {
          window.BlobLoader.failedNames.add(name);
          throw e;
        }
      );

      this.lastPromise = p3;
      return p3;
    }
  };
})();
