//server
const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/myRaffleDb";
const session = require('express-session');
const bodyParser = require('body-parser');
const querystring = require('querystring');
//const dummy = require('./public/data/data.json');
const { ObjectID } = require('bson');
const { render } = require('ejs');


app.use(session({ secret: 'We love the earth' }));

app.use(express.static('public'))
app.use(bodyParser.urlencoded({
  extended: true
}))

var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.use("/css", express.static(__dirname + "public/CSS"));
app.use("/images", express.static(__dirname + " public/Images"));
app.use("/js", express.static(__dirname + "public/Js"));


// set views
app.set("views", "./views");
app.set("view engine", "ejs");

var db;

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, database) {
  if (err) throw err;
  db = database;
  app.listen(8080)
  console.log('listening on 8080')
})

app.get("/", (req, res) => {
  res.render("LoginPage");
});

app.get("/LoginPage", (req, res) => {
  res.render("LoginPage");
});

//Sign up
app.post('/signup', (req, res) => {

  //DB variables
  var Username = req.body.Username;
  var Email = req.body.Email;
  var Password = req.body.Password;
  var AccountType = req.body.AccountType;


  var data = {
    "_Id": ObjectID(),
    "Username": Username,
    "Email": Email,
    "Password": Password,
   "AccountType": AccountType,
  }

  //search the db for an already existing username before adding 
  //(doesn't allow duplicate usernames)
  db.collection('profile').findOne({
    "Username": Username
  }, function (err, result) {

    if (err) {
      console.log(err);
      throw (err)
    }
    //if the username isn't in the db, add the new user
    if (!result) {
      db.collection('profile').insertOne(data, (err, collection) => {
        if (err) throw err;
        console.log('saved to database successfully')
        //db.collection('profile').deleteMany();  //used during testing
        res.render("LoginPage", {
          errors: "Account created"
        })
        // console.log(errors);    
      })
      return;
    }
    //notify user if the name is taken
    if (result) {
      res.render("LoginPage", {
        errors: "Username taken"
      })
      return;
    }
  });
});

var obj = "";  //will store the currently logged in user
app.post('/dologin', function (req, res) {
  var Username = req.body.Username;
  var Password = req.body.Password;
  // Find the user by username in the database
  db.collection('profile').findOne({
    "Username": Username
  }, function (err, result) {
    if (err) {
      throw (err);
    }
    if (!result) {
      res.redirect('LoginPage');
      console.log("No such user");
      return
    }
    if (result.Password == Password) {
      req.session.loggedin = true;
      req.session.currentuser = Username;
      req.session.userId = result._id;
      obj = result;
      // Retrieve raffles from the database
      db.collection('raffles').find().toArray((err, raffles) => {
        if (err) {
          throw err;
        }
        // Pass account and raffles to the AccountPage template
        res.render('AccountPage', {
          account: result,
          raffles: raffles || [] // Pass an empty array if raffles is undefined
        });
      });
      console.log("Logged in")
    } else {
      res.render("LoginPage", {
        errors: "Wrong pass"
      })
      console.log("Wrong password");
    }
  });
});

// Assuming req.session.currentuser contains the username of the logged-in user

app.get("/AccountPage", (req, res) => {
  if (!req.session.loggedin) {
      res.redirect('LoginPage');
      return;
  }

  db.collection('profile').findOne({ "Username": req.session.currentuser }, (err, user) => {
      if (err) {
          throw err;
      }
      if (!user) {
          res.render("LoginPage");
          return;
      }
      console.log(user.Username);
      console.log(user.AccountType);

      if (user.AccountType === 'Raffle Holder') {
          // Find raffles created by the current user
          db.collection('raffles').find({ "user": user.Username }).toArray((err, userRaffles) => {
              if (err) {
                  throw err;
              }
              console.log(userRaffles);
              // Check if raffles is not defined or is empty
              if (!userRaffles || userRaffles.length === 0) {
                  // Render the AccountPage template with an empty array for raffles
                  res.render('AccountPage', { account: user, raffles: [] });
              } else {
                  // Render the AccountPage template with the retrieved raffles
                  res.render('AccountPage', { account: user, raffles: userRaffles });
              }
          });
      } else {
          // For other account types, find raffles with draw dates greater than the current date
          const currentDate = new Date();
          db.collection('raffles').find({ "drawDate": { $gt: currentDate } }).toArray((err, allRaffles) => {
              if (err) {
                  throw err;
              }
              // Check if raffles is not defined or is empty
              if (!allRaffles || allRaffles.length === 0) {
                  // Render the AccountPage template with an empty array for raffles
                  res.render('AccountPage', { account: user, raffles: [] });
              } else {
                  // Render the AccountPage template with the retrieved raffles
                  res.render('AccountPage', { account: user, raffles: allRaffles });
              }
          });
      }
  });
});



//the logout function
app.get('/logout', function (req, res) {
  req.session.loggedin = false;
  req.session.destroy();
  res.redirect('/');
  console.log("Logged out");
});


//deleting an account
app.get("/delete", (req, res) => {
  if (!req.session.loggedin) {  //if no login session transfer to the login page
    res.redirect('LoginPage');
    return;
  }
  db.collection('profile').deleteOne({ //find the current user and delete them 
    "Username": obj.Username
  }, function (err, result) {
    if (err) {
      throw (err)
    }
    res.redirect('/'); //and transfer to the root page
    console.log("Account deleted");
  });

});

/*
// Create a route handler for the "/createRaffle" endpoint
app.post('/createRaffle', (req, res) => {
  // Retrieve data from the request body
  const name = req.body.name;
  const prize = req.body.prize;
  const drawDate = req.body.drawDate;

  console.log('Request Body:', req.body); // Log the request body

  // Create a new raffle
  db.collection('raffles').findOne({ name }, (err, existingRaffle) => {
    if (err) {
      console.error('Error finding raffle:', err);
      res.status(500).json({ success: false, message: 'Failed to find raffle' });
    } else if (existingRaffle) {
      // A raffle with the same name 
      console.log('Existing Raffle:', existingRaffle);
      res.status(400).json({ success: false, message: 'Raffle name already exists' });
    } else {
      // Insert the new raffle 
      db.collection('raffles').insertOne({ name, prize, drawDate }, (err, result) => {
        if (err) {
          console.error('Error creating raffle:', err);
          //error response
          res.status(500).json({ success: false, message: 'Failed to create raffle' });
        } else {
          console.log('Raffle created successfully');
          //success response
          res.status(200).json({ success: true, message: 'Raffle created successfully' });
        }
      });
    }
  });
});

*/


app.post('/createRaffle', (req, res) => {
  // Retrieve data from the request body
  const name = req.body.name;
  const prize = req.body.prize;
  const drawDate = new Date(req.body.drawDate); // Convert drawDate to Date object
  const user = obj.Username

  // Check if drawDate is in the past
  if (drawDate < new Date()) {
    // Render the AccountPage with the error message and the current user
    renderAccountPage(res, obj, 'Failed');
    return;
  }
  // Check if a raffle with the same name already exists
  db.collection('raffles').findOne({ name }, (err, existingRaffle) => {
    if (err) {
      console.error('Error checking existing raffle:', err);
      // Render the AccountPage with the error message and the current user
      renderAccountPage(res, obj, 'Failed');
      return;
    }
    
    if (existingRaffle) {
      // A raffle with the same name already exists
      // Render the AccountPage with the error message and the current user
      renderAccountPage(res, obj, 'Exists');
      return;
    }

    // Create a new raffle object
    const newRaffle = {
      name: name,
      prize: prize,
      drawDate: drawDate,
      user: user
    };

    // Insert the new raffle into the database
    db.collection('raffles').insertOne(newRaffle, (err, result) => {
      if (err) {
        console.error('Error creating raffle:', err);
        // Render the AccountPage with the error message and the current user
        renderAccountPage(res, obj, 'Failed');
        return;
      }

      console.log('Raffle created successfully');
      console.log(newRaffle);
      // Redirect to the AccountPage after successful creation
      renderAccountPage(res, obj, 'Success');
    });
  });
});

// Function to render the AccountPage with a message and the current user
function renderAccountPage(res, user,  errors) {
  db.collection('raffles').find({ "user": user }).toArray((err, userRaffles) => {
    if (err) {
        throw err;
    }
    // Check if raffles is not defined or is empty
    if (!userRaffles || userRaffles.length === 0) {
        // Render the AccountPage template with an empty array for raffles
        raffles = [];
    } else {
        // Render the AccountPage template with the retrieved raffles
        raffles = userRaffles;
    }
    // Render the AccountPage with the provided message and user
    res.render('AccountPage', {
      account: user,
      raffles: raffles || [], // Pass an empty array if raffles is undefined
      errors: errors
    });
  });
}




