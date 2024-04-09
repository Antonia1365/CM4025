// Import necessary modules
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = "mongodb://localhost:27017";
;

// Database Name
const dbName = "myRaffleDb";

// Create a new MongoClient
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to the MongoDB server
client.connect(function(err) {
  if (err) {
    console.error('Error connecting to MongoDB:', err);
    return;
  }

  console.log('Connected successfully to MongoDB');

  const db = client.db(dbName);

  // List all collections in the database
  db.listCollections().toArray(function(err, collections) {
    if (err) {
      console.error('Error listing collections:', err);
      return;
    }

    console.log('Collections in the database:', collections.map(collection => collection.name));

    // Check if the 'raffles' collection exists
    const rafflesCollection = collections.find(collection => collection.name === 'raffles');
    if (rafflesCollection) {
      // If the 'raffles' collection exists, print its contents
      db.collection('raffles').find().toArray(function(err, raffles) {
        if (err) {
          console.error('Error fetching raffles:', err);
          return;
        }

        console.log('Contents of the "raffles" collection:', raffles);
      });
    } else {
      console.log('The "raffles" collection does not exist in the database');
    }

    // Close the connection
    client.close();
  });
});
