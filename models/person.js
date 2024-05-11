// MongoDB model for a person

const mongoose = require("mongoose")
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI // npm install dotenv for this, for accessing environment variables from .env

console.log('connecting to', url)
mongoose.connect(url)

  .then(result => {
    console.log('successfully connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({ // mongoose validation: make sure the name and number both are long enough
    name:{
        type: String,
        minLength:3,        // built-in validator
        required: true      // built-in validator
    },

    number:{
        type:String,
        minLength:8,
        required: true,
        validate: {         // custom validator: (https://mongoosejs.com/docs/validation.html#custom-validators)
            validator: function(validatee) {
                const regex = /^[0-9]{2,3}-[0-9]{1,}$/ // Starts with 2-3 numbers, then hyphen, then 1 or more number. Could replace [0-9] with \d but that's for wussies. The second part is arbitrary, might not represent real life c:
                return regex.test(validatee) // remember the JavaScript course; this was covered there c: 
                return true // old example, works: always passes the test -> doesn't affect anything. Just for initial testing.
            },  message: props => `${props.value} is not a valid phone number!` // directly from (https://mongoosejs.com/docs/validation.html#custom-validators)
        }
    }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id // "Even though the _id property of Mongoose objects looks like a string, it is in fact an object. The toJSON method we defined transforms it into a string just to be safe. If we didn't make this change, it would cause more harm to us in the future once we start writing tests." https://fullstackopen.com/en/part3/saving_data_to_mongo_db#fetching-objects-from-the-database 
    delete returnedObject.__v // "The versionKey is a property set on each document when first created by Mongoose. This keys value contains the internal revision of the document. The name of this document property is configurable. The default is __v." SO, I suppose the point is, that we don't need __v in a RETURNED object, so just get rid of it
  }
})

module.exports = mongoose.model('Person', personSchema)
