const express = require('express');
const path = require('path');
const Joi = require('joi');

const app = express();
const PORT = 3000;

// Налаштування Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Обробка JSON та статичних файлів
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Схема перевірки завдання за допомогою Joi
const taskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    'string.base': 'Назва завдання повинна бути рядком.',
    'string.empty': 'Назва завдання є обов’язковою.',
    'string.min': 'Назва завдання повинна містити мінімум 3 символи.',
    'string.max': 'Назва завдання не повинна перевищувати 100 символів.',
    'any.required': 'Поле title є обов’язковим.'
  })
});

// Схема перевірки ID
const idSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

// Імітація бази даних
let tasks = [
  { id: 1, title: 'Вивчити Express.js', completed: false },
  { id: 2, title: 'Ознайомитися з Pug', completed: true },
  { id: 3, title: 'Створити To-Do List', completed: false }
];

let nextId = 4;

// GET — отримання всіх завдань
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// POST — створення нового завдання з валідацією Joi
app.post('/api/tasks', (req, res) => {
  const { error, value } = taskSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const newTask = {
    id: nextId++,
    title: value.title,
    completed: false
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    message: 'Завдання успішно створено!',
    task: newTask
  });
});

// PUT — зміна статусу завдання
app.put('/api/tasks/:id', (req, res) => {
  const { error, value } = idSchema.validate(req.params);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Некоректний ID завдання.'
    });
  }

  const task = tasks.find(task => task.id === value.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Завдання не знайдено.'
    });
  }

  task.completed = !task.completed;

  res.status(200).json({
    success: true,
    message: 'Статус завдання успішно оновлено!',
    task
  });
});

// DELETE — видалення завдання
app.delete('/api/tasks/:id', (req, res) => {
  const { error, value } = idSchema.validate(req.params);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Некоректний ID завдання.'
    });
  }

  const taskIndex = tasks.findIndex(task => task.id === value.id);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Завдання не знайдено.'
    });
  }

  tasks.splice(taskIndex, 1);

  res.status(200).json({
    success: true,
    message: 'Завдання успішно видалено!'
  });
});

// GET — відображення сторінки зі списком завдань
app.get('/tasks', (req, res) => {
  res.render('tasks', { tasks });
});

// Головна — редирект
app.get('/', (req, res) => {
  res.redirect('/tasks');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Tasks page: http://localhost:${PORT}/tasks`);
});
