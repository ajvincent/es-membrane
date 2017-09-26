function toggleBtnState() {
  var state = ["True", "False", "Number"];
  var index = 0;
  var numDisabled = true;
  switch(document.getElementById("toggleBtn").value) {
    case state[0]:
      index = 1;
      break;
    case state[1]:
      index = 2;
      numDisabled = false;
      break;
    default:
      break;
  }
  document.getElementById("toggleBtn").value = state[index];
  document.getElementById("numBox").disabled = numDisabled;
}
