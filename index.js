(() => {
  const KEY_ENTER = 13;
  const KEY_ESC = 27;
  const COUNT_TODO = 5;
  const DBL_CLICK = 2;
  const URL = 'http://localhost:5000/tasks';

  const todoInput = document.querySelector('.form-control');
  const elementListButton = document.querySelector('.btn-add');
  const containerList = document.querySelector('.todo-container__list');
  const checkboxAll = document.querySelector('.form-check-input');
  const buttonDeleteCompleted = document.querySelector('#button-delete-completed');
  const todoContainerTabs = document.querySelectorAll('.tab');
  const containerTabs = document.querySelector('.todo-conteiner__tabs');
  const containerPages = document.querySelector('.todo-conteiner__pagination');
  const modalWindowStatus = document.querySelector('.todo-container__modal');

  const filterTypes = {
    all: 'all',
    active: 'active',
    completed: 'completed',
  }

  let arrTodos = [];
  let messages = [];
  let filterType = filterTypes.all;
  let currentPage = 0;

  const fetchAllTodos = () => {
    fetch(`${URL}`)
      .then(res => res.json())
      .then(res => {
        if (res.statusCode >= 400) {
          throw new Error(res.message);
        }
        arrTodos = res;
        checkboxAll.checked = arrTodos.every((todo) => todo.isChecked);
      })
      .then(_ => todoRender())
      .catch(error => {
        error.message
          .split(',')
          .forEach(message => modalRender(message));
      })
  }

  const fetchCreateTodos = (todo) => {
    fetch(`${URL}`, {
      headers: {
        "Content-type": "application/json"
      },
      method: 'POST',
      body: JSON.stringify(todo),
    })
      .then(res => res.json())
      .then(res => {
        if (res.statusCode >= 400) {
          throw new Error(res.message);
        }

        arrTodos.push(res);
        filterType = filterTypes.all;
        todoInput.value = '';

        const filteredTasks = getFilteredTasks();
        const page = Math.ceil(filteredTasks.length / COUNT_TODO);

        if (currentPage !== page - 1) currentPage = page - 1;
        todoRender();
      })
      .catch(error => {
        error.message
          .split(',')
          .forEach(message => modalRender(message));
      })
  }

  const fetchUpdateTodo = (id, data) => {
    fetch(`${URL}/${id}`, {
      headers: {
        "Content-type": "application/json"
      },
      method: 'PATCH',
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(res => {
        if (res.statusCode >= 400) {
          throw new Error(res.message)
        }
        
        arrTodos = arrTodos.map(todo => todo.id === res.id ? { ...res } : todo)
        todoRender();
      })
      .catch(error => {
        error.message
          .split(',')
          .forEach(message => modalRender(message));
          fetchAllTodos();
      })
  }

  const fetchUpdateAllTodos = (data) => {
    fetch(`${URL}`, {
      headers: {
        "Content-type": "application/json"
      },
      method: 'PATCH',
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(res => {
        if (res.statusCode >= 400) {
          throw new Error(res.message)
        }

        arrTodos = arrTodos.map(todo => ({ ...todo, ...data }));
        todoRender();
      })
      .catch(error => {
        error.message
          .split(',')
          .forEach(message => modalRender(message));
          fetchAllTodos();
      })
  }

  const fetchDeleteTodo = (id) => {
    fetch(`${URL}/${id}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(res => {
        if (res.statusCode >= 400) {
          throw new Error(res.message)
        }

        arrTodos = arrTodos.filter((todo) => todo.id !== id);
        todoRender();
      })
      .catch(error => {
        error.message
          .split(',')
          .forEach(message => modalRender(message));
          fetchAllTodos();
      })
  }

  const fetchDeleteAllCompleted = () => {
    fetch(`${URL}/delete`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(res => {
        if (res.statusCode >= 400) {
          throw new Error(res.message);
        }

        arrTodos = arrTodos.filter(todo => !todo.isChecked);
        todoRender();
      })
      .catch(error => {
        error.message
          .split(',')
          .forEach(message => modalRender(message));
          fetchAllTodos();
      })
  }

  const firstRenderPage = () => {
    fetchAllTodos();
  }

  const screeningText = (text) => {
    return text.trim()
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/\s+/g, " ");
  }

  const addListElement = () => {
    const text = screeningText(todoInput.value);
    todoInput.value = '';
    todoInput.focus();

    if (text) {
      const todo = { text };

      if (todoInput.value.length > 256) throw new Error(modalRender('Max length 256'));

      fetchCreateTodos(todo);
    }
  }

  const onEnterAddTodo = (e) => {
    if (e.keyCode === KEY_ENTER) addListElement();
  }

  const onDeleteTodo = (id) => {
    fetchDeleteTodo(id);
  }

  const checkAll = (e) => {
    e.preventDefault();
    const isChecked = e.target.checked;
    if (!arrTodos.length) return;
    if (arrTodos.length) fetchUpdateAllTodos({ isChecked });
  }

  const updateAllCheckbox = () => {
    checkboxAll.checked = arrTodos.length
      ? arrTodos.every(todo => todo.isChecked)
      : false;
  }

  const changeItemCheckbox = (isChecked, id) => {
    fetchUpdateTodo(id, { isChecked });
  }

  const onHandleClick = (e) => {
    e.preventDefault();
    const id = Number(e.target.parentElement.id);

    if (e.target.type === 'submit') {
      onDeleteTodo(id);
    }

    if (e.target.type === 'checkbox') {
      const isChecked = e.target.checked;
      changeItemCheckbox(isChecked, id);
    }

    if (e.target.id === 'todo-text' && e.detail === DBL_CLICK) {
      e.target.hidden = true;
      e.target.previousElementSibling.hidden = false;
      e.target.previousElementSibling.focus();
    }
  }

  const changeTodoItem = (e) => {
    if (e.keyCode === KEY_ENTER && e.target.type === 'text') {
      saveChangeTodoItem(e);
    }

    if (e.keyCode === KEY_ESC) todoRender();
  }

  const editByBlur = (e) => {
    if (e.target.type === 'text' && e.sourceCapabilities) {
      saveChangeTodoItem(e);
    }
  }

  const saveChangeTodoItem = (e) => {
    const id = Number(e.target.parentElement.id);
    const text = screeningText(e.target.value);

    const filter = arrTodos.find((todo) => todo.text !== text);

    if (text && filter) {
      if (text.length > 256) throw new Error(modalRender('Max length 256'));
      fetchUpdateTodo(id, { text });
    } else {
      todoRender();
    }
  }

  const deleteCompletedTasks = () => {
    if (arrTodos.length) {
      fetchDeleteAllCompleted();
    }
  }

  const editCounterTextInTab = () => {
    const countAll = arrTodos.length;
    const countActive = (arrTodos.filter(todo => !todo.isChecked)).length;
    const countComplited = countAll - countActive;

    todoContainerTabs[0].innerText = `All (${countAll})`;
    todoContainerTabs[1].innerText = `Active (${countActive})`;
    todoContainerTabs[2].innerText = `Complited (${countComplited})`;
  }

  const getFilteredTasks = () => {
    switch (filterType) {
      case filterTypes.active:
        return arrTodos.filter((todo) => !todo.isChecked);
      case filterTypes.completed:
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
      if (tab.id === filterType) tab.classList.add('active');
    });
  }

  const pagination = () => {
    const filteredTasks = getFilteredTasks();
    const countTab = Math.ceil(filteredTasks.length / COUNT_TODO);

    if (countTab === currentPage) currentPage = countTab - 1;

    const start = currentPage * COUNT_TODO;
    const end = start + COUNT_TODO;
    renderButtonPagination(countTab);
    return filteredTasks.slice(start, end);
  }

  const renderButtonPagination = (countTab) => {
    let containerPagination = '';

    for (let i = 0; i < countTab; i++) {
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

  const modalRender = (error) => {
    if (error) {
      messages.push(error);
      renderMessagesModal();

      setTimeout(() => {
        messages.shift();
        renderMessagesModal();
      }, 10000);
    }
  }

  const renderMessagesModal = () => {
    let modal = '';
    messages.forEach(message => {
      modal += `
        <div class="alert alert-danger d-flex align-items-center" role="alert">
          <img src="./icons/danger.svg">
          <div>
            ${message ? message : ''}
          </div>
        </div>
      `
    });

    modalWindowStatus.innerHTML = modal;
  }

  const todoRender = () => {
    let container = '';
    const filteredTasksAndPaginations = pagination();

    if (filteredTasksAndPaginations.length) {
      filteredTasksAndPaginations.forEach(todo => {
        container += `
              <li class="todo-container__list__item" id="${todo.id}">
                <input 
                  class="form-check-input check-item"
                  type="checkbox"
                  maxlength="256"
                  ${todo.isChecked ? 'checked' : ''}
                >
                <input
                  class="form-control"
                  id="input-edit" 
                  hidden
                  maxlength="256"
                  value="${todo.text}"
                >
                <p id="todo-text">${todo.text}</p>
                  <button type="submit" class="btn btn-secondary todo-container__list__item__button">X</button>
              </li>
        `;
      });
    } else {
      container += `
      <div class="todo-container__list">
        <div class="todo-conteiner__empty-block">
          <p>No todos :c</p>
        </div>
      </div>
      `
    }
    containerList.innerHTML = container;

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
  window.addEventListener('load', firstRenderPage, { once: true });
})();
