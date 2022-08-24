const API_URL_LIST_USERS =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users";
const API_URL_LIST_TASKS =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks";

class User {
  id;
  username;
  surname;
  firstName;
  secondName;

  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.surname = user.surname;
    this.firstName = user.firstName;
    this.secondName = user.isecondName;
  }
}

class Task {
  id;
  subject;
  description;
  creationAuthor;
  executor;
  creationDate;
  planStartDate;
  planEndDate;
  endDate;
  status;
  order;

  constructor(task) {
    this.id = task.id;
    this.subject = task.subject;
    this.description = task.description;
    this.creationAuthor = task.creationAuthor;
    this.executor = task.executor;
    this.creationDate = task.creationDate;
    this.planStartDate = task.planStartDate;
    this.planEndDate = task.planEndDate;
    this.endDate = task.endDate;
    this.status = task.status;
    this.order = task.order;
  }
}

async function getListUsers(url) {
  let data = [];
  try {
    const resp = await fetch(API_URL_LIST_USERS);
    const dataUsers = await resp.json();
    data = dataUsers.map((element) => {
      return new User(element);
    });
    console.log(data);
    showUsersInTable(data)
  } catch (e) {
    throw e;
  }
}

async function getListTasks(url) {
  let data = [];
  try {
    const resp = await fetch(API_URL_LIST_TASKS);
    const dataUsers = await resp.json();
    data = dataUsers.map((element) => {
      return new Task(element);
    });
    console.log(data);
    showTasks(data);
  } catch (e) {
    throw e;
  }
}

function showTasks(data) {
  const taskNames = document.querySelector(".tasks__names");
  data.forEach(element => {
    taskNames.innerHTML += `
    <div class="tasks__name-one" draggable="true" id=${element.id}>
      <h4 class="tasks__name-title">${element.subject}</h4>
    </div>
    `;
  });

}

function showUsersInTable(data) {
  const calendarTbody = document.querySelector(".calendar__tbody");
  data.forEach(element => {
    calendarTbody.innerHTML += `
    <tr class="calendar__tbody-tr">
      <td class="calendar__tbody-td calendar__tbody-td--first">
        ${element.surname} ${element.firstName}
      </td>
      <td class="calendar__tbody-td">
      </td>
      <td class="calendar__tbody-td"></td>
      <td class="calendar__tbody-td"></td>
      <td class="calendar__tbody-td"></td>
      <td class="calendar__tbody-td"></td>
      <td class="calendar__tbody-td"></td>
      <td class="calendar__tbody-td"></td>
      <td class="calendar__tbody-td"></td>
      <td class="calendar__tbody-td"></td>
      <td class="calendar__tbody-td"></td>
      <td class="calendar__tbody-td"></td>
      <td class="calendar__tbody-td"></td>
      <td class="calendar__tbody-td"></td>
      <td class="calendar__tbody-td"></td>
      <td class="calendar__tbody-td"></td>
    </tr>
    `;
  });

}

window.addEventListener("DOMContentLoaded", () => {
  const tasksNames = document.querySelector(".tasks__names");
  const calendarTbody = document.querySelector(".calendar__tbody");

  tasksNames.addEventListener("dragstart", dragstartHandler);

  calendarTbody.addEventListener("dragover", dragoverHandler);
  calendarTbody.addEventListener("drop", dropHandler);

  getListUsers(API_URL_LIST_USERS);
  getListTasks(API_URL_LIST_TASKS);
});

function dragstartHandler(ev) {
  console.log(ev.target);
  ev.dataTransfer.setData("id", ev.target.id);
}

function dragoverHandler(ev) {
  const isTdFirst = ev.target.classList.contains("calendar__tbody-td--first");
  if (isTdFirst) return;
  ev.preventDefault();
}

function dropHandler(ev) {
  const data = ev.dataTransfer.getData("id");
  if (!data) return;

  const elem = document.getElementById(data);
  const taskTitleElem = elem.querySelector(".tasks__name-title");

  let isTbodyTd = ev.target.classList.contains("calendar__tbody-td");
  if (!isTbodyTd) {
    let elemParent = ev.target.parentNode;
    while (elemParent.classList) {
      isTbodyTd = elemParent.classList.contains("calendar__tbody-td");
      if (isTbodyTd) {
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
