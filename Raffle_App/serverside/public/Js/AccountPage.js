$(document).ready(function(){  
   // All the necessary vars
    var recovery = document.getElementById("Recover");
    var deactivateButton = document.getElementById("Deactivate");
    var warningScreen = document.getElementById("WarningScreen");
    var warningMessage = document.getElementById("WarningMessage");
    var warningTitle = document.getElementById("WarningTitle");
    var messageInfo = document.getElementById("MessageInfo");
    var status = document.getElementById("Status");
    var message = document.getElementById("DeletedScreen");
   


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
    status.innerHTML = "Active"
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
// recovery.addEventListener('click', recoverAccount, true);              // to the appropriate buttond

});