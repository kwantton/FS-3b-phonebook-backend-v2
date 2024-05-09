const express = require('express')
const app = express()
app.use(express.json())       // THIS IS NEEDED FOR POSTs!!!

const morgan = require("morgan") // https://github.com/expressjs/morgan see "examples" section
const logger = morgan(":method :url :status :res[content-length] - :response-time ms") // https://github.com/expressjs/morgan see "examples" section. "tiny" logs only a "tiny" amount of stuff, "combined" logs a lot more! c:
app.use(logger)               // https://github.com/expressjs/morgan see "examples" section

const logger_for_POST = morgan(":post_body", {skip: function (req, res) { return req.method !== "POST" }}) // https://github.com/expressjs/morgan see "examples" section. "tiny" logs only a "tiny" amount of stuff, "combined" logs a lot more! This "skip" is now skipping this logger in case the method is NOT "POST", so only POST will use this logger.
morgan.token('post_body', () => "") // empty default; the actual body content from POST is only filled in POST
app.use(logger_for_POST)      // https://github.com/expressjs/morgan see "examples" section

const cors = require('cors')  // cross-origin resource sharing; needed, since the backend is served at 3001 while frontend is served at 5173
app.use(cors())               // note the () at the end... sigh

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
  response.send(`<h1>Hello! Welcome to the persons API!</h1>
  <p>to get info, please go to
  <a href="/api/info">info</a>
  </p>
  <p>to see all the persons, please go to 
  <a href="/api/persons">persons</a>
  </p>`)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/info', (request, response) => {
  let number_of_persons = persons.length
  const palaute = `Phonebook has info for ${number_of_persons} persons`
  const date = new Date()
  response.send(palaute + "<br/>" + date)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  console.log(id)
  const person = persons.find(person => {
    console.log({person}, "typeof(person.id):", typeof(person.id))
    return Number(person.id) === id // json everything is string -> you need a Number(person.id) to be able to accurately compare
  })
  console.log({person})

  if(person) {
    response.json(person)
  } else {
    response.status(404).end() // end doesn't send any actual data: "Since no data is attached to the response, we use the status method for setting the status and the end method for responding to the request without sending any data."
  }
}) 

app.delete('/api/persons/:id', (request,response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id) // note that persons is the object here; it has Numbers, and id was converted to a number -> comparison is ok

  response.status(204).end() // "response.end() method expects a string or a buffer to send as the response body." Also, // end doesn't send any actual data: "Since no data is attached to the response, we use the status method for setting the status and the end method for responding to the request without sending any data." 204 = "no content"
})

const generateId = () => { // this is not anything smart! In reality, AT LEAST look up the largest id in the current persons, and increment by one. And that NEITHER is ok IRL, but this is what the task is so far! c:
  const random_id = Math.floor(10 + Math.random() * 990)
  console.log("GENERATED RANDOM ID FOR THE PERSON, ID:", random_id)
  return random_id
}

app.post('/api/persons/', (request, response) => { // NB! app.use(express.json()) IS NEEDED FOR POSTs!!! This is written on top c:
  const body = request.body

  if(!body.name) {
    return response.status(404).json({
      error:"name missing! Please provide both a name AND a number!"
    })
  }

  if (!body.number) {
    return response.status(404).json({
      error:"number missing! Please provide both a name AND a number!"
    })
  }

  const names = persons.map(person => person.name)
  if (names.includes(body.name)) {
    return response.status(400).json({
      error:"name already exists in the phonebook! Try adding another name c:"
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(), // returns a random between 10 and 1000
  }
  morgan.token('post_body', () => JSON.stringify(body))
  persons = persons.concat(person)
  response.json(person)
})

const PORT = process.env.PORT || 3001  // needed by both fly.io AND Render, no matter which one you use.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})