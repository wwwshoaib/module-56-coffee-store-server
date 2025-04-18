const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId,  } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7twsfn9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB client setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Global collection variable
let coffeeCollection;

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    coffeeCollection = client.db('coffeeMaster').collection('coffee');
    console.log("✅ Connected to MongoDB Successfully!");

    // Start the server after DB is connected
    app.listen(port, () => {
      console.log(`🚀 Server is running on port: ${port}`);
    });

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

run();

// Routes
app.get('/', (req, res) => {
  res.send("☕ Coffee making server is running ....");
});
//READ operation: get all coffees
app.get('/coffee', async(req, res) => {
  const cursor = coffeeCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})
//Get a specific coffee to update
app.get('/coffee/:id', async(req, res) => {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const result = await coffeeCollection.findOne(query);
  res.send(result);
})
//UPDATE operation
app.put('/coffee/:id', async(req, res) => {
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)};
  const options = {upsert: true};
  const updatedCoffee = req.body;
  const coffee = {
    $set: {
      name: updatedCoffee.name,
      quantity: updatedCoffee.quantity,
      supplier: updatedCoffee.supplier,
      taste: updatedCoffee.taste,
      category: updatedCoffee.category,
      details: updatedCoffee.details,
      photo: updatedCoffee.photo,
    }
  } 

  const result = await coffeeCollection.updateOne(filter, coffee, options);
  res.send(result);
})
//CREATE operation: create a coffee
app.post('/addcoffee', async (req, res) => {
  try {
    const newCoffee = req.body;
    const result = await coffeeCollection.insertOne(newCoffee);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error in /addcoffee:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//DELETE operation
app.delete('/coffee/:id', async(req, res) => {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const result = await coffeeCollection.deleteOne(query);
  res.send(result);
})
