function MultistateHandler(event) {
  const multistate = event.target;
  multistate.appendChild(multistate.firstElementChild);
  multistate.value = multistate.firstElementChild.dataset.state;
}

/*
{
  let buttons = document.getElementsByClassName("multistate");
  for (let i = 0; i < buttons.length; i++)
    buttons[i].addEventListener("click", MultistateHandler, true);
}
*/
