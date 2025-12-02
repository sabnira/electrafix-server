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