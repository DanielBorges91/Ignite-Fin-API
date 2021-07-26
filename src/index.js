const express = require('express');
const { v4: uuidV4, } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

app.post("/account", (request, response) => {
  const { name, cpf } = request.body;

  const userAlreadyExists = customers.some((user) => user.cpf === cpf);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exist." });
  }

  user = {
    uuid: uuidV4(),
    name,
    cpf,
    statement: [],
  }

  customers.push(user);

  return response.status(201).send();
})

app.listen(3333,
  console.log("🚀 Server started on port 3333!")
)