const todoInput = document.querySelector('.form-control');
const elementListButton = document.querySelector('.btn-add');
const containerList = document.querySelector('.todo-container__list');
const checkboxAll = document.querySelector('.form-check-input');
const buttonDeleteCompleted = document.querySelector('#button-delete-completed');

let arrTodos = [];
const KEY_ENTER = 13;
const KEY_ESC = 27;

const addListElement = () => {
  if(todoInput.value) {
    const todo = {
      id: Date.now(),
      title: todoInput.value,
      isChecked: false,
    }

    arrTodos.push(todo);
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

const changeAllCheckbox = (e) => {
  arrTodos.forEach((todo) => todo.isChecked = e.target.checked);
  todoRender();
}

const updateAllCheckbox = () => {
  checkboxAll.checked = arrTodos.length ? arrTodos.every((todo) => todo.isChecked) : false;
}

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
  }
}

const moveTodoItem = (e) => {
  const id = Number(e.target.parentElement.id);
  if(e.keyCode === KEY_ENTER) {
    arrTodos.forEach((todo) => todo.id === id ? todo.title = e.target.value : false);
    todoRender();
  }

  if(e.keyCode === KEY_ESC) {
    todoRender();
  }
}

const blurForInput = (e) => {
  const id = Number(e.target.parentElement.id);
  arrTodos.forEach((todo) => todo.id === id ? todo.title = e.target.value : false);
  todoRender();
} 

const deleteCompletedTasks = () => {
  arrTodos = arrTodos.filter((todo) => !todo.isChecked);
  todoRender();
}

const todoRender = () => {
  let container = '';

  if(arrTodos.length !== 0) {
    arrTodos.forEach((todo) => {
      container += `
            <li class="todo-container__list__item" id="${todo.id}">
                <input 
                    class="form-check-input check-item"
                    type="checkbox"
                    ${ todo.isChecked ? 'checked' : ''}
                >
                <input
                  class="form-control" type="text" id="input-edit" 
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
  updateAllCheckbox();
}

elementListButton.addEventListener('click', addListElement);
todoInput.addEventListener('keydown', onEnterAddTodo);
containerList.addEventListener('keydown', moveTodoItem);
document.addEventListener('blur', blurForInput, true);
containerList.addEventListener('click', onHandleClick);
checkboxAll.addEventListener('click', changeAllCheckbox);
buttonDeleteCompleted.addEventListener('click', deleteCompletedTasks);

