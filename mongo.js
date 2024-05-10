const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)

} else if (process.argv.length === 3) {
    const password = process.argv[2]
    const url =
    `mongodb+srv://anttonkasslin:${password}@cluster0.k9nljxh.mongodb.net/PhonebookApp?retryWrites=true&w=majority` // this will rename it succesfully as "noteApp". The above won't. This is directly from the course material c:

    mongoose.set('strictQuery',false)
    mongoose.connect(url)

    const personSchema = new mongoose.Schema({
        name: String,
        number: String
    })

    const Person = mongoose.model('Person', personSchema)
    
    console.log("phonebook:")
    Person.find({}).then(result => {
        result.forEach(person => {
        console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })

} else if (process.argv.length === 5) { // if 5 arguments, pray that they are in the correct order and form, and save the person to mongodb
    const password = process.argv[2]
    const inputName = process.argv[3]
    const inputNumber = process.argv[4]
    const url =
    `mongodb+srv://anttonkasslin:${password}@cluster0.k9nljxh.mongodb.net/PhonebookApp?retryWrites=true&w=majority` // this will rename it succesfully as "noteApp". The above won't. This is directly from the course material c:
    mongoose.set('strictQuery',false)

    mongoose.set('strictQuery',false)
    mongoose.connect(url)

    const personSchema = new mongoose.Schema({
        name: String,
        number: String
    })

    const Person = mongoose.model('Person', personSchema)

    const person = new Person({
        name: inputName,
        number: inputNumber
    })
    
    person.save().then(result => {
        console.log(`added ${inputName} number ${inputNumber} to phonebook`)
        mongoose.connection.close()
    })

} else {
    console.log(`Wrong number of arguments provided to mongo.js. Usage of mongo.js is as follows: type either
    (a) 'node mongo.js your_password new_name_to_add new_number_to_add', OR 
    (b) 'node mongo.js your_password'`)
    process.exit(1)
}