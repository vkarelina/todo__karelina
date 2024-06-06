const KEY_ENTER = 13;
const KEY_ESC = 27;

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
const countTodo = 5;
let currentPage = 0;

const addListElement = () => {
  if(todoInput.value) {
    const todo = {
      id: Date.now(),
      title: todoInput.value,
      isChecked: false,
    }

    arrTodos.push(todo);
    console.log(arrTodos[0].title)
    filterType = 'all';
    todoRender();
    todoInput.value = '';
  }
}

//потом уберу
const onEnterAddTodo = (e) => {
  if(e.keyCode === KEY_ENTER) {
    addListElement();
  }
}

const onDeleteListItem = (id) => {
  arrTodos = arrTodos.filter((todo) => todo.id !== id);
  todoRender();
}

//изменение состояния всех чекбоксов в зависимости от основного
const changeAllCheckbox = (e) => {
  arrTodos.forEach((todo) => todo.isChecked = e.target.checked);
  todoRender();
}

//изменение состояния чекбокса check all todos при условии, что все эл-ты true/false
function updateAllCheckbox() {
  checkboxAll.checked = arrTodos.length ? arrTodos.every((todo) => todo.isChecked) : false;
}

//изменение чекбокса для каждого todo
const changeItemCheckbox = (isChecked, id) => {
  arrTodos.forEach((todo) => todo.id === id ? todo.isChecked = isChecked : false);
  todoRender();
}

const onHandleClick = (e) => {
  const id = Number(e.target.parentElement.id);

  if(e.target.type === 'submit') {
    onDeleteListItem(id);
  }

  if(e.target.type === 'checkbox') {
    const isChecked = e.target.checked;
    changeItemCheckbox(isChecked, id);
  }

  if(e.target.tagName === 'P' && e.detail === 2) {
    e.target.hidden = true;
    e.target.previousElementSibling.hidden = false;
    console.log(arrTodos[0])
  }
}

//редактирование текста в todo по кнопке
const changeTodoItem = (e) => {
  console.log(e);
  if(e.keyCode === KEY_ENTER) {
    saveChangeTodoItem(e);
  }

  if(e.keyCode === KEY_ESC) {
    todoRender();
  }
}

//редактирование текста в todo по кнопке
const blurForInput = (e) => {
  if(e.target.type === 'text' && e.sourceCapabilities) {
    saveChangeTodoItem(e);
  }
} 

//сохранение изменений
const saveChangeTodoItem = (e) => {
  const id = Number(e.target.parentElement.id);
  console.log(arrTodos[0].title)
  console.log(e.target.value)
  arrTodos.forEach((todo) => todo.id === id ? todo.title = e.target.value : false);
  console.log(arrTodos[0].title);
  todoRender();
}

//удаление всех отмеченных todo по кнопке delete completed
const deleteCompletedTasks = () => {
  arrTodos = arrTodos.filter((todo) => !todo.isChecked);
  todoRender();
}

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

const editFilterTasks = (e) => {
  console.log(e.target)
  filterType = e.target.id;
  todoRender();
}

const editStyleActivTab = () => {
  todoConteinerTabs.forEach((tab) => {
    tab.classList.remove('active');
    tab.id === filterType ? tab.classList.add('active') : false;
  });
}

const pagination = () => {
  const countTab = Math.ceil(getFilteredTasks().length / countTodo);
  const start = currentPage * countTodo;
  const end = start + countTodo;

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
  console.log('render')

  if(arrTodos.length !== 0) {
    filteredTasksAndPaginations.forEach((todo) => {
      container += `
            <li class="todo-container__list__item" id="${todo.id}">
                <input 
                    class="form-check-input check-item"
                    type="checkbox"
                    ${ todo.isChecked ? 'checked' : ''}
                >
                <input
                  class="form-control" id="input-edit" 
                  hidden
                  value=${todo.title}
                >
                <p>${todo.title}</p>
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
