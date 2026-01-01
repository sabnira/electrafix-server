const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const port = process.env.PORT || 9000
const app = express()


app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zlvar1f.mongodb.net/?appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    // await client.connect();

    const db = client.db('electraFix-db')
    const servicesCollection = db.collection('services')
    const bookingCollection = db.collection('booking')

    //save a serviceData in db
    app.post('/add-service', async (req, res) => {
      const serviceData = req.body
      const result = await servicesCollection.insertOne(serviceData)
      console.log(result)
      res.send(result)
    })

    //get all jobs data from db
    app.get('/services', async (req, res) => {
      const result = await servicesCollection.find().toArray()
      res.send(result)
    })

    //get a single service data by id from db
    app.get('/service/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await servicesCollection.findOne(query)
      res.send(result)
    })


    //save a booking in db
    app.post(`/bookings`, async (req, res) => {
      const bookingData = req.body

      //if a user placed a booking already in this job 
      const query = {
        serviceId: bookingData.serviceId,
        userEmail: bookingData.userEmail
      }
      const alreadyExist = await bookingCollection.findOne(query)

      console.log('if already exist:', alreadyExist);
      if (alreadyExist)
        return res
          .status(400)
          .send('You have already Booked this Service!')

      //save data in booking collection
      const result = await bookingCollection.insertOne(bookingData)

      res.send(result)
    })


    // get all bookings for a specific user
    app.get('/bookings/:email', async (req, res) => {
      const email = req.params.email

      const query = { userEmail: email }

      const result = await bookingCollection.find(query).toArray()
      res.send(result)
    })


    // get all my add services for manage services 
    app.get('/myAddServices/:email', async (req, res) => {
      const email = req.params.email

      const query = { "serviceProvider.email": email }

      const result = await servicesCollection.find(query).toArray()
      res.send(result)
    })
    

    // get all my services for a specific user
    app.get('/myServices/:email', async (req, res) => {
      const email = req.params.email

      const query = { providerEmail: email }

      const result = await bookingCollection.find(query).toArray()
      res.send(result)
    })

    //status update
    app.patch('/status-update/:id', async (req, res) => {
      const id = req.params.id 
      const {status} = req.body
      const filter = { _id: new ObjectId(id)}
      const update = {
        $set: { serviceStatus: status }
      }
      const result = await bookingCollection.updateOne(filter, update)
      res.send(result)
    })

  } finally {
    // await client.close();

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello from ElectraFix Server....')
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})