const KEY_ENTER = 13;
const KEY_ESC = 27;
const COUNT_TODO = 5;

const todoInput = document.querySelector('.form-control');
const elementListButton = document.querySelector('.btn-add');
const containerList = document.querySelector('.todo-container__list');
const checkboxAll = document.querySelector('.form-check-input');
const buttonDeleteCompleted = document.querySelector('#button-delete-completed');
const todoConteinerTabs = document.querySelectorAll('.tab');
const conteinerTabs = document.querySelector('.todo-conteiner__tabs');
const containerPages = document.querySelector('.todo-conteiner__pagination');

let arrTodos = [];
let filterType = 'all';
let currentPage = 0;

//экранирование текста
const screeningText = (text) => {
  return text.trim().replace(/</g, "&lt;");
}

//добавление todo
const addListElement = () => {
  if(screeningText(todoInput.value)) {
    const todo = {
      id: Date.now(),
      title: screeningText(todoInput.value),
      isChecked: false,
    }
    if(todoInput.value.length > 256) return alert('Max length 256');
    arrTodos.push(todo);
    filterType = 'all';
    todoInput.value = '';

    // const page = Math.ceil(getFilteredTasks().length / COUNT_TODO);

    // if(currentPage !== page-1) {
    //   // console.log(currentPage)
    //   // console.log(page-1)
    //   currentPage = page;
    // }

    todoRender();
  }
}

//добавление по кнопке ENTER
const onEnterAddTodo = (e) => {
  if(e.keyCode === KEY_ENTER) {
    addListElement();
  }
}

//удаление todo
const onDeleteListItem = (id) => {
  arrTodos = arrTodos.filter((todo) => todo.id !== id);
  todoRender();
}

//изменение состояния всех чекбоксов в зависимости от основного
const changeAllCheckbox = (e) => {
  arrTodos.forEach((todo) => todo.isChecked = e.target.checked);
  todoRender();
}

//изменение состояния чекбокса check all при условии, что все эл-ты true/false
function updateAllCheckbox() {
  checkboxAll.checked = arrTodos.length ? arrTodos.every((todo) => todo.isChecked) : false;
}

//изменение чекбокса для каждого todo
const changeItemCheckbox = (isChecked, id) => {
  arrTodos.forEach((todo) => todo.id === id ? todo.isChecked = isChecked : false);
  todoRender();
}

//обработчик кликов на todo
const onHandleClick = (e) => {
  const id = Number(e.target.parentElement.id);

  if(e.target.type === 'submit') {
    onDeleteListItem(id);
  }

  if(e.target.type === 'checkbox') {
    const isChecked = e.target.checked;
    changeItemCheckbox(isChecked, id);
  }

  if(e.target.id === 'todo-text' && e.detail === 2) {
    e.target.hidden = true;
    e.target.previousElementSibling.hidden = false;
    e.target.previousElementSibling.focus()
  }
}

//редактирование текста в todo по кнопке
const changeTodoItem = (e) => {
  if(e.keyCode === KEY_ENTER) {
    saveChangeTodoItem(e);
  }

  if(e.keyCode === KEY_ESC) {
    todoRender();
  }
}

//редактирование текста в todo через blur()
const blurForInput = (e) => {
  if(e.target.type === 'text' && e.sourceCapabilities) {
    saveChangeTodoItem(e);
  }
} 

//сохранение изменений todo
const saveChangeTodoItem = (e) => {
  const id = Number(e.target.parentElement.id);
  if(e.target.value === '') {
    todoRender();
    return
  }
  arrTodos.forEach((todo) => todo.id === id ? todo.title = screeningText(e.target.value) : false);
  todoRender();
}

//удаление всех отмеченных todo по кнопке delete completed
const deleteCompletedTasks = () => {
  arrTodos = arrTodos.filter((todo) => !todo.isChecked);
  todoRender();
}

//редактирование 
const editCounterTextInTab = () => {
  const countAll = arrTodos.length; 
  const countActive = (arrTodos.filter((todo) => !todo.isChecked)).length;
  const countComplited = countAll - countActive;

  todoConteinerTabs[0].innerText = `All (${countAll})`;
  todoConteinerTabs[1].innerText = `Active (${countActive})`;
  todoConteinerTabs[2].innerText = `Complited (${countComplited})`;
}

const getFilteredTasks = () => {
  switch(filterType) {
  case 'active':
    return arrTodos.filter((todo) => !todo.isChecked);
  case 'complited':
    return arrTodos.filter((todo) => todo.isChecked);
  default:
    return arrTodos;
  }
}

// const switchPagination = () => {
//   if(getFilteredTasks().length > 5) {
//     currentPage = Math.ceil(getFilteredTasks().length / COUNT_TODO);
//     return currentPage
//   }
// }

const editFilterTasks = (e) => {
  filterType = e.target.id;
  currentPage = 0;
  todoRender();
}

const editStyleActivTab = () => {
  todoConteinerTabs.forEach((tab) => {
    tab.classList.remove('active');
    tab.id === filterType ? tab.classList.add('active') : false;
  });
}

const pagination = () => {
  const countTab = Math.ceil(getFilteredTasks().length / COUNT_TODO);
  const start = currentPage * COUNT_TODO;
  const end = start + COUNT_TODO;

  renderButtonPagination(countTab);
  return getFilteredTasks().slice(start, end);
}

const renderButtonPagination = (countTab) => {
  let containerPagination = '';

  for(let i = 0; i < countTab; i++) {
    containerPagination += `
    <button 
      class="btn btn-secondary btn-add page ${i === currentPage ? 'active' : ''}" 
      id=${i}
    >
    ${i + 1}
    </button>`;
  }

  containerPages.innerHTML = containerPagination;
}

const getPaginationButton = (e) => {
  currentPage = Number(e.target.id);
  pagination();
  todoRender();
}

const todoRender = () => {
  let container = '';
  const filteredTasksAndPaginations = pagination();

  if(filteredTasksAndPaginations.length !== 0) {
    filteredTasksAndPaginations.forEach((todo) => {
      container += `
            <li class="todo-container__list__item" id="${todo.id}">
                <input 
                    class="form-check-input check-item"
                    type="checkbox"
                    ${ todo.isChecked ? 'checked' : ''}
                >
                <input
                  class="form-control"
                  type="text" id="input-edit" 
                  hidden
                  value="${todo.title}"
                >
                <p id="todo-text">${todo.title}</p>
                <button 
                    type="submit"
                    class="btn btn-secondary todo-container__list__item__button"
                >
                    X
                </button>
            </li>
            `;
    })

    containerList.innerHTML = container;
  } else {
    containerList.innerHTML = '';
    containerList.innerHTML += `
    <div class="todo-container__list">
        <div class="todo-conteiner__empty-block">
            <p>No todos :c</p>
        </div>
    </div>
    `
  }

  editCounterTextInTab();
  editStyleActivTab();
  updateAllCheckbox();
}

elementListButton.addEventListener('click', addListElement);
todoInput.addEventListener('keydown', onEnterAddTodo);
containerList.addEventListener('keydown', changeTodoItem);
containerList.addEventListener('blur', blurForInput, true);
containerList.addEventListener('click', onHandleClick);
checkboxAll.addEventListener('click', changeAllCheckbox);
buttonDeleteCompleted.addEventListener('click', deleteCompletedTasks);
conteinerTabs.addEventListener('click', getFilteredTasks);
conteinerTabs.addEventListener('click', editFilterTasks);
containerPages.addEventListener('click', getPaginationButton);
