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

    page.classList.add("display-none")
    load.classList.add("display-flex")

    const [dataTasks, dataUsers] = await Promise.all([getListTasks(API_URL_LIST_TASKS), getListUsers(API_URL_LIST_USERS)])

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
    calendarTbody.addEventListener("dragstart", dragstartHandlerInTable);

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
        ev.dataTransfer.setData("id", ev.target.id);
        ev.dataTransfer.setData("data", "tasks");
    }

    function dragstartHandlerInTable(ev) {
        ev.dataTransfer.setData("id", ev.target.closest(".table-flex__row").id);
        ev.dataTransfer.setData("data", "table");
    }

    function dragoverHandler(ev) {
        ev.preventDefault();
    }

    function dropHandler(ev) {

        const id = ev.dataTransfer.getData("id");
        const data = ev.dataTransfer.getData("data");

        if (!id && !data) return;

        if (data === "tasks") {
            console.log("tasks")
            const elem = document.getElementById(id);
            const task = dataTasks.find((e) => e.id === elem.id);

            task.executor = ev.target.closest(".table-flex__row").id;

            createColumnsInTable();
            elem.parentNode.removeChild(elem);
        } else if (data === "table") {
            console.log(id)
            console.log(dataTasks)
            const task = dataTasks.find((e) => e.executor !== null && (e.executor.toString() === id));
            task.executor = ev.target.closest(".table-flex__row").id;

            createColumnsInTable();
            // elem.parentNode.removeChild(elem);
        }
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
            return data.map((element) => {
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

                    // Cоздания задания в списке задач
                    const taskInBacklogTemp = document.getElementById("task-in-backlog");
                    const tasksNameOne = taskInBacklogTemp.content.cloneNode(true).querySelector(".tasks__name-one");

                    tasksNameOne.id = element.id;
                    tasksNameOne.querySelector(".tasks__name-title").textContent = element.subject;

                    taskNames.appendChild(tasksNameOne)
                }
            });
        }
    }

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

    function showUsersInTable(data, column = 14, arrayDataObj) {
        const milesInSeconds = 86400000;
        const calendarTbody = document.querySelector(".table-flex__body");

        calendarTbody.innerHTML = "";


        data.forEach((user) => {

            //Создание строки таблицы с именеем пользователя в первой ячейке
            const trUserTemplate = document.getElementById("tr-in-table");
            const trUser = trUserTemplate.content.cloneNode(true).querySelector(".table-flex__row");
            const nameUser = trUser.querySelector(".table-flex__cell--nested-block-name-user");
            nameUser.textContent = `${user.surname} ${user.firstName}`;

            const taskUser = [];
            dataTasks.forEach((e) => {
                if (e.executor !== null && (e.executor.toString() === user.id.toString())) {
                    taskUser.push(e);
                }
            });

            for (let i = 0; i < column; i++) {
                const tdUser = document.createElement("div");
                trUser.id = user.id;
                tdUser.classList.add("table-flex__cell");
                tdUser.classList.add("table-flex__cell--content");

                if (arrayDataObj[i].date.week == 6 || arrayDataObj[i].date.week == 0) tdUser.classList.add("tasks__day-off");
                if (arrayDataObj[i].dateInTd == getDateInTh(0).dateInTd) tdUser.classList.add("tasks__today");


                if (taskUser && taskUser.length > 0) {
                    taskUser.forEach((e, index, array) => {
                        if (e.planStartDate === arrayDataObj[i].dateInTd) {

                            const div = document.createElement("div");
                            div.classList.add("tbody-td__task");
                            div.setAttribute("draggable", "true")

                            const title = document.createElement("h4");
                            title.classList.add("tdbody-td__title");
                            title.textContent = e.subject;

                            div.appendChild(title)

                            let deltaDay =
                                (Number(Date.parse(e.planEndDate)) -
                                    Number(Date.parse(e.planStartDate))) /
                                milesInSeconds;
                            if (deltaDay > 1) {
                                div.style.width = `calc(${100 * deltaDay}% + ${deltaDay - 3
                                    }px)`;
                            }
                            tdUser.appendChild(div);
                        } else if (
                            Number(Date.parse(e.planStartDate)) <
                            Number(Date.parse(arrayDataObj[i].dateInTd)) <=
                            Number(Date.parse(e.planEndDate))
                        ) {
                            const div = document.createElement("div");
                            div.classList.add("tbody-td__task");
                            div.setAttribute("draggable", "true")

                            const title = document.createElement("h4");
                            title.classList.add("tdbody-td__title");

                            div.appendChild(title)

                            div.style.visibility = "hidden";
                            tdUser.appendChild(div);
                        } else if (
                            Number(Date.parse(arrayDataObj[0].dateInTd)) !=
                            Number(Date.parse(e.planStartDate)) &&
                            Number(Date.parse(arrayDataObj[0].dateInTd)) <
                            Number(Date.parse(e.planEndDate))
                        ) {
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
            changeClickInCalendarViewBtn: function() {

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

                if (!stateBtn) {
                    stateBtn = twoWeeksNumber;
                    weekTitle.textContent = twoWeeks;
                    createColumnsInTable = columnsDateCreate(twoWeeksNumber);
                }

                createColumnsInTable();
            },
            changeResizeInCalendarView: function() {

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


