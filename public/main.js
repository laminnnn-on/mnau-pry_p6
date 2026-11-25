// Створення об'єкта Notyf для відображення повідомлень
const notyf = new Notyf({
  duration: 3000,
  position: {
    x: 'right',
    y: 'top'
  }
});

// Отримання елементів сторінки
const taskForm = document.querySelector('#task-form');
const taskTitle = document.querySelector('#task-title');
const taskList = document.querySelector('#task-list');

// Обробка додавання нового завдання
taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = taskTitle.value;

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    });

    const data = await response.json();

    if (response.status === 201) {
      notyf.success(data.message);
      addTaskToPage(data.task);
      taskForm.reset();
    } else if (response.status === 400) {
      notyf.error(data.message);
    }
  } catch (error) {
    notyf.error('Не вдалося зв’язатися із сервером.');
    console.error(error);
  }
});

// Додавання завдання до списку на сторінці
function addTaskToPage(task) {
  const li = document.createElement('li');
  li.dataset.id = task.id;

  const title = document.createElement('span');
  title.className = 'task-title';
  title.textContent = task.title;

  const status = document.createElement('strong');
  status.className = 'task-status';
  status.textContent = ' — Не виконано';

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'toggle-task';
  toggleButton.textContent = 'Змінити статус';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-task';
  deleteButton.textContent = 'Видалити';

  li.append(title, status, toggleButton, deleteButton);
  taskList.appendChild(li);
}

// Обробка натискання кнопок зміни статусу та видалення
taskList.addEventListener('click', async (event) => {
  const li = event.target.closest('li[data-id]');
  if (!li) {
    return;
  }

  const id = li.dataset.id;

  // Зміна статусу завдання
  if (event.target.classList.contains('toggle-task')) {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT'
      });

      const data = await response.json();

      if (response.status === 200) {
        notyf.success(data.message);

        const title = li.querySelector('.task-title');
        const status = li.querySelector('.task-status');

        title.classList.toggle('completed', data.task.completed);
        status.textContent = data.task.completed
          ? ' — Виконано'
          : ' — Не виконано';
      } else if (response.status === 400 || response.status === 404) {
        notyf.error(data.message);
      }
    } catch (error) {
      notyf.error('Не вдалося зв’язатися із сервером.');
      console.error(error);
    }
  }

  // Видалення завдання
  if (event.target.classList.contains('delete-task')) {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.status === 200) {
        notyf.success(data.message);
        li.remove();
      } else if (response.status === 400 || response.status === 404) {
        notyf.error(data.message);
      }
    } catch (error) {
      notyf.error('Не вдалося зв’язатися із сервером.');
      console.error(error);
    }
  }
});
