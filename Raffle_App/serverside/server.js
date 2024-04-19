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

const nodemailer = require('nodemailer');
const { MAIL_USERNAME, MAIL_PASSWORD, MAIL_RECEPIENT, OAUTH_CLIENTID, OAUTH_CLIENT_SECRET, OAUTH_REFRESH_TOKEN} = require('./emailConfig');

//---------------------------------------------------------------------------//
function renderMainPage(req, res, errors) {
  const currentDate = new Date();

  // Get all raffles whoose draw date is in the future
  db.collection('raffles').find({ "drawDate": { $gt: currentDate } }).toArray((err, allRaffles) => {
      if (err) {
          throw err;
      }

      // Array to store filtered raffles
      const filteredRaffles = [];

      // Counter to keep track of how many raffles have been processed
      let processedRafflesCount = 0;

      // Function to check if a raffle's draw has a winner greater than 0
      function checkDrawWinner(raffle) {
          db.collection('draws').findOne({ "raffle.name": raffle.name }, (err, draw) => {
              if (err) {
                  throw err;
              }

              if (!draw || draw.winner <= 0) {
                  // Include the raffle in the filtered list if no draw or winner is <= 0
                  filteredRaffles.push(raffle);
              }

              // Increment processed raffles count
              processedRafflesCount++;

              // Check if all raffles have been processed
              if (processedRafflesCount === allRaffles.length) {
                  // Render the page template with the filtered raffles
                  res.render('MainPage', { raffles: filteredRaffles, errors: errors });
              }
          });
      }

      // Check if raffles is not defined or is empty
      if (!allRaffles || allRaffles.length === 0) {
          // Render the page template with an empty array for raffles
          res.render('MainPage', { raffles: [], errors: errors });
      } else {
          // Iterate over each raffle
          allRaffles.forEach(raffle => {
              // Check if the raffle has a draw with a winner greater than 0
              checkDrawWinner(raffle);
          });
      }
  });
}





app.get("/", (req, res) => {
  renderMainPage(req, res);

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
      renderAccountPage(res, result, err);
      console.log("Logged in")
    } 
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

      renderAccountPage(res, obj, err);
  });
});



//the logout function
app.get('/logout', function (req, res) {
  req.session.loggedin = false;
  req.session.destroy();
  obj = "";
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



app.post('/createRaffle', (req, res) => {
  // Retrieve data from the request body
  const name = req.body.name;
  const prize = req.body.prize;
  const drawDate = new Date(req.body.drawDate); // Convert drawDate to Date object
  const user = obj.Username;

  // Check if drawDate is in the past
  if (drawDate < new Date()) {
      // Render the AccountPage with the error message and the current user
      renderAccountPage(res, obj, 'Draw date cannot be in the past');
      return;
  }

  // Check if a raffle with the same name already exists
  db.collection('raffles').findOne({ name }, (err, existingRaffle) => {
      if (err) {
          console.error('Error checking existing raffle:', err);
          // Render the AccountPage with the error message and the current user
          renderAccountPage(res, obj, 'Failed to create raffle');
          return;
      }

      if (existingRaffle) {
          // A raffle with the same name already exists
          // Render the AccountPage with the error message and the current user
          renderAccountPage(res, obj, 'A raffle with this name already exists');
          return;
      }

      // Generate 10 unique verification codes for tickets
      // Update, user writes their ticket

      // Create a new raffle object
      const newRaffle = {
          name: name,
          prize: prize,
          drawDate: drawDate,
          user: user
          //tickets: tickets
      };

      // Insert the new raffle into the database
      db.collection('raffles').insertOne(newRaffle, (err, result) => {
          if (err) {
              console.error('Error creating raffle:', err);
              // Render the AccountPage with the error message and the current user
              renderAccountPage(res, obj, 'Failed to create raffle');
              return;
          }

          console.log('Raffle created successfully');
          console.log(newRaffle);
          // Redirect to the AccountPage after successful creation
          renderAccountPage(res, obj, 'Raffle created successfully');
      });
  });
});



// Endpoint to handle deleting a raffle
app.post('/deleteRaffle', (req, res) => {
  const raffleId = req.body.raffleNameInput;
  console.log(raffleId);

  db.collection('draws').findOne({ "raffle.name": raffleId }, (err, draw) => {
    if (err) {
      console.log('System Error');
      renderAccountPage(res, obj, err);
      return;
    }
    else if(draw){
      console.log('Cannot delete raffle. A draw has already started.');
      renderAccountPage(res, obj, 'Cannot delete raffle. A draw has already started.');
      return;
    }
    else{
  // Delete the raffle from the collection
  db.collection('raffles').deleteOne({ 
    "name": raffleId
  }, function (err, result) {
    if (err) {
      console.log('System Error');
      renderAccountPage(res, obj, err);
      return;
    }
    else{
      //console.log(result);
      console.log('Raffle ' + raffleId + ' deleted successfully');
      renderAccountPage(res, obj, 'Raffle deleted successfully');
    }    
  });
  }
});
    
});




// Helper function to render the Account page with an error message and the current user
function renderAccountPage(res, user, errors) {
  var allDigits = [];
  
  // Extract digits from each luckyNumbers instance and create a single array
  db.collection('luckyNumbers').find({}).toArray((luckyNumbersErr, luckyNumbers) => {
    if (luckyNumbersErr) {
      throw luckyNumbersErr;
    }
    
    
    allDigits = luckyNumbers.reduce((accumulator, currentValue) => {
      return accumulator.concat(currentValue.digit);
    }, []);

    // Function to create 5 lucky tickets to choose was taken from genAI
    const tickets = Array.from({ length: 5 }, () => {
      // Choose 3 random lucky digits 
      const randomDigits = Array.from({ length: 3 }, () => allDigits[Math.floor(Math.random() * allDigits.length)]);
      // Generate 3 more random digits
      const additionalRandomDigits = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10));
      // Concatenate and make a ticket
      return [...randomDigits, ...additionalRandomDigits].join('');
    });

    // Determine the user's account type and fetch appropriate data
    if (user.AccountType === "Raffle Holder") {
      // Extract digits from each raffle instance and create a single array
      db.collection('raffles').find({ "user": user.Username }).toArray((err, userRaffles) => {
        if (err) {
          throw err;
        }
        res.render('AccountPage', {
          account: user,
          raffles: userRaffles || [],
          luckyNumbers: tickets,
          errors: errors
        });
      });
    } 
    else if (user.AccountType === "Raffle Participant") {
 
      var filteredDraws = [];

      function filterDraws(draws, username) {
          const filteredDraws = draws.filter(draw => {
              const foundParticipant = draw.participants.find(participant => participant.username === username);
                return foundParticipant !== undefined;
          });
        return filteredDraws; 
    }

    db.collection('draws').find({}).toArray((err, allDraws) => {
        if (err) {
            throw err;
        }
    
        // Call the filterDraws function
        filteredDraws = filterDraws(allDraws, user.Username);

        if (filteredDraws.length === 0) {
            console.log("No draws found for user");
        }
    });

      // Get all raffles
      db.collection('raffles').find({}).toArray((err, allRaffles) => {
          if (err) {
              throw err;
          }
          const filteredRaffles = [];
          
  
          // Counter 
          let processedRafflesCount = 0;
  
          // Function to check if a raffle's draw has a winner greater than 0
          // checkDrawWinner was made with help from genAI
          function checkDrawWinner(raffle) {
              db.collection('draws').findOne({ "raffle.name": raffle.name }, (err, draw) => {
                  if (err) {
                      throw err;
                  }
  
                  if (!draw || draw.winner <= 0) {
                      // Include the raffle in the filtered list if no draw or winner is <= 0
                      filteredRaffles.push(raffle);
                  }
  
                  // Increment processed raffles
                  processedRafflesCount++;
  
                  // Check if all raffles have been processed
                  if (processedRafflesCount === allRaffles.length) {
                      // Render the page template with the filtered raffles
                      console.log("Length: ", filteredDraws.length);
                      console.log("Draw: ", filteredDraws);
                      res.render('AccountPage', {
                          account: user,
                          raffles: filteredRaffles || [],
                          draws: filteredDraws || [],
                          luckyNumbers: tickets,
                          errors: errors
                      });
                  }
              });
          }
  
          // Iterate over each raffle
          allRaffles.forEach(raffle => {
              // Check if the raffle's draw has a winner > 0
              checkDrawWinner(raffle);
          });
      });
  }
  });
}



//---------------------------------------------------------------------//

function EnterRaffle(username, currentRaffle, ticket, req, res, callback) {
  var errors = "";
  // Check if there's an existing draw instance for the current raffle
  db.collection('draws').findOne({ 'raffle.name': currentRaffle.name }, (err, existingDraw) => {
    if (err) {
        console.error('Error checking existing draw:', err);
        renderMainPage(req, res);
        callback("System error: Cannot find data for this draw");
        return;
    }

    if (existingDraw) {
        // If there is, then check if the user is already among the participants
        if (existingDraw.participants.some(participant => participant.username === username)) {
            // Username already exists in the participants array, display error message
            console.log('Username already exists in participants array');
            callback("You have already entered this draw");  
            return;
        }

        // Add the new participant to the participants array with the chosen ticket
        db.collection('draws').updateOne(
            { _id: existingDraw._id },
            { $addToSet: { participants: { username: username, ticket: ticket } } },
            (err, result) => {
                if (err) {
                    console.error('Error updating draw:', err);
                    callback("You have already entered this draw");                
                    return;
                }
                console.log('Participant added to existing draw successfully');
                //console.log(req.session.loggedin.);
                callback("You have successfully entered the raffle draw!"); 
                return;                             
            }
        );
    } else {
        // No existing draw for this raffle, create a new one
        //Update: User chooses their own ticket
       // const selectedTicket = currentRaffle.tickets[Math.floor(Math.random() * currentRaffle.tickets.length)];
        
        var newDraw = {
            raffle: currentRaffle,
            participants: [{ username: username, ticket: ticket }],
            winner: 0,
            date: new Date()
        };

        db.collection('draws').insertOne(newDraw, (err, result) => {
            if (err) {
                console.error('Error storing draw: ', err);
                callback( "Error: Could not enter the draw");                
                return;
            }

            console.log('New draw stored successfully');
            callback("You have successfully entered the raffle draw!");
            return;
            //console.log("Verification code sent. Please check your email.")
        });
      }
  });
  
}


app.post('/RaffleSignup', async (req, res) => {

  var username = req.body.Email; // Changed it to email
  var currentRaffle = JSON.parse(req.body.CurrentRaffle);
  var ticket = req.body.TicketNumber;
  
  //console.log(ticket); 
  //console.log(currentRaffle.tickets); 

  EnterRaffle(username, currentRaffle, ticket, req, res, (errors) => {
    console.log("Errors: " + errors);
    renderMainPage(req, res, errors);
  });
  
});


// Route handler for entering raffle
app.post('/enterRaffle', (req, res) => {
  const username = req.session.currentuser; // Keep Username to differentiate account holders
  const currentRaffle = JSON.parse(req.body.CurrentRaffle);
  const ticket = req.body.activeInputValue;
  //console.log("User: " + username);
 

  EnterRaffle(username, currentRaffle, ticket, req, res, (errors) => {
    console.log("Errors: " + errors);
    renderAccountPage(res, obj, errors);
  });

});



// Lucky numbers collection updates
// Calculate the numbers most commong among draw winners and update the lucky numbers collection

const calculateLuckyNumbers = async () => {
  // Query the draw collection to retrieve all the winning numbers
  const draws = await db.collection('draws').find({ winner: { $exists: true } }).toArray();
  //console.log("Draws" + draws.winner);
  // Count the occurrences of each digit
  const digitCounts = {};
  var winningNumber = 0;
  draws.forEach(draw => {
    if (draw.winner !== 0) {
        winningNumber = draw.winner.toString();
    } 
    else {
        // Default to 6 random digits
        winningNumber = '';
        for (let i = 0; i < 6; i++) {
            winningNumber += Math.floor(Math.random() * 10); // Generate random digit between 0 and 9
        }
    }
    for (let i = 0; i < winningNumber.length; i++) {
        const digit = winningNumber.charAt(i);
        digitCounts[digit] = (digitCounts[digit] || 0) + 1;
    }
});

  // Determine the 6 most frequently occurring digits
  const sortedDigits = Object.keys(digitCounts).sort((a, b) => digitCounts[b] - digitCounts[a]).slice(0, 6);
  //console.log(sortedDigits);

  // Store these digits in the luckyNumbers collection
  await db.collection('luckyNumbers').deleteMany({}); // Clear existing lucky numbers
  await db.collection('luckyNumbers').insertMany(sortedDigits.map(digit => ({ digit, count: digitCounts[digit] })));
  //console.log('Lucky numbers updated');
};

// Call the function to calculate lucky numbers periodically
setInterval(calculateLuckyNumbers, 120000); // 5 sec (5000) for testing, 2 min (120000) for final


/*-----------------------------------------------------------------------*/
// Function to select a winner for a draw
var winnerTicket = 0;
function selectWinner(draw) {
  return new Promise((resolve, reject) => {
    // Check if the draw has no winner and has participants
    if (draw.winner === 0 && draw.participants.length > 0) {
      // Randomly select a participant's ticket
      const winningTicket = parseInt(draw.participants[Math.floor(Math.random() * draw.participants.length)].ticket);
      // Update the draw with the winning ticket
      winnerTicket = winningTicket;

      db.collection('draws').updateOne(
        { _id: draw._id },
        { $set: { winner: winningTicket } },
        (err, result) => {
          if (err) {
            console.log('Error updating draw with winner:', err);
            return reject(err);
          }
          console.log("Winner " + winningTicket + " selected and updated successfully: " + draw.raffle.name);
          
          // Query participants whose ticket doesn't equal the winning ticket
          db.collection('draws').findOne({ _id: draw._id }, (err, updatedDraw) => {
            if (err) {
              console.log('Error finding draw:', err);
              return reject(err);
            }
            // Update the draw with the winner
            if (updatedDraw && updatedDraw.participants) {
              const winnerParticipant = updatedDraw.participants.filter(participant => participant.ticket == winningTicket.toString());

              console.log('Winner:', winnerParticipant);
              // Remove the loser participants
              db.collection('draws').updateOne(
                { _id: draw._id },
                { $set: { participants: winnerParticipant } },
                (err, result) => {
                  if (err) {
                    console.log('Error removing losing participants:', err);
                    return reject(err);
                  }
                  console.log('Losing participants removed from the draw.');
                  resolve();
                }
              );
            }
          });
        }
      );
    } else {
      console.log('Draw already has a winner or no participants.');
      resolve();
    }
  });
}


// Choose a random winner for a draw 
// For testing purposes choose the draw with closest date to the current date every n min
async function selectWinnerForClosestDraw() {
  // Get the current date
  const currentDate = new Date();

  // Look at draws with dates > current
  // Find the min difference
  let closestDraw;
  let closestDifference = Infinity; //max

  try {
    // Take draws from the database that don't yet have a winner
    const draws = await db.collection('draws').find({ winner: 0 }).toArray();

    // Loop through all draws
    for (const draw of draws) {
      const drawDate = new Date(draw.raffle.drawDate);

      // Filter only future draws
      if (drawDate > currentDate) {
        // Difference between the draw date and the current date
        const difference = drawDate - currentDate;

        if (difference < closestDifference) {
          closestDraw = draw;
          closestDifference = difference; // Update to the smallest current number
        }
      }
    }

    // Check if a closest draw was found
    if (closestDraw) {
      // Select a winner
      await selectWinner(closestDraw);

      // After selecting the winner, perform the query
      const result = await db.collection('draws').findOne({ _id: closestDraw._id });
      console.log("Ticket: "+ winnerTicket);
      const winnerParticipant = result.participants.find(participant => participant.ticket === winnerTicket.toString());
      
      //console.log("Participants: "+ closestDraw.participants.toArray());

      // Send email to non-registered users
      if (winnerParticipant.username) {
        const emailRegex = /\S+@\S+\.\S+/;
        if (emailRegex.test(winnerParticipant.username)) {
          console.log('Winner participant is an email:', winnerParticipant.username);
          notifyWinner(winnerParticipant.username, winnerTicket);
        } 

         // Send email to registered users
        else {
          console.log('Winner participant is not an email:', winnerParticipant.username);
          // Query the profile collection to find the account with the username
          const profile = await db.collection('profile').findOne({ Username: winnerParticipant.username });
                
          if (profile) {
              console.log('Email found:', profile.Email, winnerTicket);
              notifyWinner(profile.Email, winnerTicket);
              
          } 
          else {
              console.log('No profile found for the winner participant.');
          }
        }

      // Error should it fall here
      } 
      else {
        console.log('No winner participant username found.');
      }
    } else {
      console.log('No draws found with draw date in the future.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


// Function to periodically select a winner for the draw with the closest draw date
function scheduleWinnerSelection(intervalInMinutes) {
  // Set up an interval to run every x minutes
  setInterval(selectWinnerForClosestDraw, intervalInMinutes * 60 * 1000); // Convert minutes to milliseconds
  //notifyWinner();
}

scheduleWinnerSelection(60)
// Start the winner selection process

function notifyWinner(winner, winnerTicket) { 
  // Create a Nodemailer transporter and send email notif to winner
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: MAIL_USERNAME,
      pass: MAIL_PASSWORD,
      clientId: OAUTH_CLIENTID,
      clientSecret: OAUTH_CLIENT_SECRET,
      refreshToken: OAUTH_REFRESH_TOKEN
    }
  });

  let mailOptions = {
    from: MAIL_USERNAME,
    to: winner,
    subject: 'Recent Raffle Draw Results',
    text: 'Congratulations! Your ticket number '+ winnerTicket 
     + ' has been drawn as the winner of our most recent raffle draw.'
     + ' Enter your ticket number along with your email or log in to claim your prize:'
     + ' http://localhost:8080/LoginPage'
  };


  transporter.sendMail(mailOptions, function(err, data) {
    if (err) {
      console.log("Error " + err);
    } else {
      console.log("Email sent successfully");
    }
  });

}






