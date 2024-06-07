(() => {
  const KEY_ENTER = 13;
  const KEY_ESC = 27;
  const COUNT_TODO = 5;

  const todoInput = document.querySelector('.form-control');
  const elementListButton = document.querySelector('.btn-add');
  const containerList = document.querySelector('.todo-container__list');
  const checkboxAll = document.querySelector('.form-check-input');
  const buttonDeleteCompleted = document.querySelector('#button-delete-completed');
  const todoContainerTabs = document.querySelectorAll('.tab');
  const containerTabs = document.querySelector('.todo-conteiner__tabs');
  const containerPages = document.querySelector('.todo-conteiner__pagination');

  let arrTodos = [];
  let filterType = 'all';
  let currentPage = 0;

  const screeningText = (text) => {
    return text.trim().replace(/</g, "&lt;").replace(/\s+/g, " ");
  }

  const addListElement = () => {
    const title = screeningText(todoInput.value);

    if(title) {
      const todo = {
        id: Date.now(),
        title: title,
        isChecked: false,
      }

      if(todoInput.value.length > 256) return alert('Max length 256');
      arrTodos.push(todo);
      filterType = 'all';
      todoInput.value = '';

      const page = Math.ceil(getFilteredTasks().length / COUNT_TODO);

      if(currentPage !== page - 1) currentPage = page - 1;

      todoRender();
    }
  }

  const onEnterAddTodo = (e) => {
    if(e.keyCode === KEY_ENTER) {
      addListElement();
    }
  }

  const onDeleteTodo = (id) => {
    arrTodos = arrTodos.filter((todo) => todo.id !== id);
    todoRender();
  }

  const checkAll = (e) => {
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
      onDeleteTodo(id);
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

  const changeTodoItem = (e) => {
    if(e.keyCode === KEY_ENTER && e.target.type === 'text') {
      saveChangeTodoItem(e);
    }

    if(e.keyCode === KEY_ESC) {
      todoRender();
    }
  }

  const editByBlur = (e) => {
    if(e.target.type === 'text' && e.sourceCapabilities) {
      saveChangeTodoItem(e);
    }
  } 

  const saveChangeTodoItem = (e) => {
    const id = Number(e.target.parentElement.id);
    const title = screeningText(e.target.value);

    if(title === '') {
      todoRender();
    } else {
      arrTodos.forEach((todo) => todo.id === id ? todo.title = title : false);
      todoRender();
    }
  }

  const deleteCompletedTasks = () => {
    arrTodos = arrTodos.filter((todo) => !todo.isChecked);
    todoRender();
  }

  const editCounterTextInTab = () => {
    const countAll = arrTodos.length; 
    const countActive = (arrTodos.filter((todo) => !todo.isChecked)).length;
    const countComplited = countAll - countActive;

    todoContainerTabs[0].innerText = `All (${countAll})`;
    todoContainerTabs[1].innerText = `Active (${countActive})`;
    todoContainerTabs[2].innerText = `Complited (${countComplited})`;
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
    filterType = e.target.id;
    currentPage = 0;
    todoRender();
  }

  const editStyleActivTab = () => {
    todoContainerTabs.forEach((tab) => {
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
                  id="input-edit" 
                  hidden
                  value="${todo.title}"
                >
                <p id="todo-text">${todo.title}</p>
                  <button type="submit" class="btn btn-secondary todo-container__list__item__button">X</button>
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
  containerList.addEventListener('blur', editByBlur, true);
  containerList.addEventListener('click', onHandleClick);
  checkboxAll.addEventListener('click', checkAll);
  buttonDeleteCompleted.addEventListener('click', deleteCompletedTasks);
  containerTabs.addEventListener('click', getFilteredTasks);
  containerTabs.addEventListener('click', editFilterTasks);
  containerPages.addEventListener('click', getPaginationButton);
})();
