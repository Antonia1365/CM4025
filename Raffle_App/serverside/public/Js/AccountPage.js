$(document).ready(function () {

// All the necessary vars
var deactivateButton = document.getElementById("Deactivate");
var warningScreen = document.getElementById("WarningScreen");
var warningTitle = document.getElementById("WarningTitle");
var messageInfo = document.getElementById("MessageInfo");
var raffleTaken = $("#RaffleTaken");
var currentIndex = 0;
var currentRaffle = null; // Store the currently displayed raffle i.e chosen by user
var currentDraw = null; 
var raffleBoxTitle = document.getElementById('RaffleBoxTitle');
var raffleItems = document.querySelectorAll('.raffleItem');
var drawItems = document.querySelectorAll('.drawItem');
const ticketDropdown = document.getElementById('ticketDropdown');
const ticketNumberInput = document.getElementById('ticketNumberInput');
var myDrawsButton = document.getElementById('MyDraws');

if (raffleTaken.css("visibility") === "visible") {
setTimeout(function () {
raffleTaken.css("visibility", "hidden");
}, 5000);
}

$("#ChooseTicket").css("visibility", "hidden");
$("#WriteTicket").css("visibility", "hidden");
if(ticketDropdown != null){
ticketDropdown.disabled = false;
ticketNumberInput.disabled = true;
ticketNumberInput.style.borderColor = "#ffffffed";
}

// Initially hide the CreateRaffle section
// When the button is clicked
$('#CreateRaffle_btn').click(function () {

$("#CreateRaffle").css("display", "block");
$("#MyRaffle").css("display", "none");
$("#CreateRaffle_btn").css("display", "none");
$("#PrevRaffleBtn").css("display", "none");
$("#NextRaffleBtn").css("display", "none");
$("#DeleteRaffle_btn").css("display", "none");
$("#TriggerDraw_btn").css("display", "none");


//console.log("CreateRaffle");
raffleBoxTitle.textContent = "Create a new Raffle";

});

$('#DisplayRaffles').click(function () {

$("#CreateRaffle").css("display", "none");
$("#MyRaffle").css("display", "block");
$("#CreateRaffle_btn").css("display", "block");
$("#PrevRaffleBtn").css("display", "inline-block");
$("#NextRaffleBtn").css("display", "inline-block");

$("#DeleteRaffle_btn").css("display", "inline-block");
$("#TriggerDraw_btn").css("display", "inline-block");

raffleBoxTitle.textContent = "Raffles Held";
//console.log("DisplayRaffles");

});


if(raffleItems){
$('#EnterRaffle_btn').click(function () {

$("#EnterRaffle").css("display", "block");
$("#MyRaffle").css("display", "none");
$("#EnterRaffle_btn").css("display", "none");
$("#PrevRaffleBtn").css("display", "none");
$("#NextRaffleBtn").css("display", "none");
$("#RaffleBoxTitle").text("Enter a Raffle");
$("#ChooseTicket").css("visibility", "visible");
$("#WriteTicket").css("visibility", "visible");

$('#currentRaffleInput').val(JSON.stringify(currentRaffle));
// Save the raffle into a hidden field in the form
// Send it along with the user details to the participation logic 
//console.log("EnterRaffle");
});
}
else{
    console.log("No raffle selected: " + currentRaffle);
    $("#EnterRaffle_btn").css("display", "none");
}


$('#BackToRaffleList').click(function () {

$("#EnterRaffle").css("display", "none");
$("#MyRaffle").css("display", "block");
$("#EnterRaffle_btn").css("display", "block");
$("#PrevRaffleBtn").css("display", "inline-block");
$("#NextRaffleBtn").css("display", "inline-block");
$("#RaffleBoxTitle").text("Enter a Raffle");
$("#ChooseTicket").css("visibility", "hidden");
$("#WriteTicket").css("visibility", "hidden");

});




function showRaffle(index) {
// Hide all raffles

    // Check if index is within bounds and drawItems is defined
    if (index >= 0 && index < raffleItems.length) {
    
    raffleItems.forEach(function (item) {
    item.style.display = 'none';
    });

// Show the raffle at the specified index
    raffleItems[index].style.display = 'block';

// Store the current raffle
    currentRaffle = {
        name: raffleItems[index].querySelector('p:nth-of-type(1)').innerText.split(': ')[1],
        prize: raffleItems[index].querySelector('p:nth-of-type(2)').innerText.split(': ')[1],
        drawDate: raffleItems[index].querySelector('p:nth-of-type(3)').innerText.split(': ')[1],
    }
 } else{
    console.error('Index out of bounds:', index);
 }
}

showRaffle(currentIndex);
if(currentRaffle){
$('#raffleName').val(JSON.stringify(currentRaffle.name));
$('#raffleNameTrigger').val(JSON.stringify(currentRaffle.name));
}

document.getElementById('NextRaffleBtn').addEventListener('click', function () {
currentIndex = (currentIndex + 1) % raffleItems.length;
showRaffle(currentIndex);
if(currentRaffle){
$('#raffleName').val(JSON.stringify(currentRaffle.name));
$('#raffleNameTrigger').val(JSON.stringify(currentRaffle.name));
}
});

document.getElementById('PrevRaffleBtn').addEventListener('click', function () {
currentIndex = (currentIndex - 1 + raffleItems.length) % raffleItems.length;
showRaffle(currentIndex);
if(currentRaffle){
$('#raffleName').val(JSON.stringify(currentRaffle.name));
$('#raffleNameTrigger').val(JSON.stringify(currentRaffle.name));
}
});



function showDraw(index) {

    // Check if index is within bounds and drawItems is defined
    if (index >= 0 && index < drawItems.length) {
        // Hide all draws
        drawItems.forEach(function (item) {
            item.style.display = 'none';
        });

        // Show the draw at the specified index
        drawItems[index].style.display = 'block';

        // Store the current draw
        currentDraw = {
            name: drawItems[index].querySelector('p:nth-of-type(1)').innerText.split(': ')[1],
            participants: drawItems[index].querySelector('p:nth-of-type(2)').innerText.split(': ')[1],
            winner: drawItems[index].querySelector('p:nth-of-type(3)').innerText.split(': ')[1]
        }
    } else {
        console.error('Index out of bounds:', index);
    }
}

myDrawsButton.addEventListener('click', function () {
    var accountDetails = document.getElementById('AccountDetails');
    var carouselContainer = document.getElementById('CarouselContainer2');
    var exitDrawBtn = document.getElementById('ExitDraw');
    
    // Toggle visibility of the account details and carousel containers
    accountDetails.style.display = (accountDetails.style.display === 'none') ? 'block' : 'none';
    carouselContainer.style.display = (carouselContainer.style.display === 'none') ? 'block' : 'none';

    if (myDrawsButton.innerText === 'My Draws') {
        exitDrawBtn.style.display = 'flex';
        myDrawsButton.innerText = 'Back';
    } else {
        myDrawsButton.innerText = 'My Draws';
        exitDrawBtn.style.display = 'none';
    }

    // If carousel is made visible, show draws
    if (carouselContainer.style.display === 'block') {
        if(drawItems){
        exitDrawBtn.style.display = 'block';
        showDraw(currentIndex);
        $('#currentDraw').val(JSON.stringify(currentDraw));
        //console.log("Showing draw: ", currentDraw);
    }
    else{
        exitDrawBtn.style.display = 'none';
      } 
  }
  
});

document.getElementById('NextDrawBtn').addEventListener('click', function () {
    currentIndex = (currentIndex + 1) % drawItems.length;
    showDraw(currentIndex);
    $('#currentDraw').val(JSON.stringify(currentDraw));
    //console.log("Showing draw: ", currentDraw);
});

document.getElementById('PrevDrawBtn').addEventListener('click', function () {
    currentIndex = (currentIndex - 1 + drawItems.length) % drawItems.length;
    showDraw(currentIndex);
    $('#currentDraw').val(JSON.stringify(currentDraw));
});



// Toggle between ticket dropdown and input field
function disableTicketNumberInput() {
        console.log("Ticket dropdown clicked");
        ticketNumberInput.disabled = true;
        ticketNumberInput.style.borderColor = "#ffffffed";
        ticketDropdown.disabled = false;
}

    // Function to disable ticketDropdown and enable ticketNumberInput
function disableTicketDropdown() {
        console.log("Ticket number input clicked");
        ticketDropdown.disabled = true;
        ticketNumberInput.disabled = false;
        ticketNumberInput.style.borderColor = "#a8a4a4";
}


// Add event listeners 
$('#ChooseTicket').click( disableTicketNumberInput);
$('#WriteTicket').click(disableTicketDropdown);

// Add an event listener to the "Delete Raffle" button
if (document.getElementById("DeleteRaffle_btn")) {
    // Add an event listener to the "Delete Raffle" button
    document.getElementById("DeleteRaffle_btn").addEventListener("click", function(event) {
        // Get the name of the current raffle being displayed in the carousel
        var currentRaffleName = currentRaffle.name;

        // Set the value of the hidden input field with the name of the current raffle
        document.getElementById("raffleName").value = currentRaffleName;
        
    });
}

// Add an event listener to the "Delete Raffle" button
if (document.getElementById("TriggerDraw_btn")) {
    // Add an event listener to the "Delete Raffle" button
    document.getElementById("TriggerDraw_btn").addEventListener("click", function(event) {
        // Get the name of the current raffle being displayed in the carousel
        var currentRaffleName = currentRaffle.name;

        // Set the value of the hidden input field with the name of the current raffle
        document.getElementById("raffleNameTrigger").value = currentRaffleName;
        console.log('Current raffle: ' + currentRaffleName);
        console.log("Triggering draw for raffle: " + document.getElementById("raffleNameTrigger").value);
        
    });
}


// User enters an active raffle
// Consider either the chosen ticket or the user written one
// Function taken from generative ai
$('#raffleForm').submit(function() {
    // Get the value of the active input field and set it to the hidden input
    var activeInputValue = "";
    $('#raffleForm input[name="activeInputValue"]').remove();

    if ($('#ticketDropdown').prop('disabled')) {
        activeInputValue = ticketNumberInput.value   
    } 
    else {
        activeInputValue = ticketDropdown.value;
    }
    // Remove whitespace
    activeInputValue = activeInputValue.trim(); 
    $('<input>').attr({
        type: 'hidden',
        name: 'activeInputValue',
        value: activeInputValue
    }).appendTo('#raffleForm');
    console.log(activeInputValue);
});



// Function which displays the message box with explanation on when the account
// will be deleted and when it is recoverable
function deactivateAccount() {

warningScreen.hidden = false;     // displaying the screen with the box

// Setting the text of the box (changes for deactivating and restoring the account)
warningTitle.innerText = "Are you sure you want to delete your account?";
messageInfo.innerText = "Deleting an account is a permanent action and it cannot be reversed. " +
"If you still choose to do so, you can " +
"remove this account by clicking the button below.";

// Creating a button to exit anytime
$("#ExitWarning").click(function () {
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



});