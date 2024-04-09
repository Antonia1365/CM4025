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
  var CodesScanned = 0;
  var Discount = 0;


  var data = {
    "_Id": ObjectID(),
    "Username": Username,
    "Email": Email,
    "Password": Password,
    "CodesScanned": CodesScanned,  //num of qr codes scanned 
    "Discount": Discount   //num of discounts ready to be used
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

    db.collection('raffles').find().toArray((err, raffles) => {
      if (err) {
        throw err;
      }
      // Check if raffles is not defined or is empty
      if (!raffles || raffles.length === 0) {
        // Render the AccountPage template with an empty array for raffles
        res.render('AccountPage', { account: user, raffles: [] });
      } else {
        // Render the AccountPage template with the retrieved raffles
        res.render('AccountPage', { account: user, raffles: raffles });
      }
    });
  });
});


