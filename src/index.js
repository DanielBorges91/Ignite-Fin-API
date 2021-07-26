const express = require('express');
const { v4: uuidV4, } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

function verifyExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found" });
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

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

app.get("/statement", verifyExistsAccountCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer.statement);
})

app.post("/deposit", verifyExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation);

  return response.status(201).send();
})

app.post("/withdraw", verifyExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: "Insufficient funds!" });
  }

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "debit",
  }

  customer.statement.push(statementOperation);

  return response.status(201).send();
})

app.get("/statement/date", verifyExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  )

  return response.json(statement);
})

app.put("/account", verifyExistsAccountCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
})

app.listen(3333,
  console.log("🚀 Server started on port 3333!")
)