$(document).ready(function(){

  var raffleItems = document.querySelectorAll('.raffleItem');
  var currentIndex = 0;
  var currentRaffle = null; // Store the currently displayed raffle i.e chosen by user

  function showRaffle(index) {
      // Hide all raffles
      raffleItems.forEach(function(item) {
        item.style.display = 'none';
      });

      // Show the raffle at the index
      raffleItems[index].style.display = 'block';

      // Store the current raffle
    currentRaffle = {
      name: raffleItems[index].querySelector('p:nth-of-type(1)').innerText.split(': ')[1],
      prize: raffleItems[index].querySelector('p:nth-of-type(2)').innerText.split(': ')[1],
      drawDate: raffleItems[index].querySelector('p:nth-of-type(3)').innerText.split(': ')[1],
    };

    console.log("currentRaffle");
  }

  showRaffle(currentIndex);
  console.log("currentRaffle");
  console.log(currentRaffle);
  

  document.getElementById('NextRaffleBtn').addEventListener('click', function() {
      currentIndex = (currentIndex + 1) % raffleItems.length;
      showRaffle(currentIndex);
  });

  document.getElementById('PrevRaffleBtn').addEventListener('click', function() {
      currentIndex = (currentIndex - 1 + raffleItems.length) % raffleItems.length;
      showRaffle(currentIndex);
  });


  var raffleSignupDiv = document.getElementById("Create");
  var raffleListDiv = document.getElementById("RightBox");

  $('#ParticipateGuest').click(function() {
    
    if (raffleSignupDiv.style.display === "none") {

        raffleSignupDiv.style.display = "block";
        raffleListDiv.style.display = "none";
        $("#AccountLink").css("display", "none");
        $("#ParticipateGuest").css("display", "none");
        $('#RaffleSignup').attr('novalidate', 'true');
        $('#currentRaffleInput').val(JSON.stringify(currentRaffle));
       // Save the raffle into a hidden field in the form
       // Send it along with the user details to the participation logic 
    } 
  
    
  });

  $('#ToggleParticipate').click(function() {
    if (raffleListDiv.style.display === "none") {
        raffleSignupDiv.style.display = "none";
        raffleListDiv.style.display = "flex";
        $("#AccountLink").css("display", "block");
        $("#ParticipateGuest").css("display", "block");
    }
  });
  
}); 

