function getGUIMocksPromise(propNames) {
  /* This function returns Promise.all(cachedPromises), so a single reject will
   * reject the entire sequence.
   */
  var window = testFrame.contentWindow;
  const cachedPromises = [], cachedStarts = [];

  function nextAsync(start, listener, postAsync) {
    /* Here's how this works:
     *
     * (1) The user writes three functions:  start, listener and postAsync.
     *     The listener function takes a resolve function from a promise and
     *     associates it with an asynchronous event.  start sets up the event,
     *     and postAsync handles the response from the event.
     * (2) When nextAsync is invoked,
     *   (2a) listener is invoked with a resolve function for postAsync
     *   (2b) start is invoked to kick off the event.
     * (3) When listener calls the resolve function, postAsync() executes.
     * (4) If postAsync doesn't throw, invokeNextAsync will fire. 
     */
    let innerResolve;
    let p = new Promise(function(resolve) {
      cachedStarts.push(resolve);
    });

    cachedPromises.push(p.then(function() {
      listener(innerResolve);
      start();
    }));

    p = new Promise(function(resolve) {
      innerResolve = resolve;
    });

    cachedPromises.push(p.then(postAsync).then(invokeNextAsync));
  }

  function invokeNextAsync() {
    if (cachedStarts.length)
      cachedStarts.shift()();
  }

  // This part is synchronous:  if it fails, we're dead anyway.
  {
    window.HandlerNames.setRow(0, "wet", false);
    window.HandlerNames.setRow(1, "dry", false);
    window.HandlerNames.update();

    {
      let isValid = window.StartPanel.graphNamesForm.checkValidity();
      expect(isValid).toBe(true);
      if (!isValid)
        return Promise.reject();
    }
  }

  nextAsync(
    function() {
      window.StartPanel.testMode = true;
      window.StartPanel.startWithGraphNames();
    },
    function(pResolve) {
      window.addEventListener("message", function(evt) {
        if (evt.origin !== window.location.origin)
          return;
        pResolve();
      }, {once: true});
    },
    function() {
      const OGM = window.OuterGridManager;
      expect(OGM.selectedTabs.file).toBe(OGM.addPanelRadio);
    }
  );

  propNames.forEach(function(name) {
    nextAsync(
      function() {
        window.OuterGridManager.addPanelRadio.click();
        window.AddValuePanel.sourceGraphSelect.selectedIndex = 0;
        window.AddValuePanel.targetGraphSelect.selectedIndex = 1;
        window.AddValuePanel.form.nameOfValue.value = `parts.dry.${name}`;
        window.AddValuePanel.getValueEditor.setValue(
          `function() { return MembraneMocks().dry.${name}; }`
        );

        {
          let isValid = window.AddValuePanel.form.checkValidity();
          expect(isValid).toBe(true);
          if (!isValid)
            return;
        }

        window.DistortionsGUI.buildValuePanel();
      },

      function(pResolve) {
        const mObs = new MutationObserver(function(records) {
          mObs.disconnect();
          let iframe = records[0].addedNodes[0];
          iframe.addEventListener("load", function() {
            pResolve(iframe.contentWindow.BlobLoader);
          }, CAPTURE_ONCE);
        });
        mObs.observe(window.DistortionsGUI.iframeBox, {childList: true});
      },

      function() {}
    );
  });

  let started = false;
  function startSequence() {
    if (started)
      return;
    started = true;
    invokeNextAsync();
  }

  return [startSequence, Promise.all(cachedPromises)];
}
