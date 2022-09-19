const dragAndDrop = () => {
  // const card = document.querySelector('.js-card')
  // const cells = document.querySelectorAll('.js-cell')

  // const dragStart = function() {
  //     setTimeout(() => {
  //         this.classList.add('hide')
  //     }, 0)
  // }
  // const dragEnd = function() {
  //     this.classList.remove('hide')
  // }

  // const dragOver = function(evt) {
  //     evt.preventDefault();
  // }

  // const dragEnter = function(evt) {
  //     evt.preventDefault();
  //     this.classList.add('hovered')
  // }

  // const dragLeave = function() {
  //     this.classList.remove('hovered')
  // }

  // const dragDrop = function() {
  //     this.classList.remove('hovered')
  //     this.append(card)
  // }

  // cells.forEach((cell) => {
  //     cell.addEventListener('dragover', dragOver) //когда находимся над карточкой, в которую могли бы перетащить элемент
  //     cell.addEventListener('dragenter', dragEnter) //когда входим в карточки, в которую могли бы перетащить элемент
  //     cell.addEventListener('dragleave', dragLeave) //когда выходим из карточки, в которую могли бы перетащить элемент
  //     cell.addEventListener('drop', dragDrop) //когда отпускаем элемент над карточкой, в которую могли бы перетащить элемент
  // })

  // card.addEventListener('dragstart', dragStart)
  // card.addEventListener('dragend', dragEnd)

  const list = document.querySelector(".list");

  const dragStart = function (evt) {
    evt.dataTransfer.setData('class', evt.target.classList)
    console.log(evt.target);
    if (evt.target.classList.contains("js-card")) {
      setTimeout(() => {
        evt.target.classList.add("hide");
      }, 0);
    }
  };
  const dragEnd = function (evt) {
    if (evt.target.classList.contains("js-card")) {
      evt.target.classList.remove("hide");
    }
  };

  const dragOver = function (evt) {
    if (evt.target.classList.contains("js-cell")) {
      evt.preventDefault();
    }
  };

  const dragEnter = function (evt) {
    if (evt.target.classList.contains("js-cell")) {
      evt.preventDefault();
      evt.target.classList.add("hovered");
    }
  };

  const dragLeave = function (evt) {
    if (evt.target.classList.contains("js-cell")) {
      evt.target.classList.remove("hovered");
    }
  };

  const dragDrop = function (evt) {
    let classItem = evt.dataTransfer.getData("class");
    console.log(document.getElementsByClassName(`${classItem}`))
    if (evt.target.classList.contains("js-cell")) {
      evt.target.classList.remove("hovered");
      evt.target.append(document.getElementsByClassName(`${classItem}`)[0]);
    }
  };

  list.addEventListener("dragover", dragOver); //когда находимся над карточкой, в которую могли бы перетащить элемент
  list.addEventListener("dragenter", dragEnter); //когда входим в карточки, в которую могли бы перетащить элемент
  list.addEventListener("dragleave", dragLeave); //когда выходим из карточки, в которую могли бы перетащить элемент
  list.addEventListener("drop", dragDrop); //когда отпускаем элемент над карточкой, в которую могли бы перетащить элемент

  list.addEventListener("dragstart", dragStart);
  list.addEventListener("dragend", dragEnd);
};

dragAndDrop();
