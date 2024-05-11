const express = require('express') // library for server-side development
const morgan = require("morgan") // https://github.com/expressjs/morgan see "examples" section

const cors = require('cors')  // cross-origin resource sharing; needed, since the backend is served at 3001 while frontend is served at 5173

const app = express()
const logger = morgan(":method :url :status :res[content-length] - :response-time ms") // https://github.com/expressjs/morgan see "examples" section. "tiny" logs only a "tiny" amount of stuff, "combined" logs a lot more! c:
const logger_for_POST = morgan(":post_body", {skip: function (req, res) { return req.method !== "POST" }}) // https://github.com/expressjs/morgan see "examples" section. "tiny" logs only a "tiny" amount of stuff, "combined" logs a lot more! This "skip" is now skipping this logger in case the method is NOT "POST", so only POST will use this logger.
morgan.token('post_body', () => "") // empty default; the actual body content from POST is only filled in POST

app.use(express.static('dist')) // so that static files can be served from the backend. "whenever Express gets an HTTP GET request it will first check if the dist directory contains a file corresponding to the request's address. If a correct file is found, Express will return it."
app.use(express.json())       // THIS IS NEEDED FOR POSTs!!!
app.use(logger)               // https://github.com/expressjs/morgan see "examples" section

app.use(logger_for_POST)      // https://github.com/expressjs/morgan see "examples" section

// (1) dotenv before Person! dotenv is eeded for accessing environment variables! 
require('dotenv').config() // "It's important that dotenv gets imported before the [person in the case of this app c:] note model is imported. This ensures that the environment variables from the .env file are available globally before the code from the other modules is imported." https://fullstackopen.com/en/part3/saving_data_to_mongo_db#fetching-objects-from-the-database
// (2) Person AFTER dotenv!
const Person = require('./models/person') // using the Person model (MongoDB) that was created in ./models/person. Since above dotenv is already taken into use, this should work too.

app.use(cors())               // note the () at the end... sigh

let persons = []              // one could initialize this with some default content, but it will be overwritten from mongodb anyways
let number_of_persons

app.get('/', (request, response) => {
  response.send(`
  <h1>Hello! Welcome to the persons API!</h1>
  <p>to get info, please go to
    <a href="/api/info">info</a>
  </p>
  <p>to see all the persons, please go to 
    <a href="/api/persons">persons</a>
  </p>`)
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
  .then(persons => { // find ALL persons
    number_of_persons = persons.length
    response.json(persons)
  })
  .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => { // DO NOT FORGET NEXT as the 3rd parameter if you're using an error handler! c:
  Person.findById(request.params.id)
  .then(person => {
    console.log({person})
    if(person) { // if person is not null, undefined, "", false, or something else
      response.json(person)
    } else {
      response.status(404).end() // end doesn't send any actual data: "Since no data is attached to the response, we use the status method for setting the status and the end method for responding to the request without sending any data."
    }
  })
  .catch(error => next(error))
}) 

app.get('/api/info', (request, response) => {
  Person.find({}).then(persons => { // you have to put ALL of this inside this .then block, otherwise it wouldn't update the number_of_persons on time before rendering the number on screen -> it would say "undefined" number of persons c:
    number_of_persons = persons.length
    const palaute = `
    Phonebook has info for ${number_of_persons} persons.
    <ul>
    <li>for the home page with search, please click
      <a href="/">home</a>
    </li>
    <li>to view the api side of all persons in the phonebook, please go to 
      <a href="/api/persons">persons</a>
    </li>
    </ul>
    ` // problem at the moment is that it only updates AFTER you've visited the main page which loads all the persons
    const date = new Date()
    response.send(palaute + "<br/>" + date)})
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error)) // this forwards the merror to the error handling middleware below (which ALWAYS has to be last)
})

app.post('/api/persons/', (request, response, next) => { // NB! app.use(express.json()) IS NEEDED FOR POSTs!!! This is written on top c:
  const body = request.body
  

  if(body.name === undefined) {
    return response.status(400).json({
      error:"name missing! Please provide both a name AND a number!"
    })
  }

  if (body.number === undefined) {
    return response.status(400).json({
      error:"number missing! Please provide both a name AND a number!"
    })
  }

  let names
  Person.find({})
  .then(persons => { // find ALL persons
    names = persons.map(person => person.name)
  if (names.includes(body.name)) {
    return response.status(400).json({
      error:"name already exists in the phonebook! Try adding another name c:"
    })
  }

  const person = new Person({ // mongoose (person.js) will check if name and number are valid (ok length etc.)
    name: body.name,
    number: body.number
  })
  
  morgan.token('post_body', () => JSON.stringify(body)) // for morgan console print to see in console the content of this POST

  person.save().then(savedContact => { // mongoDB
    response.json(savedContact)
  }).catch(error => next(error))
  })
})

app.put('/api/persons/:id', (request, response, next) => { // remember: the actual window.confirm comes from the FRONTend, not from here c:
  const { name, number } = request.body
  const body = request.body

  Person.findByIdAndUpdate(request.params.id, {name, number}, { new: true, runValidators: true, context: 'query'}) // for mongoose validation!
    .then(updatedContact => {
      response.json(updatedContact)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => { // THIS IS LAST, BECAUSE THIS WILL ONLY BE EXECUTED IF NONE OF THE PATHS ABOVE HAVE BEEN EXECUTED! c:
  response.status(404).send({ error: 'unknown endpoint; please check the address! See [home]/api/info for info' })
}
app.use(unknownEndpoint) //   first definition above, THEN use c:

const errorHandler = (error, request, response, next) => { // CHECKED. Or dragon?
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'the id you were looking for could not be found. Maybe a 🐉 has taken your id??' })
  } else if (error.name === 'ValidationError') {    // mongoose validation error (too short, or content missing!) -> this handles it c:
    return response.status(400).json({ error: error.message })  
  }
  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this! (https://fullstackopen.com/en/part3/saving_data_to_mongo_db#error-handling)
app.use(errorHandler)

const PORT = process.env.PORT  // needed by both fly.io AND Render, no matter which one you use.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})