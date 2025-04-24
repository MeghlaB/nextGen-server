const express = require('express')
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000

// midleWare
app.use(cors({
  origin: ['https://next-gen-921eb.web.app',
    'http://localhost:5173',
  ],
  // methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  credentials: true,  
}))

app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.u2fu7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    //  await client.connect();
    const usersCollection = client.db("nextGen").collection("users");
    const blogCollection = client.db("nextGen").collection("blogs");
    const applicationCollection = client.db("nextGen").collection("application");
// jwt api related
app.post('/jwt',async(req,res)=>{
    const user = req.body;
    const token = jwt.sign(user , process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"365d"
    })
    console.log(token)
    res.send({token})

})

    // users post collection api
    app.post('/users', async(req,res)=>{
        const userData = req.body;
        // insert user email if doesn't exits
        const query = {email:userData.email}
        const exitingUser = await usersCollection.findOne(query)
        if(exitingUser){
          return res.send({message:'user already exits',instertedId:null})
        }
        const result = await usersCollection.insertOne(userData)
        // console.log(result)
        res.send(result)
    })

    // user get collection api
    app.get('/users',async(req,res)=>{
      const result = await usersCollection.find().toArray()
      // console.log(result)
      
      res.send(result)
    })

    app.delete('/users/:id',async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await usersCollection.deleteOne(query)
        // console.log(result)
        res.send(result)
      })

      // admin selected user role
      app.patch('/users/admin/:id',  async (req, res) => {
        const id = req.params.id
        const filter = { _id: new ObjectId(id) }
        const updateDoc = {
          $set: {
            role: 'admin'
          }
        }
        const result = await usersCollection.updateOne(filter, updateDoc)
        res.send(result)
      })

// add blog api collection
      app.post('/add-blog', async(req,res)=>{
        const blogData = req.body;
        const result = await blogCollection.insertOne(blogData)
        console.log(result)
        res.send(result)
    })

    // blog collection api 
    app.get('/blogs',async(req,res)=>{
      const result = await blogCollection.find().toArray()
      console.log(result)
      res.send(result)
    })

    app.post('/application', async (req, res) => {
      try {
        const applicationData = req.body;
        const result = await applicationCollection.insertOne(applicationData);
        console.log(result);
        res.send(result); 
      } catch (error) {
        console.error('Error inserting application:', error);
        res.status(500).send({ message: 'Internal Server Error', error: error.message });
      }
    });
    
//Get application from api collection
  app.get('/applications',async(req,res)=>{
    const result = await applicationCollection.find().toArray()
    console.log(result)
    res.send(result)
  })



   









    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);








app.get('/', (req, res) => {
  res.send('Loading..........')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})