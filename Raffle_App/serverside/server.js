//server
const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/ecoscan_system";
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
  //find the user by username in the db
  db.collection('profile').findOne({
    "Username": Username
  }, function (err, result) {

    if (err) {
      throw (err);
    }
    //if there isn't one 
    if (!result) {
      res.redirect('LoginPage');
      console.log("No such user");
      return
    }
    //check if the password matches  
    if (result.Password == Password) {
      req.session.loggedin = true;
      req.session.currentuser = Username;
      req.session.userId = result._id;
      obj = result;
      res.render('AccountPage', {
        account: result
      })
      console.log("Logged in")
    }
    //or notify if it doesn't
    else {
      res.render("LoginPage", {
        errors: "Wrong pass"
      })
      console.log("Wrong password");
    }
  });
});

//the account page
app.get("/AccountPage", (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('LoginPage');
    console.log("No login session");
    return;
  }
  orders = db.collection('payment_details').find({ "userId": obj._id })
  //find the logged in user and display its info on the account page
  db.collection('profile').findOne({
    "Username": obj.Username
  }, function (err, result) {

    if (err) {
      throw (err);
    }

    if (!result) {
      res.render("LoginPage")
      return
    }

    res.render('AccountPage', {
      account: result
    })
  });

});


