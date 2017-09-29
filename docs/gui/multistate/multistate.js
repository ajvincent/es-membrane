function MultistateHandler(event) {
  const multistate = event.target;
  if (!multistate.classList.contains("multistate"))
    return;
  multistate.appendChild(multistate.firstElementChild);
  updateMultistate(multistate);
}

function updateMultistate(multistate) {
  multistate.value = multistate.firstElementChild.dataset.state;
}
