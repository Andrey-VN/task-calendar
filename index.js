// const API_URL_LIST_USERS =
//     "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users";
// const API_URL_LIST_TASKS =
//     "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks";

const API_URL_LIST_USERS =
    './file/users.json';
const API_URL_LIST_TASKS =
    './file/tasks.json';

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

//Функции с принятием данных///
async function getListUsersDate(url) {
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        return data;
    } catch (e) {
        throw e;
    }
}

async function getListTasksDate(url) {
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        return data;
    } catch (e) {
        throw e;
    }
}


//Функции с преобразованием данных///
function getListUsersView(data) {
    return data.map((element) => {
        return new User(element);
    });
}

function getListTasksView(data) {
    return data.map((element) => {
        return new Task(element);
    });
}


//Функция инициализации страницы///
async function onInit() {

    const page = document.querySelector(".container");
    const load = document.querySelector(".app-root");

    page.classList.add("display-none")
    load.classList.add("display-flex")

    const [dataTasksDate, dataUsersDate] = await Promise.all([getListTasksDate(API_URL_LIST_TASKS), getListUsersDate(API_URL_LIST_USERS)])
    const [dataTasks, dataUsers] = [getListTasksView(dataTasksDate), getListUsersView(dataUsersDate)]

    page.classList.remove("display-none")
    load.classList.remove("display-flex")

    load.classList.add("display-none")
    page.classList.add("display-block")

    let createColumnsInTable = columnsDateCreate();

    const tasksNames = document.querySelector(".tasks__names");
    const calendarTbody = document.querySelector(".table-flex__body");

    const btnToday = document.querySelector(".btns__today");
    const btnLeft = document.querySelector(".btns__left");
    const btnRight = document.querySelector(".btns__right");
    const btnWeek = document.querySelector(".btns__week");
    // const btnSearch = document.querySelector(".tasks__search-btn");
    const searchText = document.querySelector(".tasks__search-text");

    tasksNames.addEventListener("dragstart", dragstartHandler);
    calendarTbody.addEventListener("dragstart", dragstartHandlerInTable, true);

    calendarTbody.addEventListener("dragover", dragoverHandler);
    calendarTbody.addEventListener("drop", dropHandler);
    calendarTbody.addEventListener("dragenter", dragEnter);
    calendarTbody.addEventListener("dragleave", dragLeave);

    function dragEnter(ev) {
        ev.preventDefault();
        setTimeout(() => {
            const trItem = ev.target.closest(".table-flex__row");
            if (trItem && !trItem.classList.contains("table-flex__cell--content-enter")) {
                for (let td of trItem.children) {
                    td.classList.add("table-flex__cell--content-enter");
                }
            }
        }, 0);
    }

    function dragLeave(ev) {
        const trItem = ev.target.closest(".table-flex__row");
        if (trItem) {
            for (let td of trItem.children) {
                td.classList.remove("table-flex__cell--content-enter");
            }
        }
    }

    function dragstartHandler(ev) {
        ev.dataTransfer.setData("id", ev.target.getAttribute("data-id-task"));
        ev.dataTransfer.setData("data", "tasks");
        
    }

    function dragstartHandlerInTable(ev) {
        ev.dataTransfer.setData("id", ev.target.closest(".table-flex__row").getAttribute("data-id-row"));
        ev.dataTransfer.setData("idTask", ev.target.closest(".tbody-td__task").getAttribute("data-id-task"));
        ev.target.classList.remove("tbody-td__task--tooltip")
        ev.dataTransfer.setData("data", "table");
    }

    function dragoverHandler(ev) {
        ev.preventDefault();
    }

    function dropHandler(ev) {
        console.log(ev.target)

        const milesInSeconds = 86400000;
        const id = ev.dataTransfer.getData("id");
        const data = ev.dataTransfer.getData("data");

        console.log(id)

        if (!id && !data) return;

        
        if (data === "tasks") { //Условие для перетаскивания задачи из бэклога в таблицу
            const elem = document.querySelector(`[data-id-task = "${id}"]`);
            const task = dataTasks.find((e) => e.id === elem.getAttribute("data-id-task"));
            task.executor = ev.target.closest(".table-flex__row").getAttribute("data-id-row");
            

            const getAttTd = ev.target.closest(".table-flex__cell").getAttribute("data-id-td");
            const startDateInTd = JSON.parse(getAttTd).dateInTd
            
            if(startDateInTd) {
                changeStartDate(startDateInTd, task)
            } 

            createColumnsInTable();
            elem.parentNode.removeChild(elem);
        } else if (data === "table") { //Условие для перетаскивания задачи внутри таблицы
            const idTask = ev.dataTransfer.getData("idTask");
            const task = dataTasks.find((e) => (e.executor !== null && (e.executor.toString() === id)) && (e.id !== null && e.id.toString() === idTask));
            task.executor = ev.target.closest(".table-flex__row").getAttribute("data-id-row");

            const getAttTd = ev.target.closest(".table-flex__cell").getAttribute("data-id-td");
            const startDateInTd = JSON.parse(getAttTd).dateInTd

            if(startDateInTd) {
                changeStartDate(startDateInTd, task)
            }

            createColumnsInTable();

        }
        function changeStartDate(startDateInTd, task) {
            const deltaDay = (Number(Date.parse(startDateInTd)) - Number(Date.parse(task.planStartDate))) /milesInSeconds;
            task.planStartDate = startDateInTd;

            const endDateInTd = getDateWithDash(new Date(new Date(task.planEndDate).setDate(new Date(task.planEndDate).getDate() + deltaDay)));
            task.planEndDate = endDateInTd;
        }
    }

    //Функция отображения задач в бэклоге
    function showTasks(data) {
        const taskNames = document.querySelector(".tasks__names");
        taskNames.innerHTML = "";
        if (data) {
            data.forEach((element) => {
                if (!element.executor) {

                    // Cоздания задания в списке задач
                    const taskInBacklogTemp = document.getElementById("task-in-backlog");
                    const tasksNameOne = taskInBacklogTemp.content.cloneNode(true).querySelector(".tasks__name-one");

                    tasksNameOne.setAttribute("data-id-task", element.id)
                    tasksNameOne.querySelector(".tasks__name-title").textContent = element.subject;

                    taskNames.appendChild(tasksNameOne)
                }
            });
        }
    }

    //Функция отображения дат в таблице
    function columnsDateCreate(column = 14) {
        let oneWeek = 0;

        return function (side) {
            const arrayDataObj = [];
            if (side === "right") {
                oneWeek += column;
            } else if (side === "left") {
                oneWeek -= column;
            } else if (side === "today") {
                oneWeek = 0;
            }

            const calendarTheadTR = document.querySelector(".table-flex__header");
            calendarTheadTR.innerHTML = `<div class="table-flex__cell--header table-flex__cell table-flex__cell--first"></div>`;
            if (column >= 7) {
                oneWeek = getDateInThDelta(oneWeek);
            }

            for (let i = 0; i < column; i++) {
                calendarTheadTR.innerHTML +=
                `<div class="table-flex__cell--header table-flex__cell">
                    <div class="table-flex__cell--nested-block-date">
                        ${getDateInTh(oneWeek + i).dateInTh}
                    <div>
                </div>`;
                arrayDataObj.push(getDateInTh(oneWeek + i));
            }

            showUsersInTable(dataUsers, column, arrayDataObj);
        };
    }

    //Функция отображения пользователей в таблице с из задачами
    function showUsersInTable(data, column = 14, arrayDataObj) {
        const milesInSeconds = 86400000;
        const calendarTbody = document.querySelector(".table-flex__body");

        calendarTbody.innerHTML = "";


        data.forEach((user, items, obj) => {

            //Создание строки таблицы с именеем пользователя в первой ячейке
            const trUserTemplate = document.getElementById("tr-in-table");
            const trUser = trUserTemplate.content.cloneNode(true).querySelector(".table-flex__row");
            const td = trUser.querySelector(".table-flex__cell--first")
            const nameUser = trUser.querySelector(".table-flex__cell--nested-block-name-user");

            td.setAttribute("data-id-td", user.id);
            nameUser.textContent = `${user.surname} ${user.firstName}`;
            trUser.setAttribute("data-id-row", user.id);
            
            
            const taskUser = [];
            dataTasks.forEach((e) => {
                if (e.executor !== null && (e.executor.toString() === user.id.toString())) {
                    taskUser.push(e);
                }
            });

            for (let i = 0; i < column; i++) {
                const tdUser = document.createElement("div");
                
                // tdUser.dataset.tr_id = user.id;
                tdUser.classList.add("table-flex__cell");
                tdUser.classList.add("table-flex__cell--content");
                // tdUser.setAttribute("data-id-td", `${user.id}-${arrayDataObj[i].dateInTd}`);
                tdUser.setAttribute("data-id-td", JSON.stringify(getInfoTdInAttr(user.id, arrayDataObj[i])));
                // tdUser.dataset("td-id", )
                
                if (arrayDataObj[i].dateInTd == getDateInTh(0).dateInTd) tdUser.classList.add("tasks__today");
                if (arrayDataObj[i].date.week == 6 || arrayDataObj[i].date.week == 0) tdUser.classList.add("tasks__day-off");
                

                // if(taskUser.some(e => e.planStartDate.contains()))
                // console.log(taskUser.some(e => e.planStartDate.contains()))


                if (taskUser && taskUser.length > 0) {
                    taskUser.forEach((e) => {
                        if (e.planStartDate === arrayDataObj[i].dateInTd) {

                            const div = document.createElement("div");
                            div.classList.add("tbody-td__task");
                            div.setAttribute("draggable", "true")
                            div.setAttribute("data-id-task", e.id)
                            div.setAttribute("data-name-task", e.subject)
                            
                            const hintText = "Задача, отображенная у пользователя"
                            div.setAttribute("data-tooltip", hintText)
                            div.classList.add("tbody-td__task--tooltip")

                            const title = document.createElement("h4");
                            title.classList.add("tdbody-td__title");
                            title.textContent = e.subject;

                            div.appendChild(title)

                            let deltaDay = (Number(Date.parse(e.planEndDate)) - Number(Date.parse(e.planStartDate)))/milesInSeconds;
                            if (deltaDay > 1) {
                                div.style.width = `calc(${100 * (deltaDay > 14 ? 14 : deltaDay)}% + ${(deltaDay > 14 ? 14 : deltaDay) - 3}px)`;
                            }

                            if(new Date(e.planEndDate) < new Date()) {
                                div.classList.add("tbody-td__task--over")
                            }

                            tdUser.appendChild(div);
                        }  else if(e.planEndDate === arrayDataObj[i].dateInTd && !arrayDataObj.some(d => d.dateInTd === e.planStartDate)) {
                            const div = document.createElement("div");
                            div.classList.add("tbody-td__task");
                            div.setAttribute("draggable", "true")
                            div.setAttribute("data-id-task", e.id)
                            div.setAttribute("data-name-task", e.subject)
                            
                            const hintText = "Задача, отображенная у пользователя"
                            div.setAttribute("data-tooltip", hintText)
                            div.classList.add("tbody-td__task--tooltip")

                            const title = document.createElement("h4");
                            title.classList.add("tdbody-td__title");
                            title.textContent = e.subject;

                            div.appendChild(title)

                            let deltaDay = (Number(Date.parse(e.planEndDate)) - Number(Date.parse(e.planStartDate)))/milesInSeconds;
                            if (deltaDay > 1) {
                                div.style.width = `calc(${100 * (deltaDay > 14 ? 14 : deltaDay)}%`;
                                div.style.left = `calc(${-100 * (deltaDay > 14 ? 14 : deltaDay)}%`;
                            }

                            if(new Date(e.planEndDate) < new Date()) {
                                div.classList.add("tbody-td__task--over")
                            }

                            tdUser.appendChild(div);
                        }
                        
                        else if (Number(Date.parse(e.planStartDate)) < Number(Date.parse(arrayDataObj[i].dateInTd)) <= Number(Date.parse(e.planEndDate))) {
                            const div = document.createElement("div");
                            div.classList.add("tbody-td__task");
                            div.setAttribute("draggable", "true")

                            const title = document.createElement("h4");
                            title.classList.add("tdbody-td__title");

                            div.appendChild(title)

                            div.style.visibility = "hidden";
                            tdUser.appendChild(div);
                        } else if (Number(Date.parse(arrayDataObj[0].dateInTd)) !=Number(Date.parse(e.planStartDate)) &&Number(Date.parse(arrayDataObj[0].dateInTd)) <Number(Date.parse(e.planEndDate))) {
                        } 


                        // console.log(arrayDataObj)

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

    const clickInCalendarView = ChangeInCalendarViewBtn();
    clickInCalendarView.changeResizeInCalendarView();
    btnWeek.addEventListener("click", clickInCalendarView.changeClickInCalendarViewBtn);
    window.addEventListener('resize', clickInCalendarView.changeResizeInCalendarView);

    function ChangeInCalendarViewBtn() {

        let stateBtn;

        const oneWeek = "One week";
        const twoWeeks = "Two weeks";
        const threeDays = "Three days";

        const twoWeeksNumber = 14;
        const oneWeekNumber = 7;
        const threeDaysNumber = 3;

        const weekTitle = document.querySelector(".btns__week-title")

        return {
            changeClickInCalendarViewBtn: function () {

                console.log(stateBtn)

                if (stateBtn === twoWeeksNumber) {
                    stateBtn = oneWeekNumber;
                    weekTitle.textContent = oneWeek;
                    createColumnsInTable = columnsDateCreate(oneWeekNumber);
                } else if (stateBtn === oneWeekNumber) {
                    stateBtn = threeDaysNumber;
                    weekTitle.textContent = threeDays;
                    createColumnsInTable = columnsDateCreate(threeDaysNumber);
                } else if (stateBtn === threeDaysNumber) {
                    stateBtn = twoWeeksNumber;
                    weekTitle.textContent = twoWeeks;
                    createColumnsInTable = columnsDateCreate(twoWeeksNumber);
                }

                createColumnsInTable();
            },
            changeResizeInCalendarView: function () {

                const clientWidth = document.documentElement.clientWidth;

                if (clientWidth > 992) {
                    stateBtn = twoWeeksNumber;
                    weekTitle.textContent = twoWeeks;
                    createColumnsInTable = columnsDateCreate(twoWeeksNumber)
                } else if (clientWidth <= 992 && clientWidth > 768) {
                    stateBtn = oneWeekNumber;
                    weekTitle.textContent = oneWeek;
                    createColumnsInTable = columnsDateCreate(oneWeekNumber)
                } else if (clientWidth <= 768) {
                    stateBtn = threeDaysNumber;
                    weekTitle.textContent = threeDays;
                    createColumnsInTable = columnsDateCreate(threeDaysNumber)
                }
                createColumnsInTable();
            }
        }
    }

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
};

onInit();

//Функции с преобразованием дат//

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
        dateInTd:getDateWithDash(date),
        date: getCurrentDateInTh(date),
    };
}
function getDateWithDash(date) {
    return  getCurrentDateInTh(date).year +
            "-" +
            getCurrentDateInTh(date).month +
            "-" +
            getCurrentDateInTh(date).day;

}

function getCurrentDateInTh(date) {
    const day =
        date.getDate().toString().length === 1
            ? "0" + date.getDate()
            : date.getDate();
    const month =
        (date.getMonth() + 1).toString().length === 1
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

function getInfoTdInAttr(id, arrayDataObj) {
    return {
        id,
        day: arrayDataObj.date.day,
        month: arrayDataObj.date.month,
        year: arrayDataObj.date.year,
        week: arrayDataObj.date.week,
        dateInTd : arrayDataObj.dateInTd
    };
}

