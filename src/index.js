const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    request.username = username;
    return next();
  } else {
    response.status(400).json({ error: "User not found" });
  }
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists =
    users.findIndex((user) => user.username === username) !== -1;

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists." });
  }

  const user = { id: uuidv4(), name, username, todos: [] };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const user = users.find((user) => user.username === username);

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;

  const user = users.find((user) => user.username === username);

  const todo = {
    id: uuidv4(),
    title,
    deadline,
    done: false,
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const { title, deadline } = request.body;

  const { id } = request.params;

  const user = users.find((user) => user.username === username);

  const task = user.todos.find((todo) => todo.id === id);

  if (!task) {
    return response.status(404).json({ error: "Task not found" });
  }

  task.deadline = deadline;
  task.title = title;

  return response.status(200).json(task);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);

  const task = user.todos.find((todo) => todo.id === id);

  if (!task) {
    return response.status(404).json({ error: "Task not found" });
  }

  task.done = true;

  return response.status(200).json(task);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);

  const taskIndex = user.todos.findIndex((todo) => todo.id === id);

  if (taskIndex === -1) {
    return response.status(404).json({ error: "Task not found" });
  }

  user.todos.splice(taskIndex, 1);

  return response.sendStatus(204);
});

module.exports = app;
