document.getElementsByClassName("multistate")[0].disabled = false;

document.getElementsByClassName("multistate")[0].onclick = function() {
  var multistate = document.getElementsByClassName("multistate")[0];
  multistate.appendChild(multistate.firstElementChild);
  multistate.append("\n");
  multistate.removeChild(multistate.firstChild);
  multistate.parentNode.getElementsByTagName("input")[0].disabled = (multistate.firstElementChild.dataset.state != "number");
}
