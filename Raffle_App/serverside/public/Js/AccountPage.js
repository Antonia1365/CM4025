$(document).ready(function(){  

   // All the necessary vars
    var deactivateButton = document.getElementById("Deactivate");
    var warningScreen = document.getElementById("WarningScreen");
    var warningTitle = document.getElementById("WarningTitle");
    var messageInfo = document.getElementById("MessageInfo");
    var raffleTaken = $("#RaffleTaken");
    var currentIndex = 0;
    var raffleBoxTitle = document.getElementById('RaffleBoxTitle');
    var raffleItems = document.querySelectorAll('.raffleItem');
    var currentIndex = 0;
    
    
    if (raffleTaken.css("visibility") === "visible") {
        setTimeout(function() {
            raffleTaken.css("visibility", "hidden");
        }, 5000);
    }

    function updateTicketDropdown() {
      var currentRaffle = raffleItems[currentIndex]; // Get the current displayed raffle
      var ticketDropdown = $('#ticketDropdown'); 
      ticketDropdown.empty(); // Clear dropdown
      console.log(ticketDropdown.length);
      //console.log(currentRaffle.dataset.tickets);
      var ticketsArr = currentRaffle.dataset.tickets.split(',')
    ; // Get the list of tickets for the current raffle
      if (ticketsArr.length > 0) {
        //console.log(ticketsArr);

        ticketsArr.forEach(function(ticket) {
              ticketDropdown.append($('<option>', { value: ticket, text: ticket }));
              //console.log(ticket);
          });
      } 
      else {
          ticketDropdown.append($('<option>', { value: '', text: 'No tickets available' }));
      }
      console.log("Dropdown element:", $('#ticketDropdown'));
  }
  
  // Update dropdown when the page loads initially
  updateTicketDropdown();


        // Initially hide the CreateRaffle section
        // When the button is clicked
    $('#CreateRaffle_btn').click(function() {
       
        $("#CreateRaffle").css("display", "block");
        $("#MyRaffle").css("display", "none");
        $("#CreateRaffle_btn").css("display", "none");
        $("#PrevRaffleBtn").css("display", "none");
        $("#NextRaffleBtn").css("display", "none");
        raffleBoxTitle.textContent = "Create a new Raffle";
        
    });

    $('#DisplayRaffles').click(function() {
        
        $("#CreateRaffle").css("display", "none");
        $("#MyRaffle").css("display", "block");
        $("#CreateRaffle_btn").css("display", "block");
        $("#PrevRaffleBtn").css("display", "inline-block");
        $("#NextRaffleBtn").css("display", "inline-block");
        
        raffleBoxTitle.textContent = "Raffles Held";
        
    });



    $('#EnterRaffle_btn').click(function() {
      
      $("#EnterRaffle").css("display", "block");
      $("#MyRaffle").css("display", "none");
      $("#EnterRaffle_btn").css("display", "none");
      $("#PrevRaffleBtn").css("display", "none");
      $("#NextRaffleBtn").css("display", "none");
      $("#RaffleBoxTitle").text("Enter a Raffle");
      updateTicketDropdown();
  });

  
  $('#BackToRaffleList').click(function() {
   
    $("#EnterRaffle").css("display", "none");
    $("#MyRaffle").css("display", "block");
    $("#EnterRaffle_btn").css("display", "block");
    $("#PrevRaffleBtn").css("display", "inline-block");
    $("#NextRaffleBtn").css("display", "inline-block");
    $("#RaffleBoxTitle").text("Enter a Raffle");
    //updateTicketDropdown();
});




    function showRaffle(index) {
        // Hide all raffles
        raffleItems.forEach(function(item) {
          item.style.display = 'none';
        });

        // Show the raffle at the specified index
        raffleItems[index].style.display = 'block';
        updateTicketDropdown();
    }

    showRaffle(currentIndex);
    

    document.getElementById('NextRaffleBtn').addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % raffleItems.length;
        showRaffle(currentIndex);
    });

    document.getElementById('PrevRaffleBtn').addEventListener('click', function() {
        currentIndex = (currentIndex - 1 + raffleItems.length) % raffleItems.length;
        showRaffle(currentIndex);
    });
   

// Function which displays the message box with explanation on when the account
// will be deleted and when it is recoverable
function deactivateAccount(){ 

   warningScreen.hidden = false;     // displaying the screen with the box
   
   // Setting the text of the box (changes for deactivating and restoring the account)
   warningTitle.innerText = "Are you sure you want to delete your account?";
   messageInfo.innerText = "Deleting an account is a permanent action and it cannot be reversed. " +
    "If you still choose to do so, you can " +
   "remove this account by clicking the button below.";
   
   // Creating a button to exit anytime
   $("#ExitWarning").click(function() {
    warningScreen.hidden = true;
    // if (($(warningMessage).find(deleteButton).length)) {
    //     // warningMessage.removeChild(yesInput);
    //     warningMessage.removeChild(deleteButton);
    // }
   }); 
   
}

document.getElementById("LogOut").onclick = function () {    //will log out the user and take them to the homepage
    location.href = "/";
};

deactivateButton.addEventListener('click', deactivateAccount, true);   // Adding the deactivating and recovering

// Create a raffle via post request (removed as its served locally)
/*
document.getElementById("CreateRaffle").addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the default form submission
    
    // Get the form data
    const name = document.querySelector('input[name="name"]').value;
    const prize = document.querySelector('input[name="prize"]').value;
    const drawDate = document.querySelector('input[name="drawDate"]').value;
  
    // Send a POST request to the server
    fetch('/createRaffle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, prize, drawDate })
    })
    .then(response => {
      // Check the response status
      if (response.ok) {
        return response.json(); // Parse the JSON response
      } else {
        throw new Error('Failed to create raffle');
      }
    })
    .then(data => {
      // Display success message
      document.getElementById("successMessage").style.visibility = "visible";
      setTimeout(() => {
        // Hide the success message after 5 seconds
        document.getElementById("successMessage").style.visibility = "hidden";
      }, 5000);
    })
    .catch(error => {
      // Display error message
      document.getElementById("errorMessage").style.visibility = "visible";
      setTimeout(() => {
        // Hide the error message after 5 seconds
        document.getElementById("errorMessage").style.visibility = "hidden";
      }, 5000);
      console.error('Error:', error);
    });
  });
*/




});