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

const personSchema = new mongoose.Schema({
    name:String,
    number:String
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id // "Even though the _id property of Mongoose objects looks like a string, it is in fact an object. The toJSON method we defined transforms it into a string just to be safe. If we didn't make this change, it would cause more harm to us in the future once we start writing tests." https://fullstackopen.com/en/part3/saving_data_to_mongo_db#fetching-objects-from-the-database 
    delete returnedObject.__v // "The versionKey is a property set on each document when first created by Mongoose. This keys value contains the internal revision of the document. The name of this document property is configurable. The default is __v." SO, I suppose the point is, that we don't need __v in a RETURNED object, so just get rid of it
  }
})

module.exports = mongoose.model('Person', personSchema)
