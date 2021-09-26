// ============== 3.19 - 3.21 PHONEBOOK WITH MONGODB ======================= //

require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const Person = require('./models/person');
app.use(express.json());
app.use(express.static('build'));
morgan.token('body', (request, response) => {
  return JSON.stringify(request.body);
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(cors());

app.get("/api/persons", (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  });
});

app.get("/info", (request, response) => {
  const date = new Date();
  const total = persons.length;
  return response.send(
    `
    <p>Phonebook has info for ${total} people</p>
    <p>${date}</p>
    `
  );
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id).then(person =>
    response.json(person))
    .catch(error => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  if (!(body.name && body.number)) {
    return response.status(400).json({
      error: 'Name or number is missing'
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number
  });
  person.save().then(savedPerson => {
    response.json(savedPerson);
  })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = {
    number: body.number
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name == 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name == 'ValidationError') {
    return response.status(400).send({ error: 'Duplicated entry' });
  }
};
app.use(errorHandler);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});