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

window.addEventListener("DOMContentLoaded", async () => {
  const dataTasks = await getListTasks(API_URL_LIST_TASKS);
  const dataUsers = await getListUsers(API_URL_LIST_USERS);
  let createColumnsInTable = columnsDateCreate(7);

  const tasksNames = document.querySelector(".tasks__names");
  const calendarTbody = document.querySelector(".calendar__tbody");

  const btnToday = document.querySelector(".btns__today");
  const btnLeft = document.querySelector(".btns__left");
  const btnRight = document.querySelector(".btns__right");
  const btnWeek = document.querySelector(".btns__week");

  tasksNames.addEventListener("dragstart", dragstartHandler);
  calendarTbody.addEventListener("dragover", dragoverHandler);
  calendarTbody.addEventListener("drop", dropHandler);

  function dragstartHandler(ev) {
    ev.dataTransfer.setData("id", ev.target.id);
  }

  function dragoverHandler(ev) {
    ev.preventDefault();
  }

  function dropHandler(ev) {
    const data = ev.dataTransfer.getData("id");
    if (!data) return;

    const elem = document.getElementById(data);
    let task = dataTasks.find((e) => e.id == elem.id);

    let isTbodyTr = ev.target.classList.contains("calendar__tbody-tr");
    if (!isTbodyTr) {
      let elemParent = ev.target.parentNode;
      while (elemParent.classList) {
        isTbodyTr = elemParent.classList.contains("calendar__tbody-tr");
        if (isTbodyTr) {
          task.executor = elemParent.id
          break;
        }
        elemParent = elemParent.parentNode;
      }
    } else {
      task.executor = elem.id
      
    }
    createColumnsInTable();

    elem.parentNode.removeChild(elem);
  }

  async function getListUsers(url) {
    try {
      const resp = await fetch(API_URL_LIST_USERS);
      const data = await resp.json();
      return data.map((element) => {
        return new User(element);
      });
    } catch (e) {
      throw e;
    }
  }

  async function getListTasks(url) {
    try {
      const resp = await fetch(API_URL_LIST_TASKS);
      const data = await resp.json();
      return await data.map((element) => {
        return new Task(element);
      });
    } catch (e) {
      throw e;
    }
  }

  function showTasks(data) {
    const taskNames = document.querySelector(".tasks__names");
    console.log(data);
    data.forEach((element) => {
      if(!element.executor) {
        taskNames.innerHTML += `
        <div class="tasks__name-one" draggable="true" id=${element.id}>
          <h4 class="tasks__name-title">${element.subject}</h4>
        </div>
        `;
      }
    });
  }

  function columnsDateCreate(column = 14) {
    let oneWeek = 0;

    return function (side) {
      let dataObj = [];
      if (side == "right") {
        oneWeek += column;
      } else if (side == "left") {
        oneWeek -= column;
      } else if (side === "today") {
        oneWeek = 0;
      } 
      const calendarTheadTR = document.querySelector(".calendar__thead-tr");
      calendarTheadTR.innerHTML = `<th class="calendar__thead-th calendar__thead-th--first"></th>`;
      oneWeek = getDateInThDelta(oneWeek);
      console.log(oneWeek);
      for (let i = 0; i < column; i++) {
        calendarTheadTR.innerHTML += `<th class="calendar__thead-th">${
          getDateInTh(oneWeek + i).dateInTh
        }</th>`;
        dataObj.push(getDateInTh(oneWeek + i).dateInTd);
      }
      showUsersInTable(dataUsers, column, dataObj);
    };
  }

  function showUsersInTable(data, column = 14, dataObj) {
    const calendarTbody = document.querySelector(".calendar__tbody");
    calendarTbody.innerHTML = "";
    data.forEach((user) => {
      const trUser = document.createElement("tr");
      trUser.classList.add("calendar__tbody-tr");
      trUser.id = user.id;

      trUser.innerHTML = `
        <td class="calendar__tbody-td calendar__tbody-td--first">
          ${user.surname} ${user.firstName}
        </td>
      `;

      let taskUser = [];
      dataTasks.forEach((e) => {
        if(e.executor == user.id) {
          taskUser.push(e)
        }
      });
      if (taskUser) console.log(taskUser);

      for (let i = 0; i < column; i++) {
        const tdUser = document.createElement("td");
        tdUser.classList.add("calendar__tbody-td")
        if (taskUser && taskUser.length > 0) {
          taskUser.forEach(e => {
            if(e.planStartDate === dataObj[i]) {
              tdUser.innerHTML += `
              <div class="tbody-td__task">
                <h4 class="tdbody-td__title">${e.subject}</h4>
              </div>
            `;
            }
          })
        }
        trUser.appendChild(tdUser);
      }

      calendarTbody.appendChild(trUser);
    });
  }


  btnToday.addEventListener("click", () => {
    createColumnsInTable("today");
  });
  btnLeft.addEventListener("click", () => {
    createColumnsInTable("left");
  });
  btnRight.addEventListener("click", () => {
    createColumnsInTable("right");
  });
  btnWeek.addEventListener("click", function() {
    let oneWeek = "One week";
    let twoWeeks = "Two weeks"

    const oneWeekNumber = 14;
    const twoWeeksNumber = 7;
    if(this.innerText.toLowerCase() === oneWeek.toLowerCase()) {
      this.innerText = twoWeeks;
      createColumnsInTable = columnsDateCreate(twoWeeksNumber);
    } else {
      this.innerText = oneWeek;
      createColumnsInTable = columnsDateCreate(oneWeekNumber);
    }
    createColumnsInTable();
  });

  //Порядок внизу не менять!!!!
  createColumnsInTable("today");
  showTasks(dataTasks);
  
});

function getDateInThDelta(day) {
  const date = new Date();
  date.setDate(date.getDate() + day);
  console.log(date.getDate());

  if (date.getDay() != 1) {
    return getDateInThDelta(day - 1);
  }

  return day;
}

function getDateInTh(day) {
  const date = new Date();
  date.setDate(date.getDate() + day);

  return {
    dateInTh:
      getCurrentDateInTh(date).day + "." + getCurrentDateInTh(date).month,
    dateInTd:
      getCurrentDateInTh(date).year +
      "-" +
      getCurrentDateInTh(date).month +
      "-" +
      getCurrentDateInTh(date).day,
  };
}

function getCurrentDateInTh(date) {
  const day =
    date.getDate().toString().length == 1
      ? "0" + date.getDate()
      : date.getDate();
  const month =
    (date.getMonth() + 1).toString().length == 1
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  const year = date.getFullYear().toString();

  return {
    day: day,
    month: month,
    year: year,
  };
}
