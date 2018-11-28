const PageContentLoader = (function() {
"use strict";

const ignorableTokens = [
  [/^\n+/g,      null],
  [/^[\t\x20]+/, null],
  [/^\/\*/,      /\*\//],
  [/^\/\//,      /\n/],
];

function isValidJavaScriptStart(source, expectedStrings) {
  function testIgnorable(RegExpTuple) {
    let match = source.match(RegExpTuple[0]);
    if (!match || !source.startsWith(match[0]))
      return false;
    let chars = match[0];
    let middle = source.substr(chars.length);
    if (!RegExpTuple[1]) {
      source = middle;
      return true;
    }

    match = middle.match(RegExpTuple[1]);
    if (!match)
      return false;
    chars = match[0];
    source = middle.substr(middle.indexOf(chars) + chars.length);
    return true;
  }

  while (source.length > 0) {
    if (expectedStrings.length == 0)
      return true;
    if (source.startsWith(expectedStrings[0])) {
      source = source.substr(expectedStrings[0].length);
      expectedStrings.shift();
      continue;
    }
    if (!ignorableTokens.some(testIgnorable))
      break;
  }
  return false;
}

return {
  scriptResolutions: new Map(
    /* path: { resolve, reject } for a Promise */
  ),

  scaffolding: {
    allContentPromise: function(path)
    {
      let start;
      let p = new Promise((resolve) => start = resolve);
      p = p.then(function() {
        return PageContentLoader.scaffolding.jsonPromise(path);
      });
      p = p.then(function() {
        console.debug("Loaded all content for " + path);
      });
      return [start, p];
    },

    jsonPromise: function(path) {
      const data = JSON.parse(this.getElementContents(path, "content.json"));

      const promiseArray = [];
      promiseArray.push(this.markupPromise(data.pageText, path, "pageText"));
      promiseArray.push(this.scriptPromise(data.script, path));
      if ("slideHTML" in data)
        promiseArray.push(this.markupPromise(data.slideHTML, path, "slide"));
      return Promise.all(promiseArray);
    },

    markupPromise: function(markup, path, typeOfContent) {
      const section = this.getTemplateContent(path, markup);
      PageContentLoader.addMarkup(path, section, typeOfContent);
      return Promise.resolve();
    },

    scriptPromise: function(scriptPath, path)
    {
      const contents = this.getElementContents(path, scriptPath);
      if (!isValidJavaScriptStart(contents, [
        "NavigationController.addPageDriver(",
        "{",
        'path:', `"${path}"`, ",",
        'slideType:',
      ]))
        return Promise.reject(new Error("Scaffolding script has an invalid prologue"));
      
      const blob = new Blob([contents]);
      const url = URL.createObjectURL(blob);
      const rv = PageContentLoader.addScriptPromise(path, url);
      return rv;
    },

    getTemplateContent: function(path, fileName) {
      const xPath = `id("scaffolding:${path}")//template[@dataset-filename="${fileName}"]`;
      return document.evaluate(
        xPath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue.content;
    },

    getElementContents: function(path, fileName) {
      const range = document.createRange();
      const content = this.getTemplateContent(path, fileName);
      range.selectNodeContents(content.cloneNode(true));
      return range.toString();
    },
  },

  remote: {
    allContentPromise: function(item)
    {
      void(item);
      throw new Error("Not implemented yet!");
    },
  },
 
  addMarkup: function(path, contents, typeOfContent) {
    const section = document.createElement("section");
    while (contents.firstElementChild)
      section.appendChild(contents.firstElementChild);

    if (typeOfContent == "pageText") {
      section.setAttribute("id", "page:" + path);
      MasterController.pagedContent.appendChild(section);
    }
    else if (typeOfContent == "slide") {
      section.setAttribute("id", "slide:" + path);
      MasterController.slideContent.appendChild(section);
    }
    else
      throw new Error(`Unrecognized type of content: ${typeOfContent}`);
  },

  addScriptPromise: function(path, url) {
    const wrapper = {};
    let p = new Promise((resolve, reject) => {
      wrapper.resolve = resolve;
      wrapper.reject  = reject;
    });
    this.scriptResolutions.set(path, wrapper);

    const script = document.createElement("script");
    script.setAttribute("type", "application/javascript");
    script.setAttribute("src", url);
    script.onerror = wrapper.reject;
    document.head.appendChild(script);

    p = p.finally(() => {
      PageContentLoader.scriptResolutions.delete(path);
    });

    return p;
  },

  resolveScript: function(path, result) {
    this.scriptResolutions.get(path).resolve(result);
  },

  rejectScript: function(path, error) {
    this.scriptResolutions.get(path).reject(error);
  },

  init: function() {
    const items = Array.from(
      document.getElementById("outline")
              .getElementsByTagName("li")
    );
    const startArray = [], promiseArray = [];
    items.map(
      function(item) {
        if (!item.dataset.path)
          return; // not implemented yet

        let results = {};
        if (item.classList.contains("scaffolding"))
          results = this.scaffolding.allContentPromise(item.dataset.path);
        else
          results = this.remote.allContentPromise(item.dataset.path);
        const [start, promise] = results;
        startArray.push(start);
        promiseArray.push(promise);
      },
      this
    );
    startArray.forEach((start) => start());
    return Promise.all(promiseArray);
  }
};
})();
void(PageContentLoader);
