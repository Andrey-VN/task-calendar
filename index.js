const API_URL_LIST_USERS = "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users";
const API_URL_LIST_TASK = "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks";

window.addEventListener("DOMContentLoaded", () => {

  const tasksNames = document.querySelector(".tasks__names");
  const calendarTbody = document.querySelector(".calendar__tbody");

  tasksNames.addEventListener("dragstart", dragstartHandler);

  calendarTbody.addEventListener("dragover", dragoverHandler);
  calendarTbody.addEventListener("drop", dropHandler);
});

function dragstartHandler(ev) {
    console.log(ev.target)
  ev.dataTransfer.setData("id", ev.target.id);
}

function dragoverHandler(ev) {
  const isTdFirst = ev.target.classList.contains("calendar__tbody-td--first");
  if(isTdFirst) return;
  ev.preventDefault();
}

function dropHandler(ev) {
  const data = ev.dataTransfer.getData("id");
  if(!data) return;
  
  const elem = document.getElementById(data);
  const taskTitleElem = elem.querySelector(".tasks__name-title");

  let isTbodyTd = ev.target.classList.contains("calendar__tbody-td");
  if (!isTbodyTd) {
    let elemParent = ev.target.parentNode;
    while (elemParent.classList) {
      isTbodyTd = elemParent.classList.contains("calendar__tbody-td");
      if(isTbodyTd) {
          elemParent.innerHTML += `
          <div class="tbody-td__task">
          <h4 class="tdbody-td__title">${taskTitleElem.textContent}</h4>
          </div>
          `;
          break;
      } 
      elemParent = elemParent.parentNode;
    }
  } else {
    ev.target.innerHTML += `
    <div class="tbody-td__task">
    <h4 class="tdbody-td__title">${taskTitleElem.textContent}</h4>
    </div>
    `;
  }

  elem.parentNode.removeChild(elem);
}
