const API_URL_LIST_USERS =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users";
const API_URL_LIST_TASKS =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks";

class User {
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.surname = user.surname;
    this.firstName = user.firstName;
    this.secondName = user.isecondName;
  }
}

class Task {
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
  const page = document.querySelector(".container");
  const load = document.querySelector(".app-root");
  page.style.display = "none";
  load.style.display = "flex";

  const dataTasks = await getListTasks(API_URL_LIST_TASKS);
  const dataUsers = await getListUsers(API_URL_LIST_USERS);

  load.style.display = "none";
  page.style.display = "block";

  let createColumnsInTable = columnsDateCreate();

  const tasksNames = document.querySelector(".tasks__names");
  const calendarTbody = document.querySelector(".calendar__tbody");

  const btnToday = document.querySelector(".btns__today");
  const btnLeft = document.querySelector(".btns__left");
  const btnRight = document.querySelector(".btns__right");
  const btnWeek = document.querySelector(".btns__week");
  // const btnSearch = document.querySelector(".tasks__search-btn");
  const searchText = document.querySelector(".tasks__search-text");

  tasksNames.addEventListener("dragstart", dragstartHandler);
  calendarTbody.addEventListener("dragover", dragoverHandler);
  calendarTbody.addEventListener("drop", dropHandler);
  calendarTbody.addEventListener("dragenter", dragEnter);
  calendarTbody.addEventListener("dragleave", dragLeave);

  function dragEnter(ev) {
    ev.preventDefault();
    setTimeout(() => {
      const trItem = ev.target.closest(".calendar__tbody-tr");
      if (trItem && !trItem.classList.contains("calendar__tbody-td--enter")) {
        for (let td of trItem.children) {
          td.classList.add("calendar__tbody-td--enter");
        }
      }
    }, 0);
  }

  function dragLeave(ev) {
    const trItem = ev.target.closest(".calendar__tbody-tr");
    if (trItem) {
      for (let td of trItem.children) {
        td.classList.remove("calendar__tbody-td--enter");
      }
    }
  }

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
    const task = dataTasks.find((e) => e.id == elem.id);
    task.executor = ev.target.closest(".calendar__tbody-tr").id;
    createColumnsInTable();
    elem.parentNode.removeChild(elem);
  }

  async function getListUsers(url) {
    try {
      const resp = await fetch(url);
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
      const resp = await fetch(url);
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
    taskNames.innerHTML = "";
    if (data) {
      data.forEach((element) => {
        if (!element.executor) {
          taskNames.innerHTML += `
          <div class="tasks__name-one" draggable="true" id=${element.id}>
            <h4 class="tasks__name-title">${element.subject}</h4>
          </div>
          `;
        }
      });
    }
  }

  function columnsDateCreate(column = 14) {
    let oneWeek = 0;

    return function (side) {
      const arrayDataObj = [];
      if (side == "right") {
        oneWeek += column;
      } else if (side == "left") {
        oneWeek -= column;
      } else if (side === "today") {
        oneWeek = 0;
      }
      const calendarTheadTR = document.querySelector(".calendar__thead-tr");
      calendarTheadTR.innerHTML = `<th class="calendar__thead-th calendar__thead-th--first"></th>`;
      if (column >= 7) {
        oneWeek = getDateInThDelta(oneWeek);
      }

      for (let i = 0; i < column; i++) {
        calendarTheadTR.innerHTML += `<th class="calendar__thead-th">${
          getDateInTh(oneWeek + i).dateInTh
        }</th>`;
        arrayDataObj.push(getDateInTh(oneWeek + i));
      }
      showUsersInTable(dataUsers, column, arrayDataObj);
    };
  }

  function showUsersInTable(data, column = 14, arrayDataObj) {
    const milesInSeconds = 86400000;
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

      const taskUser = [];
      dataTasks.forEach((e) => {
        if (e.executor == user.id) {
          taskUser.push(e);
        }
      });

      for (let i = 0; i < column; i++) {
        const tdUser = document.createElement("td");
        tdUser.classList.add("calendar__tbody-td");

        if(arrayDataObj[i].date.week == 6 || arrayDataObj[i].date.week == 0) tdUser.classList.add("tasks__day-off");
        if(arrayDataObj[i].dateInTd == getDateInTh(0).dateInTd) tdUser.classList.add("tasks__today");
        

        if (taskUser && taskUser.length > 0) {
          taskUser.forEach((e, index, array) => {
            if (e.planStartDate === arrayDataObj[i].dateInTd) {
              const div = document.createElement("div");
              div.classList.add("tbody-td__task");
              div.innerHTML += `
                <h4 class="tdbody-td__title">${e.subject}</h4>
              `;
              let deltaDay =
                (Number(Date.parse(e.planEndDate)) -
                  Number(Date.parse(e.planStartDate))) /
                milesInSeconds;
              // div.style.width = `${(100*deltaDay) + (deltaDay)}%`
              if (deltaDay > 1) {
                div.style.width = `calc(${100 * deltaDay}% + ${
                  deltaDay - 3
                }px)`;
              }
              tdUser.appendChild(div);
            } else if (
              Number(Date.parse(e.planStartDate)) <
              Number(Date.parse(arrayDataObj[i].dateInTd)) <=
              Number(Date.parse(e.planEndDate))
            ) {
              // console.log(e.planStartDate);
              // console.log(arrayDataObj[i].dateInTd);
              // console.log(e.planEndDate);
              // console.log("///////////");
              const div = document.createElement("div");
              div.classList.add("tbody-td__task");
              div.innerHTML += `
                <h4 class="tdbody-td__title"></h4>
              `;
              div.style.visibility = "hidden";
              tdUser.appendChild(div);
            } else if (
              Number(Date.parse(arrayDataObj[0].dateInTd)) !=
                Number(Date.parse(e.planStartDate)) &&
              Number(Date.parse(arrayDataObj[0].dateInTd)) <
                Number(Date.parse(e.planEndDate))
            ) {
              // console.log("dsds");
              // const div = document.createElement("div");
              // div.classList.add("tbody-td__task")
              // div.innerHTML += `
              //   <h4 class="tdbody-td__title">${e.subject}</h4>
              // `;
              // let deltaDay = (Number(Date.parse(arrayDataObj[0].dateInTd)) - Number(Date.parse(e.planStartDate)))/milesInSeconds;
              // // div.style.width = `${(100*deltaDay) + (deltaDay)}%`
              // if(deltaDay > 1) {
              //   div.style.width = `calc(${100*deltaDay}% + ${(deltaDay - 3)}px)`
              // }
              // tdUser.appendChild(div);
            }
          });
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
  btnWeek.addEventListener("click", function () {
    const oneWeek = "One week";
    const twoWeeks = "Two weeks";
    const threeDays = "Three days";

    const twoWeeksNumber = 14;
    const oneWeekNumber = 7;
    const threeDaysNumber = 3;

    if (this.innerText.toLowerCase() === threeDays.toLowerCase()) {
      this.innerText = twoWeeks;
      createColumnsInTable = columnsDateCreate(threeDaysNumber);
    } else if (this.innerText.toLowerCase() === twoWeeks.toLowerCase()) {
      this.innerText = oneWeek;
      createColumnsInTable = columnsDateCreate(twoWeeksNumber);
    } else if (this.innerText.toLowerCase() === oneWeek.toLowerCase()) {
      this.innerText = threeDays;
      createColumnsInTable = columnsDateCreate(oneWeekNumber);
    }
    createColumnsInTable();
  });
  searchText.addEventListener("keyup", function () {
    const text = this.value.toLowerCase().trim();
    const dataSearch = [];
    dataTasks.forEach((d) => {
      const textInArray = d.subject.toLowerCase().trim();
      if (textInArray.indexOf(text) !== -1) {
        dataSearch.push(d);
      }
    });
    showTasks(dataSearch);
  });

  //Порядок внизу не менять!!!!
  createColumnsInTable("today");
  showTasks(dataTasks);
});

function getDateInThDelta(day) {
  const date = new Date();
  date.setDate(date.getDate() + day);

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
    date: getCurrentDateInTh(date),
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

  const week = date.getDay().toString();

  return {
    day: day,
    month: month,
    year: year,
    week: week
  };
}
