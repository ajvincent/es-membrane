// see also HandlerNames.js

const StartPanel = window.StartPanel = {
  // private, see below
  commonFilesInput: null,
  startFilesForm: null,
  configFileForm: null,
  configFileInput: null,
  configFileSubmit: null,
  graphNamesForm: null,
  graphNamesSubmit: null,

  startWithGraphNames: function() {
    if (!this.startFilesForm.reportValidity())
      return;
    {
      let files = this.commonFilesInput.files;
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        DistortionsManager.commonFileURLs.set(file, URL.createObjectURL(file));
      }
    }

    this.enableOtherPanels();
  },

  enableOtherPanels: function() {
    OuterGridManager.startPanelRadio.disabled = true;
    OuterGridManager.addPanelRadio.disabled = false;
    OuterGridManager.outputPanelRadio.disabled = false;

    OuterGridManager.addPanelRadio.click();
  }
};

{
  let elems = {
    "commonFilesInput": "grid-outer-start-location",
    "startFilesForm":   "grid-outer-start-filesform",
    "configFileForm":   "grid-outer-start-configform",
    "configFileInput":  "grid-outer-start-config-input",
    "configFileSubmit": "grid-outer-start-configform-submit",
    "graphNamesForm":   "grid-outer-start-graphnamesform",
    "graphNamesSubmit": "grid-outer-start-graphnames-submit",
  };
  let keys = Reflect.ownKeys(elems);
  keys.forEach(function(key) {
    defineElementGetter(StartPanel, key, elems[key]);
  });
}
